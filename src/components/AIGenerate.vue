<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElLoading, ElMessageBox } from 'element-plus'
import { MagicStick, Loading, Refresh, DocumentCopy, Check, QuestionFilled } from '@element-plus/icons-vue'
import { useResumeStore } from '@/store'

const resumeStore = useResumeStore()

const isGenerating = ref(false)
const jobType = ref('')
const style = ref('简洁')
const generatedContent = ref('')
const showResult = ref(false)

const styles = [
  { label: '简洁', value: '简洁' },
  { label: '成果', value: '成果' },
  { label: '应届生', value: '应届生' }
]

const canGenerate = computed(() => {
  return jobType.value.trim() && resumeStore.currentResume
})

const filterSensitiveInfo = (data: any) => {
  if (!data) return data
  
  const sensitiveFields = ['phone', 'email']
  const filteredData = { ...data }
  
  sensitiveFields.forEach(field => {
    if (filteredData[field]) {
      filteredData[field] = '***'
    }
  })
  
  return filteredData
}

const generateWithAI = async () => {
  if (!canGenerate.value) {
    ElMessage.warning('请填写求职岗位和个人信息')
    return
  }
  
  isGenerating.value = true
  const loading = ElLoading.service({
    lock: true,
    text: 'AI 正在生成简历...',
    background: 'rgba(0, 0, 0, 0.7)'
  })
  
  try {
    const basicInfo = filterSensitiveInfo(resumeStore.currentResume?.basic)
    
    const response = await fetch('http://localhost:3000/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        basicInfo,
        jobDescription: jobType.value
      })
    })
    
    if (!response.ok) {
      throw new Error('API 调用失败')
    }
    
    const result = await response.json()
    
    if (result.code === 200) {
      generatedContent.value = result.data.content
      showResult.value = true
      ElMessage.success('AI 生成成功！' + result.msg)
      console.log('AI 生成结果:', result.data.content)
    } else {
      throw new Error(result.msg || '生成失败')
    }
  } catch (error) {
    console.error('AI 生成失败:', error)
    ElMessage.error('AI 生成失败，请检查后端服务或 API Key')
  } finally {
    loading.close()
    isGenerating.value = false
  }
}

const copyToClipboard = () => {
  navigator.clipboard.writeText(generatedContent.value).then(() => {
    ElMessage.success('内容已复制到剪贴板！')
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制')
  })
}

const applyToResume = () => {
  ElMessageBox.confirm('确定要将生成的内容应用到简历吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    if (resumeStore.currentResume) {
      // 解析生成的内容，提取信息
      const content = generatedContent.value
      const parsedInfo = parseGeneratedContent(content)
      
      // 更新简历数据
      const updatedResume = {
        ...resumeStore.currentResume,
        basic: {
          ...resumeStore.currentResume.basic,
          name: parsedInfo.name || resumeStore.currentResume.basic.name,
          position: parsedInfo.position || resumeStore.currentResume.basic.position,
          summary: parsedInfo.summary || resumeStore.currentResume.basic.summary
        },
        skills: parsedInfo.skills.length > 0 ? parsedInfo.skills : resumeStore.currentResume.skills,
        work: parsedInfo.work.length > 0 ? parsedInfo.work : resumeStore.currentResume.work,
        project: parsedInfo.project.length > 0 ? parsedInfo.project : resumeStore.currentResume.project
      }
      
      resumeStore.saveResume(updatedResume)
      ElMessage.success('已成功应用到简历！')
    }
  })
}

