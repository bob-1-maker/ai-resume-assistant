<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, ElLoading } from 'element-plus'
import draggable from 'vuedraggable'
import { useResumeStore } from '@/store'
import AIGenerate from './AIGenerate.vue'
import AIOptimize from './AIOptimize.vue'
import EducationForm from './EducationForm.vue'
import WorkForm from './WorkForm.vue'
import ProjectForm from './ProjectForm.vue'
import SkillsForm from './SkillsForm.vue'
import ExportComponent from './ExportComponent.vue'

const resumeStore = useResumeStore()

const isPreviewMode = ref(false)
const isLoading = ref(false)
const exportComponent = ref<any>(null)

const modules = ref([
  { id: 'basic', name: '个人信息' },
  { id: 'education', name: '教育经历' },
  { id: 'work', name: '工作经历' },
  { id: 'project', name: '项目经验' },
  { id: 'skills', name: '技能证书' }
])

const templates = [
  { id: 'simple', name: '简约单栏' },
  { id: 'business', name: '商务双栏' },
  { id: 'campus', name: '校园风' }
]

const currentTemplate = computed(() => resumeStore.activeTemplate)

const moduleOrder = computed({
  get: () => {
    if (!resumeStore.currentResume) return modules.value.map(m => m.id)
    return resumeStore.currentResume.moduleOrder || modules.value.map(m => m.id)
  },
  set: (value) => {
    if (resumeStore.currentResume) {
      const updatedResume = {
        ...resumeStore.currentResume,
        moduleOrder: value
      }
      resumeStore.saveResume(updatedResume)
    }
  }
})

const sortedModules = computed(() => {
  return moduleOrder.value.map(id => modules.value.find(m => m.id === id)).filter(Boolean)
})

const handleTemplateChange = async (template: string) => {
  isLoading.value = true
  
  const loading = ElLoading.service({
    lock: true,
    text: '切换模板中...',
    background: 'rgba(0, 0, 0, 0.7)'
  })
  
  try {
    await new Promise(resolve => setTimeout(resolve, 800))
    resumeStore.setActiveTemplate(template)
    ElMessage.success('模板切换成功！')
  } finally {
    loading.close()
    isLoading.value = false
  }
}

const togglePreviewMode = () => {
  isPreviewMode.value = !isPreviewMode.value
}

const handleDragEnd = () => {
  if (resumeStore.currentResume) {
    const updatedResume = {
      ...resumeStore.currentResume,
      moduleOrder: moduleOrder.value
    }
    resumeStore.saveResume(updatedResume)
    ElMessage.success('模块顺序已保存！')
  }
}
</script>

