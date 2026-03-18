<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage, ElLoading } from 'element-plus'
import { useResumeStore } from '@/store'
import AIGenerate from './AIGenerate.vue'
import AIOptimize from './AIOptimize.vue'
import BasicInfoForm from './BasicInfoForm.vue'
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
  { id: 'business', name: '商务简约风' },
  { id: 'tech', name: '科技极客风' },
  { id: 'campus', name: '应届生清新风' }
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

// 动态加载模板样式
const loadTemplateStyle = (template: string) => {
  // 移除旧的模板样式
  const oldLink = document.getElementById('template-style')
  if (oldLink) {
    oldLink.remove()
  }
  
  // 创建新的样式链接
  const link = document.createElement('link')
  link.id = 'template-style'
  link.rel = 'stylesheet'
  link.href = `/templates/template-${template}.css`
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
    // 加载模板样式
    loadTemplateStyle(template)
    await new Promise(resolve => setTimeout(resolve, 500))
    resumeStore.setActiveTemplate(template)
    ElMessage.success('模板切换成功！')
  } finally {
    loading.close()
    isLoading.value = false
  }
}

// 组件挂载时加载当前模板样式
onMounted(() => {
  loadTemplateStyle(resumeStore.activeTemplate)
})

const togglePreviewMode = () => {
  isPreviewMode.value = !isPreviewMode.value
}