// 解析生成的内容
const parseGeneratedContent = (content: string) => {
  const result = {
    name: '',
    position: '',
    summary: '',
    skills: [],
    work: [],
    project: []
  }
  
  // 解析个人信息
  const personalInfoMatch = content.match(/## 个人信息[\s\S]*?(?=##|$)/)
  if (personalInfoMatch) {
    const personalInfo = personalInfoMatch[0]
    const nameMatch = personalInfo.match(/姓名：([^\n]+)/)
    const positionMatch = personalInfo.match(/求职岗位：([^\n]+)/)
    
    if (nameMatch) result.name = nameMatch[1].trim()
    if (positionMatch) result.position = positionMatch[1].trim()
  }
  
  // 解析专业技能
  const skillsMatch = content.match(/## 专业技能[\s\S]*?(?=##|$)/)
  if (skillsMatch) {
    const skills = skillsMatch[0]
    const skillLines = skills.split('\n').filter(line => line.trim().startsWith('-'))
    skillLines.forEach(line => {
      const skill = line.trim().replace(/^-\s*/, '').trim()
      if (skill) {
        result.skills.push({
          id: crypto.randomUUID(),
          name: skill,
          level: '熟练'
        })
      }
    })
  }
  
  // 解析工作经历
  const workMatch = content.match(/## 工作经历[\s\S]*?(?=##|$)/)
  if (workMatch) {
    const work = workMatch[0]
    const workLines = work.split('\n').filter(line => line.trim().startsWith('-'))
    workLines.forEach(line => {
      const workItem = line.trim().replace(/^-\s*/, '').trim()
      if (workItem) {
        result.work.push({
          id: crypto.randomUUID(),
          company: '公司名称',
          position: '职位',
          startDate: '',
          endDate: '',
          description: workItem
        })
      }
    })
  }
  
  // 解析项目经验
  const projectMatch = content.match(/## 项目经验[\s\S]*?(?=##|$)/)
  if (projectMatch) {
    const project = projectMatch[0]
    const projectLines = project.split('\n').filter(line => line.trim().startsWith('-'))
    projectLines.forEach(line => {
      const projectItem = line.trim().replace(/^-\s*/, '').trim()
      if (projectItem) {
        result.project.push({
          id: crypto.randomUUID(),
          name: '项目名称',
          startDate: '',
          endDate: '',
          role: '角色',
          description: projectItem,
          technologies: []
        })
      }
    })
  }
  
  return result
}
</script>

<template>
  <el-card class="ai-generate-card">
    <template #header>
      <div class="card-header">
        <span class="title">AI 简历生成</span>
        <el-tooltip content="使用 AI 智能生成简历内容">
          <el-icon class="help-icon"><QuestionFilled /></el-icon>
        </el-tooltip>
      </div>
    </template>
    
    <el-form class="ai-form">
      <el-form-item label="求职岗位" required>
        <el-input 
          v-model="jobType" 
          placeholder="请输入您的求职岗位，如：前端工程师"
          :disabled="isGenerating"
        />
      </el-form-item>
      
      <el-form-item label="生成风格">
        <el-select 
          v-model="style" 
          placeholder="请选择生成风格"
          style="width: 100%"
          :disabled="isGenerating"
        >
          <el-option
            v-for="item in styles"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item>
        <el-button 
          type="primary" 
          size="large" 
          @click="generateWithAI"
          :loading="isGenerating"
          :disabled="!canGenerate || isGenerating"
        >
          <el-icon v-if="!isGenerating"><MagicStick /></el-icon>
          <el-icon v-else><Loading /></el-icon>
          {{ isGenerating ? '生成中...' : 'AI 生成简历' }}
        </el-button>
        <el-button size="large" :disabled="isGenerating">
          <el-icon><Refresh /></el-icon>
          重新生成
        </el-button>
      </el-form-item>
    </el-form>
    
    <div class="tips">
      <el-alert
        title="提示"
        type="info"
        :closable="false"
        show-icon
      >
        <template #default>
          <ul>
            <li>生成前请确保已填写基本个人信息</li>
            <li>生成过程可能需要几秒钟时间</li>
            <li>生成结果可手动编辑调整</li>
            <li>敏感信息已自动过滤，不会上传</li>
          </ul>
        </template>
      </el-alert>
    </div>
    
    <!-- 生成结果展示区域 -->
    <el-card v-if="showResult" class="result-card" style="margin-top: 20px;">
      <template #header>
        <div class="result-header">
          <span class="result-title">AI 生成结果</span>
          <div class="result-actions">
            <el-button size="small" @click="copyToClipboard">
              <el-icon><DocumentCopy /></el-icon>
              复制内容
            </el-button>
            <el-button type="primary" size="small" @click="applyToResume">
              <el-icon><Check /></el-icon>
              应用到简历
            </el-button>
          </div>
        </div>
      </template>
      
      <div class="result-content">
        <pre>{{ generatedContent }}</pre>
      </div>
    </el-card>
  </el-card>
</template>

<style scoped>
.ai-generate-card {
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

.title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.help-icon {
  color: #909399;
  cursor: help;
}

.ai-form {
  padding: 20px 0;
}

.tips {
  margin-top: 20px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.result-actions {
  display: flex;
  gap: 10px;
}

.result-content {
  max-height: 500px;
  overflow-y: auto;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.result-content pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: #303133;
  margin: 0;
}

@media (max-width: 768px) {
  .ai-generate-card {
    margin: 0 10px 20px 10px;
  }
  
  .ai-form {
    padding: 10px 0;
  }
  
  .result-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .result-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .result-content {
    max-height: 300px;
  }
}
</style>
