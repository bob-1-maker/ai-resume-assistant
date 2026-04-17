<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, ref, watch } from 'vue'
import { ElLoading, ElMessage, ElMessageBox } from 'element-plus'
import { useResumeStore } from '@/store'
import { debounce } from '@/utils/debounce'
import ResumeBuilderHeader from './ResumeBuilderHeader.vue'
import ResumeBuilderEditPanel from './ResumeBuilderEditPanel.vue'
import ResumeBuilderPreview from './ResumeBuilderPreview.vue'

const AIResumeAnalysis = defineAsyncComponent(() => import('./AIResumeAnalysis.vue'))
const ExportComponent = defineAsyncComponent(() => import('./ExportComponent.vue'))

const resumeStore = useResumeStore()

const debouncedUpdatePreview = debounce(() => {}, 800)

const isPreviewMode = ref(false)
const isLoading = ref(false)
const exportComponent = ref<any>(null)
const showAiAnalysis = ref(false)

const modules = [
  { id: 'basic', name: '个人信息' },
  { id: 'education', name: '教育经历' },
  { id: 'work', name: '工作经历' },
  { id: 'project', name: '项目经验' },
  { id: 'skills', name: '技能证书' },
  { id: 'awards', name: '荣誉奖项' },
  { id: 'selfEvaluation', name: '自我评价' }
]

const templates = [
  { id: 'business', name: '商务简约风' },
  { id: 'tech', name: '科技极客风' },
  { id: 'campus', name: '应届清新风' }
]

const currentTemplate = computed(() => resumeStore.activeTemplate)

const moduleOrder = computed({
  get: () => {
    if (!resumeStore.currentResume) {
      return modules.map((module) => module.id)
    }

    return resumeStore.currentResume.moduleOrder || modules.map((module) => module.id)
  },
  set: (value: string[]) => {
    if (!resumeStore.currentResume) {
      return
    }

    void resumeStore.saveResume({
      ...resumeStore.currentResume,
      moduleOrder: value
    })
  }
})

const loadTemplateStyle = (template: string) => {
  const oldLink = document.getElementById('template-style')

  if (oldLink) {
    oldLink.remove()
  }

  const validTemplates = ['business', 'tech', 'campus']
  const templateName = validTemplates.includes(template) ? template : 'business'

  const link = document.createElement('link')
  link.id = 'template-style'
  link.rel = 'stylesheet'
  link.href = `/templates/template-${templateName}.css`
  document.head.appendChild(link)
}

const handleTemplateChange = async (template: string) => {
  isLoading.value = true

  const loading = ElLoading.service({
    lock: true,
    text: '切换模板中...',
    background: 'rgba(0, 0, 0, 0.7)'
  })

  try {
    loadTemplateStyle(template)
    await new Promise((resolve) => setTimeout(resolve, 500))
    resumeStore.setActiveTemplate(template)
    ElMessage.success('模板切换成功')
  } catch {
    ElMessage.error('模板切换失败，请重试')
  } finally {
    loading.close()
    isLoading.value = false
  }
}

watch(
  () => resumeStore.currentResume,
  () => {
    debouncedUpdatePreview()
  },
  { deep: true }
)

onMounted(() => {
  loadTemplateStyle(resumeStore.activeTemplate)
})

const togglePreviewMode = () => {
  isPreviewMode.value = !isPreviewMode.value
}

const moveModule = (index: number, direction: number) => {
  if (!resumeStore.currentResume) {
    return
  }

  const nextOrder = [...moduleOrder.value]
  const nextIndex = index + direction

  if (nextIndex < 0 || nextIndex >= nextOrder.length) {
    return
  }

  ;[nextOrder[index], nextOrder[nextIndex]] = [nextOrder[nextIndex], nextOrder[index]]
  moduleOrder.value = nextOrder
  ElMessage.success('模块顺序已保存')
}

const handleCreateNewResume = async () => {
  try {
    const { value: name } = await ElMessageBox.prompt('请输入新简历名称', '新建简历', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPlaceholder: '例如：前端开发简历',
      inputValidator: (value) => {
        if (!value || value.trim() === '') {
          return '简历名称不能为空'
        }

        return true
      }
    })

    if (name) {
      resumeStore.createNewResume(name.trim())
      ElMessage.success('新简历创建成功')
    }
  } catch {
  }
}
</script>

<template>
  <div class="resume-builder">
    <ResumeBuilderHeader
      :templates="templates"
      :current-template="currentTemplate"
      :is-loading="isLoading"
      :is-preview-mode="isPreviewMode"
      @create-resume="handleCreateNewResume"
      @change-template="handleTemplateChange"
      @toggle-preview="togglePreviewMode"
      @open-ai="showAiAnalysis = true"
      @export-pdf="exportComponent?.exportPDF?.()"
      @export-image="exportComponent?.exportImage?.()"
      @export-word="exportComponent?.exportWord?.()"
      @export-json="exportComponent?.exportJSON?.()"
    />

    <ExportComponent ref="exportComponent" v-show="!isPreviewMode" />

    <ResumeBuilderEditPanel
      v-if="!isPreviewMode"
      :module-order="moduleOrder"
      :modules="modules"
      @move-module="moveModule"
    />

    <ResumeBuilderPreview
      v-else
      :is-loading="isLoading"
      :current-template="currentTemplate"
      :module-order="moduleOrder"
    />

    <el-drawer
      v-model="showAiAnalysis"
      title="简历 AI 分析"
      direction="rtl"
      :size="700"
    >
      <AIResumeAnalysis />
    </el-drawer>
  </div>
</template>

<style scoped>
.resume-builder {
  min-height: calc(100vh - 60px);
  background: #f5f7fa;
}
</style>