const moveModule = (index: number, direction: number) => {
  if (!resumeStore.currentResume) return
  
  const newOrder = [...moduleOrder.value]
  const newIndex = index + direction
  
  if (newIndex >= 0 && newIndex < newOrder.length) {
    // 交换位置
    [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]]
    moduleOrder.value = newOrder
    
    const updatedResume = {
      ...resumeStore.currentResume,
      moduleOrder: newOrder
    }
    resumeStore.saveResume(updatedResume)
    ElMessage.success('模块顺序已保存！')
  }
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
        
        <div class="modules-list">
          <div
            v-for="(element, index) in moduleOrder"
            :key="element"
            class="module-item"
          >
            <el-icon class="drag-icon"><Menu /></el-icon>
            <span>{{ modules.find(m => m.id === element)?.name }}</span>
            <div class="module-controls">
              <el-button
                type="text"
                size="small"
                @click="moveModule(index, -1)"
                :disabled="index === 0"
              >
                <el-icon><ArrowUp /></el-icon>
              </el-button>
              <el-button
                type="text"
                size="small"
                @click="moveModule(index, 1)"
                :disabled="index === moduleOrder.length - 1"
              >
                <el-icon><ArrowDown /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
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
        <!-- 科技极客风模板 -->
        <div v-if="currentTemplate === 'tech'" class="resume-container">
          <div class="resume-title">RESUME</div>
          
          <!-- 个人信息 -->
          <div class="personal-info">
            <div class="name-section">
              <h1 class="resume-name">{{ resumeStore.currentResume?.basic.name || '你的名字' }}</h1>
              <p class="resume-summary">{{ resumeStore.currentResume?.basic.summary || '一句话介绍自己，告诉HR为什么选择你而不是别人' }}</p>
              <div class="contact-info">
                <span v-if="resumeStore.currentResume?.basic.age">{{ resumeStore.currentResume.basic.age }} | </span>
                <span v-if="resumeStore.currentResume?.basic.workYears">{{ resumeStore.currentResume.basic.workYears }} | </span>
                <span v-if="resumeStore.currentResume?.basic.phone">{{ resumeStore.currentResume.basic.phone }} | </span>
                <span v-if="resumeStore.currentResume?.basic.email">{{ resumeStore.currentResume.basic.email }}</span>
              </div>
            </div>
            <div class="avatar-section">
              <img class="avatar" src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20avatar%20portrait%20of%20a%20young%20Chinese%20man%2C%20clean%20background%2C%20business%20style&image_size=square" alt="头像" />
            </div>
          </div>

          <!-- 求职意向 -->
          <div v-if="moduleOrder.includes('basic') && resumeStore.currentResume?.basic.position" class="resume-section">
            <h3 class="section-title">
              <span class="section-icon">🎯</span>
              求职意向
            </h3>
            <div class="section-content">
              <div class="job-intent">
                <div class="intent-item">
                  <span class="intent-icon">🔧</span>
                  <span>意向岗位：{{ resumeStore.currentResume.basic.position }}</span>
                </div>
                <div class="intent-item">
                  <span class="intent-icon">📍</span>
                  <span>意向城市：{{ resumeStore.currentResume.basic.location || '填写城市' }}</span>
                </div>
                <div class="intent-item">
                  <span class="intent-icon">💰</span>
                  <span>薪资要求：{{ resumeStore.currentResume.basic.expectedSalary || '填写薪资' }}</span>
                </div>
                <div class="intent-item">
                  <span class="intent-icon">⏰</span>
                  <span>入职时间：{{ resumeStore.currentResume.basic.availability || '填写入职时间' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 教育背景 -->
          <div v-if="moduleOrder.includes('education')" class="resume-section">
            <h3 class="section-title">
              <span class="section-icon">🎓</span>
              教育背景
            </h3>
            <div class="section-content">
              <div v-if="resumeStore.currentResume?.education.length">
                <div v-for="edu in resumeStore.currentResume.education" :key="edu.id" class="education-item">
                  <div class="education-header">
                    <div class="education-time">{{ edu.startDate }} - {{ edu.endDate }}</div>
                    <div class="education-school">{{ edu.school }}</div>
                  </div>
                  <div class="education-major">{{ edu.major }} {{ edu.degree }}</div>
                  <div class="education-description" v-if="edu.description">{{ edu.description }}</div>
                </div>
              </div>
              <div v-else class="empty-section">
                <div class="education-item">
                  <div class="education-header">
                    <div class="education-time">设置时间</div>
                    <div class="education-school">填写学校名称</div>
                  </div>
                  <div class="education-major">填写专业名称</div>
                  <div class="education-description">详细描述你的教育经历，突出重点，成绩优异的话请写上GPA及排名等信息，如：GPA：3.72/4（专业前10%） GRE：324</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 工作经历 / 实习经历 -->
          <div v-if="moduleOrder.includes('work')" class="resume-section">
            <h3 class="section-title">
              <span class="section-icon">💼</span>
              {{ currentTemplate === 'campus' ? '实习经历' : '工作经历' }}
            </h3>
            <div class="section-content">
              <div v-if="resumeStore.currentResume?.work.length">
                <div v-for="work in resumeStore.currentResume.work" :key="work.id" class="work-item">
                  <div class="work-header">
                    <div class="work-time">{{ work.startDate }} - {{ work.endDate }}</div>
                    <div class="work-company">{{ work.company }}</div>
                  </div>
                  <div class="work-position">{{ work.position }}</div>
                  <div class="work-description">{{ work.description }}</div>
                </div>
              </div>
              <div v-else class="empty-section">
                <div class="work-item">
                  <div class="work-header">
                    <div class="work-time">设置时间</div>
                    <div class="work-company">填写公司名称</div>
                  </div>
                  <div class="work-position">填写职位名称</div>
                  <div class="work-description">详细描述你的职责范围、工作任务及取得的成绩，工作经验的时间采取倒叙形式，最近经历写在前面，描述尽量具体简洁，工作经验的描述与目标岗位的招聘要求尽量匹配，用词精准。</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 技能特长 -->
          <div v-if="moduleOrder.includes('skills')" class="resume-section">
            <h3 class="section-title">
              <span class="section-icon">⚡</span>
              技能特长
            </h3>
            <div class="section-content">
              <div class="skills-container">
                <div v-if="resumeStore.currentResume?.skills.length">
                  <span v-for="skill in resumeStore.currentResume.skills" :key="skill.id" style="margin-right: 10px; font-size: 11px;">
                    {{ skill.name }}
                  </span>
                </div>
                <div v-else>暂无技能证书</div>
              </div>
              <div class="add-skills">+ 添加技能特长</div>
            </div>
          </div>

          <!-- 自我评价 -->
          <div class="resume-section">
            <h3 class="section-title">
              <span class="section-icon">📝</span>
              自我评价
            </h3>
            <div class="section-content">
              <div class="self-evaluation">
                篇幅不要太长，注意结合简历整体的美观度，如果真的有很多话要说，建议以求职信的形式附上。自我评价应做到突出自身符合目标岗位要求的"卖点"，避免过多使用形容词，而应该通过数据及实例来对自身价值进行深化。
              </div>
            </div>
          </div>
        </div>
        
        <!-- 应届清新风模板 -->
        <div v-else-if="currentTemplate === 'campus'" class="resume-container">
          <!-- 个人信息部分 -->
          <div class="resume-personal">
            <div class="resume-info">
              <h1 class="resume-name">{{ resumeStore.currentResume?.basic.name || '你的名字' }}</h1>
              <p class="resume-summary">{{ resumeStore.currentResume?.basic.summary || '一句话介绍自己，告诉HR为什么选择你而不是别人' }}</p>
              <div class="resume-contact">
                <span class="contact-item">
                  <span class="contact-icon">📅</span> {{ resumeStore.currentResume?.basic.age || '年龄' }}
                </span>
                <span class="contact-item">
                  <span class="contact-icon">💼</span> {{ resumeStore.currentResume?.basic.workYears || '工作年限' }}
                </span>
                <span class="contact-item">
                  <span class="contact-icon">📞</span> {{ resumeStore.currentResume?.basic.phone || '联系电话' }}
                </span>
                <span class="contact-item">
                  <span class="contact-icon">✉️</span> {{ resumeStore.currentResume?.basic.email || '电子邮箱' }}
                </span>
              </div>
            </div>
            <div class="resume-avatar">
              <img class="avatar-img" src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20avatar%20portrait%20of%20a%20young%20Chinese%20man%2C%20clean%20background%2C%20business%20style&image_size=square" alt="头像" />
            </div>
          </div>
          
          <!-- 求职意向 -->
          <div class="resume-section">
            <h2 class="section-title">
              <span class="section-icon">🎯</span> 求职意向
            </h2>
            <div class="job-intent">
              <div class="intent-item">
                <span class="intent-icon">🔧</span>
                <span>{{ resumeStore.currentResume?.basic.position || '意向岗位' }}</span>
              </div>
              <div class="intent-item">
                <span class="intent-icon">📍</span>
                <span>{{ resumeStore.currentResume?.basic.location || '意向城市' }}</span>
              </div>
              <div class="intent-item">
                <span class="intent-icon">💰</span>
                <span>{{ resumeStore.currentResume?.basic.expectedSalary || '薪资要求' }}</span>
              </div>
              <div class="intent-item">
                <span class="intent-icon">⏰</span>
                <span>{{ resumeStore.currentResume?.basic.availability || '入职时间' }}</span>
              </div>
            </div>
          </div>
          
          <!-- 教育背景 -->
          <div class="resume-section">
            <h2 class="section-title">
              <span class="section-icon">🎓</span> 教育背景
            </h2>
            <div class="education-item">
              <div class="education-header">
                <span class="education-time">{{ resumeStore.currentResume?.education[0]?.startDate || '设置时间' }} - {{ resumeStore.currentResume?.education[0]?.endDate || '设置时间' }}</span>
                <span class="education-school">{{ resumeStore.currentResume?.education[0]?.school || '填写学校名称' }}</span>
                <span class="education-major">{{ resumeStore.currentResume?.education[0]?.major || '填写专业名称' }}</span>
              </div>
              <p class="education-description">
                {{ resumeStore.currentResume?.education[0]?.description || '尽量简洁，突出重点，成绩优异的话建议写上GPA及排名等信息，如：GPA: 3.7/4（专业前10%）GRE: 324' }}
              </p>
            </div>
          </div>
          
          <!-- 工作经验 -->
          <div class="resume-section">
            <h2 class="section-title">
              <span class="section-icon">💼</span> {{ currentTemplate === 'campus' ? '实习经历' : '工作经历' }}
            </h2>
            <div class="work-item">
              <div class="work-header">
                <span class="work-time">{{ resumeStore.currentResume?.work[0]?.startDate || '设置时间' }} - {{ resumeStore.currentResume?.work[0]?.endDate || '设置时间' }}</span>
                <span class="work-company">{{ resumeStore.currentResume?.work[0]?.company || '填写公司名称' }}</span>
                <span class="work-position">{{ resumeStore.currentResume?.work[0]?.position || '填写职位名称' }}</span>
              </div>
              <p class="work-description">
                {{ resumeStore.currentResume?.work[0]?.description || '详细描述你的职责范围、工作任务及取得的成绩，工作经验的时间采取倒叙形式，最近经历写在前面，描述尽量具体简洁，工作经验的描述与目标岗位的招聘要求尽量匹配，用词精准。' }}
              </p>
            </div>
          </div>
          
          <!-- 技能特长 -->
          <div class="resume-section">
            <h2 class="section-title">
              <span class="section-icon">🔧</span> 技能特长
            </h2>
            <div class="skills-container">
              <div v-if="resumeStore.currentResume?.skills.length">
                <span v-for="skill in resumeStore.currentResume.skills" :key="skill.id" style="margin-right: 10px; font-size: 11px;">
                  {{ skill.name }}
                </span>
              </div>
              <div v-else>暂无技能证书</div>
            </div>
            <div class="add-skills">+ 添加技能特长</div>
          </div>
          
          <!-- 自我评价 -->
          <div class="resume-section">
            <h2 class="section-title">
              <span class="section-icon">👤</span> 自我评价
            </h2>
            <p class="self-evaluation">
              篇幅不要太长，注意结合简历整体的美观度，如果真的有很多话要说，建议以求职信的形式附上。自我评价应做到突出自身符合目标岗位要求的「卖点」，避免过多使用形容词，而应该通过数据及实例来对自身价值进行深化。
            </p>
          </div>
        </div>

        <!-- 其他模板的布局 -->
        <div v-else class="resume-container">
            <!-- 侧边栏 -->
            <div class="resume-sidebar">
              <!-- 头像 -->
              <div class="avatar-section">
                <div class="avatar">
                  <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20avatar%20portrait%20of%20a%20young%20Chinese%20man%2C%20clean%20background%2C%20business%20style&image_size=square" alt="头像" />
                </div>
              </div>

              <!-- 个人信息 -->
              <div v-if="moduleOrder.includes('basic')" class="sidebar-section">
                <h3 class="sidebar-title">
                  <i class="icon">👤</i>
                  个人信息
                </h3>
                <div class="sidebar-content">
                  <div class="info-item" v-if="resumeStore.currentResume?.basic.age">
                    <span class="info-icon">📅</span>
                    <span>年龄：{{ resumeStore.currentResume.basic.age }}</span>
                  </div>
                  <div class="info-item" v-if="resumeStore.currentResume?.basic.workYears">
                    <span class="info-icon">💼</span>
                    <span>工作年限：{{ resumeStore.currentResume.basic.workYears }}</span>
                  </div>
                  <div class="info-item" v-if="resumeStore.currentResume?.basic.phone">
                    <span class="info-icon">📱</span>
                    <span>联系电话：{{ resumeStore.currentResume.basic.phone }}</span>
                  </div>
                  <div class="info-item" v-if="resumeStore.currentResume?.basic.email">
                    <span class="info-icon">📧</span>
                    <span>电子邮箱：{{ resumeStore.currentResume.basic.email }}</span>
                  </div>
                  <div class="info-item" v-if="resumeStore.currentResume?.basic.location">
                    <span class="info-icon">📍</span>
                    <span>所在城市：{{ resumeStore.currentResume.basic.location }}</span>
                  </div>
                </div>
              </div>

              <!-- 技能特长 -->
              <div v-if="moduleOrder.includes('skills')" class="sidebar-section">
                <h3 class="sidebar-title">
                  <i class="icon">⚡</i>
                  技能特长
                </h3>
                <div class="sidebar-content">
                  <div v-if="resumeStore.currentResume?.skills.length" class="skills-container">
                    <span v-for="skill in resumeStore.currentResume.skills" :key="skill.id" class="skill-item">
                      {{ skill.name }}
                    </span>
                  </div>
                  <div v-else class="empty-section">暂无技能证书</div>
                  <div class="add-button">+ 添加技能特长</div>
                </div>
              </div>

              <!-- 兴趣爱好 -->
              <div class="sidebar-section">
                <h3 class="sidebar-title">
                  <i class="icon">🎯</i>
                  兴趣爱好
                </h3>
                <div class="sidebar-content">
                  <div class="hobbies-container">
                    <span class="hobby-item">阅读</span>
                    <span class="hobby-item">旅行</span>
                    <span class="hobby-item">运动</span>
                  </div>
                  <div class="add-button">+ 添加兴趣爱好</div>
                </div>
              </div>
            </div>

            <!-- 主内容区 -->
            <div class="resume-main">
              <!-- 顶部信息 -->
              <div class="resume-header">
                <h1 class="resume-name">{{ resumeStore.currentResume?.basic.name || '你的名字' }}</h1>
                <p class="resume-summary">{{ resumeStore.currentResume?.basic.summary || '一句话介绍自己，告诉HR为什么选择你而不是别人' }}</p>
              </div>

              <!-- 求职意向 -->
              <div v-if="moduleOrder.includes('basic') && resumeStore.currentResume?.basic.position" class="main-section">
                <h3 class="section-title">
                  <span class="section-icon">🎯</span>
                  求职意向
                </h3>
                <div class="section-content">
                  <div class="job-intent">
                    <div class="intent-item">
                      <span class="intent-icon">🔧</span>
                      <span>意向岗位：{{ resumeStore.currentResume.basic.position }}</span>
                    </div>
                    <div class="intent-item">
                      <span class="intent-icon">📍</span>
                      <span>意向城市：{{ resumeStore.currentResume.basic.location || '填写城市' }}</span>
                    </div>
                    <div class="intent-item">
                      <span class="intent-icon">💰</span>
                      <span>薪资要求：{{ resumeStore.currentResume.basic.expectedSalary || '填写薪资' }}</span>
                    </div>
                    <div class="intent-item">
                      <span class="intent-icon">⏰</span>
                      <span>入职时间：{{ resumeStore.currentResume.basic.availability || '填写入职时间' }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 教育背景 -->
              <div v-if="moduleOrder.includes('education')" class="main-section">
                <h3 class="section-title">
                  <span class="section-icon">🎓</span>
                  教育背景
                </h3>
                <div class="section-content">
                  <div v-if="resumeStore.currentResume?.education.length">
                    <div v-for="edu in resumeStore.currentResume.education" :key="edu.id" class="education-item">
                      <div class="item-header">
                        <div class="item-period">{{ edu.startDate }} - {{ edu.endDate }}</div>
                        <div class="item-title">{{ edu.school }}</div>
                      </div>
                      <div class="item-meta">{{ edu.major }} {{ edu.degree }}</div>
                      <div class="item-description" v-if="edu.description">{{ edu.description }}</div>
                    </div>
                  </div>
                  <div v-else class="empty-section">
                    <div class="education-item">
                      <div class="item-header">
                        <div class="item-period">设置时间</div>
                        <div class="item-title">填写学校名称</div>
                      </div>
                      <div class="item-meta">填写专业名称</div>
                      <div class="item-description">详细描述你的教育经历，突出重点，成绩优异的话请写上GPA及排名等信息，如：GPA：3.72/4（专业前10%） GRE：324</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 工作经历 / 实习经历 -->
              <div v-if="moduleOrder.includes('work')" class="main-section">
                <h3 class="section-title">
                  <span class="section-icon">💼</span>
                  {{ currentTemplate === 'campus' ? '实习经历' : '工作经历' }}
                </h3>
                <div class="section-content">
                  <div v-if="resumeStore.currentResume?.work.length">
                    <div v-for="work in resumeStore.currentResume.work" :key="work.id" class="experience-item">
                      <div class="item-header">
                        <div class="item-period">{{ work.startDate }} - {{ work.endDate }}</div>
                        <div class="item-title">{{ work.position }}</div>
                      </div>
                      <div class="item-company">{{ work.company }}</div>
                      <div class="item-description">{{ work.description }}</div>
                    </div>
                  </div>
                  <div v-else class="empty-section">
                    <div class="experience-item">
                      <div class="item-header">
                        <div class="item-period">设置时间</div>
                        <div class="item-title">填写职位名称</div>
                      </div>
                      <div class="item-company">填写公司名称</div>
                      <div class="item-description">详细描述你的职责范围、工作任务及取得的成绩，工作经验的时间采取倒叙形式，最近经历写在前面，描述尽量具体简洁，工作经验的描述与目标岗位的招聘要求尽量匹配，用词精准。</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 荣誉奖项 -->
              <div class="main-section">
                <h3 class="section-title">
                  <span class="section-icon">🏆</span>
                  荣誉奖项
                </h3>
                <div class="section-content">
                  <div class="award-item">
                    <div class="item-header">
                      <div class="item-period">2024-06</div>
                      <div class="item-title">优秀员工奖</div>
                    </div>
                    <div class="item-description">详细描述你所获得的奖项荣誉，时间倒叙，与目标岗位相关性强的写在前面，只写有代表性的奖项即可，同年或同类别的奖项可进行适当合并。</div>
                  </div>
                </div>
              </div>

              <!-- 自我评价 -->
              <div class="main-section">
                <h3 class="section-title">
                  <span class="section-icon">📝</span>
                  自我评价
                </h3>
                <div class="section-content">
                  <div class="self-evaluation">
                    篇幅不要太长，注意结合简历整体的美观度，如果真的有很多话要说，建议以求职信的形式附上。自我评价应做到突出自身符合目标岗位要求的"卖点"，避免过多使用形容词，而应该通过数据及实例来对自身价值进行深化。
                  </div>
                </div>
              </div>
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
  transition: all 0.3s;
}

.module-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.drag-icon {
  margin-right: 12px;
  color: #c0c4cc;
}

.module-controls {
  margin-left: auto;
  display: flex;
  gap: 8px;
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
  padding: 20px;
  background: #f5f7fa;
  overflow-x: auto;
}

.resume-preview {
  width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  background: white;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  position: relative;
  max-width: 100%;
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
