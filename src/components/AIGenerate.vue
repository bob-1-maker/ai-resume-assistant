<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElLoading } from 'element-plus'
import { useResumeStore } from '@/store'

const resumeStore = useResumeStore()

const isGenerating = ref(false)
const jobType = ref('')
const style = ref('简洁')

const styles = [
  { label: '简洁', value: '简洁' },
  { label: '成果', value: '成果' },
  { label: '应届生', value: '应届生' }
]

const canGenerate = computed(() => {
  return jobType.value.trim() && resumeStore.currentResume?.basic.name
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
        jobType: jobType.value,
        style: style.value
      })
    })
    
    if (!response.ok) {
      throw new Error('API 调用失败')
    }
    
    const result = await response.json()
    
    if (result.success) {
      if (resumeStore.currentResume) {
        const updatedResume = {
          ...resumeStore.currentResume,
          ...result.data
        }
        resumeStore.saveResume(updatedResume)
        ElMessage.success('AI 生成成功！已自动填充到简历中')
      }
    } else {
      throw new Error(result.message || '生成失败')
    }
  } catch (error) {
    console.error('AI 生成失败:', error)
    ElMessage.error('AI 生成失败，请检查后端服务或 API Key')
  } finally {
    loading.close()
    isGenerating.value = false
  }
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

@media (max-width: 768px) {
  .ai-generate-card {
    margin: 0 10px 20px 10px;
  }
  
  .ai-form {
    padding: 10px 0;
  }
}
</style>