<template>
  <div class="resume-builder">
    <!-- 模板选择和模式切换 -->
    <div class="builder-header">
      <div class="template-selector">
        <el-button
          v-for="template in templates"
          :key="template.id"
          :type="currentTemplate === template.id ? 'primary' : 'default'"
          @click="handleTemplateChange(template.id)"
          :disabled="isLoading"
        >
          {{ template.name }}
        </el-button>
      </div>
      
      <div class="mode-toggle">
        <el-dropdown v-if="isPreviewMode">
          <el-button type="primary">
            <el-icon><Download /></el-icon>
            导出
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="$refs.exportComponent?.exportPDF()">
                <el-icon><Document /></el-icon>
                导出 PDF
              </el-dropdown-item>
              <el-dropdown-item @click="$refs.exportComponent?.exportImage()">
                <el-icon><Picture /></el-icon>
                导出图片
              </el-dropdown-item>
              <el-dropdown-item @click="$refs.exportComponent?.exportJSON()">
                <el-icon><DataAnalysis /></el-icon>
                导出 JSON
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button
          type="success"
          @click="togglePreviewMode"
          :icon="isPreviewMode ? 'Edit' : 'View'"
        >
          {{ isPreviewMode ? '编辑模式' : '预览模式' }}
        </el-button>
      </div>
    </div>
    
    <!-- 导出功能（始终渲染，以便在预览模式下也能访问） -->
    <ExportComponent ref="exportComponent" v-show="!isPreviewMode" />
    
    <!-- 编辑模式 -->
    <div v-if="!isPreviewMode" class="edit-mode">
      <!-- AI 生成 -->
      <AIGenerate />
      
      <!-- AI 优化 -->
      <AIOptimize />
      
      <!-- 教育经历 -->
      <EducationForm />
      
      <!-- 工作经历 -->
      <WorkForm />
      
      <!-- 项目经验 -->
      <ProjectForm />
      
      <!-- 技能列表 -->
      <SkillsForm />
      
      <!-- 模块排序 -->
      <el-card class="modules-card">
        <template #header>
          <div class="card-header">
            <span>模块排序</span>
            <el-tooltip content="拖拽调整模块顺序">
              <el-icon class="help-icon"><QuestionFilled /></el-icon>
            </el-tooltip>
          </div>
        </template>
        
        <draggable
          v-model="moduleOrder"
          item-key="id"
          @end="handleDragEnd"
          class="modules-list"
        >
          <template #item="{ element }">
            <div class="module-item">
              <el-icon class="drag-icon"><Menu /></el-icon>
              <span>{{ modules.find(m => m.id === element)?.name }}</span>
            </div>
          </template>
        </draggable>
      </el-card>
      
      <!-- 模块内容 -->
      <div class="modules-content">
        <div v-for="moduleId in moduleOrder" :key="moduleId" class="module-section">
          <BasicInfoForm v-if="moduleId === 'basic'" />
          <!-- 其他模块组件后续添加 -->
          <div v-else class="placeholder-module">
            <el-empty :description="`${modules.find(m => m.id === moduleId)?.name}模块开发中`" />
          </div>
        </div>
      </div>
    </div>
    
    <!-- 预览模式 -->
    <div v-else class="preview-mode">
      <div
        v-if="isLoading"
        class="template-loading"
      >
        <el-icon class="loading-icon"><Loading /></el-icon>
        <span style="margin-left: 10px;">加载模板中...</span>
      </div>
      
      <div
        v-else
        class="resume-preview"
        :class="`tmpl-${currentTemplate}`"
      >
        <!-- 简约单栏模板 -->
        <div v-if="currentTemplate === 'simple'" class="tmpl-simple">
          <!-- 个人信息 -->
          <div v-if="moduleOrder.includes('basic')" class="section basic-info">
            <h1>{{ resumeStore.currentResume?.basic.name || '姓名' }}</h1>
            <div class="contact">
              <span v-if="resumeStore.currentResume?.basic.phone">{{ resumeStore.currentResume.basic.phone }}</span>
              <span v-if="resumeStore.currentResume?.basic.email"> | {{ resumeStore.currentResume.basic.email }}</span>
              <span v-if="resumeStore.currentResume?.basic.location"> | {{ resumeStore.currentResume.basic.location }}</span>
            </div>
            <div class="contact">
              <span v-if="resumeStore.currentResume?.basic.position">{{ resumeStore.currentResume.basic.position }}</span>
              <span v-if="resumeStore.currentResume?.basic.expectedSalary"> | {{ resumeStore.currentResume.basic.expectedSalary }}</span>
            </div>
            <div class="summary" v-if="resumeStore.currentResume?.basic.summary">
              {{ resumeStore.currentResume.basic.summary }}
            </div>
          </div>
          
          <!-- 教育经历 -->
          <div v-if="moduleOrder.includes('education')" class="section">
            <div class="section-title">教育经历</div>
            <div v-if="resumeStore.currentResume?.education.length">
              <div v-for="edu in resumeStore.currentResume.education" :key="edu.id" class="education-item">
                <div class="item-header">
                  <span class="item-title">{{ edu.school }}</span>
                  <span class="item-period">{{ edu.startDate }} - {{ edu.endDate }}</span>
                </div>
                <div class="item-subtitle">{{ edu.degree }} | {{ edu.major }}</div>
                <div class="item-description" v-if="edu.description">{{ edu.description }}</div>
              </div>
            </div>
            <div v-else class="empty-section">暂无教育经历</div>
          </div>
          
          <!-- 工作经历 -->
          <div v-if="moduleOrder.includes('work')" class="section">
            <div class="section-title">工作经历</div>
            <div v-if="resumeStore.currentResume?.work.length">
              <div v-for="work in resumeStore.currentResume.work" :key="work.id" class="work-item">
                <div class="item-header">
                  <span class="item-title">{{ work.position }}</span>
                  <span class="item-period">{{ work.startDate }} - {{ work.endDate }}</span>
                </div>
                <div class="item-subtitle">{{ work.company }}</div>
                <div class="item-description">{{ work.description }}</div>
              </div>
            </div>
            <div v-else class="empty-section">暂无工作经历</div>
          </div>
          
          <!-- 项目经验 -->
          <div v-if="moduleOrder.includes('project')" class="section">
            <div class="section-title">项目经验</div>
            <div v-if="resumeStore.currentResume?.project.length">
              <div v-for="project in resumeStore.currentResume.project" :key="project.id" class="project-item">
                <div class="item-header">
                  <span class="item-title">{{ project.name }}</span>
                  <span class="item-period">{{ project.startDate }} - {{ project.endDate }}</span>
                </div>
                <div class="item-subtitle">{{ project.role }}</div>
                <div class="item-description">{{ project.description }}</div>
                <div class="item-technologies" v-if="project.technologies.length">
                  <span class="tech-label">技术栈：</span>
                  <span v-for="tech in project.technologies" :key="tech" class="tech-tag">{{ tech }}</span>
                </div>
              </div>
            </div>
            <div v-else class="empty-section">暂无项目经验</div>
          </div>
          
          <!-- 技能证书 -->
          <div v-if="moduleOrder.includes('skills')" class="section">
            <div class="section-title">技能证书</div>
            <div v-if="resumeStore.currentResume?.skills.length" class="skills">
              <span v-for="skill in resumeStore.currentResume.skills" :key="skill.id" class="skill-item">
                {{ skill.name }} ({{ skill.level }})
              </span>
            </div>
            <div v-else class="empty-section">暂无技能证书</div>
          </div>
        </div>
        
        <!-- 商务双栏模板 -->
        <div v-else-if="currentTemplate === 'business'" class="tmpl-business">
          <div class="resume-container">
            <!-- 侧边栏 -->
            <div class="sidebar">
              <!-- 个人信息 -->
              <div v-if="moduleOrder.includes('basic')" class="section">
                <div class="section-title">基本信息</div>
                <div class="basic-info">
                  <h1>{{ resumeStore.currentResume?.basic.name || '姓名' }}</h1>
                  <div class="contact" v-if="resumeStore.currentResume?.basic.phone">
                    {{ resumeStore.currentResume.basic.phone }}
                  </div>
                  <div class="contact" v-if="resumeStore.currentResume?.basic.email">
                    {{ resumeStore.currentResume.basic.email }}
                  </div>
                  <div class="contact" v-if="resumeStore.currentResume?.basic.location">
                    {{ resumeStore.currentResume.basic.location }}
                  </div>
                  <div class="summary" v-if="resumeStore.currentResume?.basic.summary">
                    {{ resumeStore.currentResume.basic.summary }}
                  </div>
                </div>
              </div>
              
              <!-- 技能证书 -->
              <div v-if="moduleOrder.includes('skills')" class="section">
                <div class="section-title">技能</div>
                <div v-if="resumeStore.currentResume?.skills.length" class="skills">
                  <span v-for="skill in resumeStore.currentResume.skills" :key="skill.id" class="skill-item">
                    {{ skill.name }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- 主内容 -->
            <div class="main-content">
              <!-- 求职意向 -->
              <div v-if="moduleOrder.includes('basic') && resumeStore.currentResume?.basic.position" class="section">
                <div class="section-title">求职意向</div>
                <div class="position-info">
                  <div class="item-title">{{ resumeStore.currentResume.basic.position }}</div>
                  <div v-if="resumeStore.currentResume.basic.expectedSalary" class="item-subtitle">
                    期望薪资：{{ resumeStore.currentResume.basic.expectedSalary }}
                  </div>
                </div>
              </div>
              
              <!-- 教育经历 -->
              <div v-if="moduleOrder.includes('education')" class="section">
                <div class="section-title">教育经历</div>
                <div v-if="resumeStore.currentResume?.education.length">
                  <div v-for="edu in resumeStore.currentResume.education" :key="edu.id" class="education-item">
                    <div class="item-header">
                      <span class="item-title">{{ edu.school }}</span>
                      <span class="item-period">{{ edu.startDate }} - {{ edu.endDate }}</span>
                    </div>
                    <div class="item-subtitle">{{ edu.degree }} | {{ edu.major }}</div>
                    <div class="item-description" v-if="edu.description">{{ edu.description }}</div>
                  </div>
                </div>
              </div>
              
              <!-- 工作经历 -->
              <div v-if="moduleOrder.includes('work')" class="section">
                <div class="section-title">工作经历</div>
                <div v-if="resumeStore.currentResume?.work.length">
                  <div v-for="work in resumeStore.currentResume.work" :key="work.id" class="work-item">
                    <div class="item-header">
                      <span class="item-title">{{ work.position }}</span>
                      <span class="item-period">{{ work.startDate }} - {{ work.endDate }}</span>
                    </div>
                    <div class="item-subtitle">{{ work.company }}</div>
                    <div class="item-description">{{ work.description }}</div>
                  </div>
                </div>
              </div>
              
              <!-- 项目经验 -->
              <div v-if="moduleOrder.includes('project')" class="section">
                <div class="section-title">项目经验</div>
                <div v-if="resumeStore.currentResume?.project.length">
                  <div v-for="project in resumeStore.currentResume.project" :key="project.id" class="project-item">
                    <div class="item-header">
                      <span class="item-title">{{ project.name }}</span>
                      <span class="item-period">{{ project.startDate }} - {{ project.endDate }}</span>
                    </div>
                    <div class="item-subtitle">{{ project.role }}</div>
                    <div class="item-description">{{ project.description }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 校园风模板 -->
        <div v-else-if="currentTemplate === 'campus'" class="tmpl-campus">
          <!-- 个人信息 -->
          <div v-if="moduleOrder.includes('basic')" class="section basic-info">
            <h1>{{ resumeStore.currentResume?.basic.name || '姓名' }}</h1>
            <div class="contact">
              <span v-if="resumeStore.currentResume?.basic.phone">{{ resumeStore.currentResume.basic.phone }}</span>
              <span v-if="resumeStore.currentResume?.basic.email"> | {{ resumeStore.currentResume.basic.email }}</span>
            </div>
            <div class="contact">
              <span v-if="resumeStore.currentResume?.basic.position">{{ resumeStore.currentResume.basic.position }}</span>
            </div>
            <div class="summary" v-if="resumeStore.currentResume?.basic.summary">
              {{ resumeStore.currentResume.basic.summary }}
            </div>
          </div>
          
          <!-- 教育经历 -->
          <div v-if="moduleOrder.includes('education')" class="section">
            <div class="section-title">教育经历</div>
            <div v-if="resumeStore.currentResume?.education.length">
              <div v-for="edu in resumeStore.currentResume.education" :key="edu.id" class="education-item">
                <div class="item-header">
                  <span class="item-title">{{ edu.school }}</span>
                  <span class="item-period">{{ edu.startDate }} - {{ edu.endDate }}</span>
                </div>
                <div class="item-subtitle">{{ edu.degree }} | {{ edu.major }}</div>
                <div class="item-description" v-if="edu.description">{{ edu.description }}</div>
              </div>
            </div>
            <div v-else class="empty-section">暂无教育经历</div>
          </div>
          
          <!-- 项目经验 -->
          <div v-if="moduleOrder.includes('project')" class="section">
            <div class="section-title">项目经验</div>
            <div v-if="resumeStore.currentResume?.project.length">
              <div v-for="project in resumeStore.currentResume.project" :key="project.id" class="project-item">
                <div class="item-header">
                  <span class="item-title">{{ project.name }}</span>
                  <span class="item-period">{{ project.startDate }} - {{ project.endDate }}</span>
                </div>
                <div class="item-subtitle">{{ project.role }}</div>
                <div class="item-description">{{ project.description }}</div>
              </div>
            </div>
            <div v-else class="empty-section">暂无项目经验</div>
          </div>
          
          <!-- 工作经历 -->
          <div v-if="moduleOrder.includes('work')" class="section">
            <div class="section-title">实习经历</div>
            <div v-if="resumeStore.currentResume?.work.length">
              <div v-for="work in resumeStore.currentResume.work" :key="work.id" class="work-item">
                <div class="item-header">
                  <span class="item-title">{{ work.position }}</span>
                  <span class="item-period">{{ work.startDate }} - {{ work.endDate }}</span>
                </div>
                <div class="item-subtitle">{{ work.company }}</div>
                <div class="item-description">{{ work.description }}</div>
              </div>
            </div>
            <div v-else class="empty-section">暂无实习经历</div>
          </div>
          
          <!-- 技能证书 -->
          <div v-if="moduleOrder.includes('skills')" class="section">
            <div class="section-title">技能证书</div>
            <div v-if="resumeStore.currentResume?.skills.length" class="skills">
              <span v-for="skill in resumeStore.currentResume.skills" :key="skill.id" class="skill-item">
                {{ skill.name }}
              </span>
            </div>
            <div v-else class="empty-section">暂无技能证书</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.resume-builder {
  min-height: calc(100vh - 60px);
  background: #f5f7fa;
}

.builder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: white;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.template-selector {
  display: flex;
  gap: 10px;
}

.mode-toggle {
  display: flex;
  gap: 10px;
}

.edit-mode {
  padding: 20px;
}

.modules-card {
  margin-bottom: 20px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.help-icon {
  color: #909399;
  cursor: help;
}

.modules-list {
  min-height: 200px;
}

.module-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 8px;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  cursor: move;
  transition: all 0.3s;
}

.module-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.drag-icon {
  margin-right: 12px;
  color: #c0c4cc;
  cursor: grab;
}

.drag-icon:active {
  cursor: grabbing;
}

.modules-content {
  max-width: 1200px;
  margin: 0 auto;
}

.module-section {
  margin-bottom: 30px;
}

.placeholder-module {
  background: white;
  padding: 40px;
  border-radius: 8px;
  border: 1px dashed #dcdfe6;
}

.preview-mode {
  padding: 40px 20px;
  background: #f5f7fa;
}

.resume-preview {
  width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  background: white;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  position: relative;
}

.template-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 297mm;
  width: 210mm;
  margin: 0 auto;
  background: white;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}

.loading-icon {
  font-size: 24px;
  color: #409eff;
  animation: spin 1s infinite linear;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.empty-section {
  color: #909399;
  font-style: italic;
  padding: 10px 0;
}

.item-technologies {
  margin-top: 5px;
  font-size: 10pt;
}

.tech-label {
  color: #7f8c8d;
  margin-right: 5px;
}

.tech-tag {
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 3px;
  margin-right: 5px;
  font-size: 9pt;
  color: #666;
}

@media (max-width: 768px) {
  .builder-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 10px;
  }
  
  .template-selector {
    flex-wrap: wrap;
  }
  
  .edit-mode {
    padding: 10px;
  }
  
  .resume-preview {
    width: 100%;
    min-height: auto;
  }
  
  .preview-mode {
    padding: 20px 10px;
  }
}
</style>
