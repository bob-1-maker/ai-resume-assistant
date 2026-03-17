<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElLoading, ElMessageBox } from 'element-plus'
import { useResumeStore } from '@/store'

const resumeStore = useResumeStore()

const isOptimizing = ref(false)
const jobType = ref('')
const originalText = ref('')
const optimizedText = ref('')
const problems = ref<string[]>([])
const keywords = ref<string[]>([])
const showResult = ref(false)

const canOptimize = computed(() => {
  return jobType.value.trim() && originalText.value.trim()
})

const optimizeWithAI = async () => {
  if (!canOptimize.value) {
    ElMessage.warning('请填写求职岗位和简历文本')
    return
  }
  
  isOptimizing.value = true
  const loading = ElLoading.service({
    lock: true,
    text: 'AI 正在优化简历...',
    background: 'rgba(0, 0, 0, 0.7)'
  })
  
  try {
    const response = await fetch('http://localhost:3000/api/ai/optimize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        resumeData: resumeStore.currentResume || {},
        section: '求职岗位',
        content: originalText.value
      })
    })
    
    if (!response.ok) {
      throw new Error('API 调用失败')
    }
    
    const result = await response.json()
    
    if (result.code === 200) {
      optimizedText.value = result.data.content || ''
      showResult.value = true
      ElMessage.success('AI 优化成功！' + result.msg)
      console.log('AI 优化结果:', result.data.content)
    } else {
      throw new Error(result.msg || '优化失败')
    }
  } catch (error) {
    console.error('AI 优化失败:', error)
    ElMessage.error('AI 优化失败，请检查后端服务或 API Key')
  } finally {
    loading.close()
    isOptimizing.value = false
  }
}

const replaceOriginalText = () => {
  ElMessageBox.confirm('确定要替换原内容吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    originalText.value = optimizedText.value
    ElMessage.success('已替换原内容！')
  })
}

const copyToClipboard = (text: string, label: string) => {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success(`${label}已复制到剪贴板！`)
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

const copyKeywords = () => {
  const keywordsText = keywords.value.join('\n')
  copyToClipboard(keywordsText, '关键词')
}

const copyProblems = () => {
  const problemsText = problems.value.join('\n')
  copyToClipboard(problemsText, '问题建议')
}

const clearAll = () => {
  originalText.value = ''
  optimizedText.value = ''
  problems.value = []
  keywords.value = []
  showResult.value = false
  ElMessage.success('已清空内容！')
}
</script>

<template>
  <el-card class="ai-optimize-card">
    <template #header>
      <div class="card-header">
        <span class="title">AI 简历优化</span>
        <el-tooltip content="使用 AI 智能优化简历内容">
          <el-icon class="help-icon"><QuestionFilled /></el-icon>
        </el-tooltip>
      </div>
    </template>
    
    <el-form class="ai-form">
      <el-form-item label="求职岗位" required>
        <el-input 
          v-model="jobType" 
          placeholder="请输入您的求职岗位，如：前端工程师"
          :disabled="isOptimizing"
        />
      </el-form-item>
      
      <el-form-item label="原简历文本" required>
        <el-input 
          v-model="originalText" 
          type="textarea" 
          :rows="8" 
          placeholder="请输入要优化的简历文本"
          :disabled="isOptimizing"
        />
      </el-form-item>
      
      <el-form-item>
        <el-button 
          type="primary" 
          size="large" 
          @click="optimizeWithAI"
          :loading="isOptimizing"
          :disabled="!canOptimize || isOptimizing"
        >
          <el-icon v-if="!isOptimizing"><MagicStick /></el-icon>
          <el-icon v-else><Loading /></el-icon>
          {{ isOptimizing ? '优化中...' : 'AI 优化简历' }}
        </el-button>
        <el-button size="large" @click="clearAll" :disabled="isOptimizing">
          <el-icon><Delete /></el-icon>
          清空
        </el-button>
      </el-form-item>
    </el-form>
    
    <!-- 优化结果 -->
    <div v-if="showResult" class="optimization-result">
      <el-divider content-position="left">优化结果</el-divider>
      
      <!-- 润色后文本 -->
      <el-card class="result-card">
        <template #header>
          <div class="result-header">
            <span>润色后文本</span>
            <el-button type="success" size="small" @click="replaceOriginalText">
              <el-icon><RefreshLeft /></el-icon>
              替换原内容
            </el-button>
          </div>
        </template>
        <el-input 
          v-model="optimizedText" 
          type="textarea" 
          :rows="8"
          readonly
        />
      </el-card>
      
      <!-- 问题列表 -->
      <el-card v-if="problems.length > 0" class="result-card">
        <template #header>
          <div class="result-header">
            <span>问题建议</span>
            <el-button type="info" size="small" @click="copyProblems">
              <el-icon><DocumentCopy /></el-icon>
              复制
            </el-button>
          </div>
        </template>
        <div class="problems-list">
          <div v-for="(problem, index) in problems" :key="index" class="problem-item">
            <el-icon class="problem-icon"><Warning /></el-icon>
            <span>{{ problem }}</span>
          </div>
        </div>
      </el-card>
      
      <!-- 关键词 -->
      <el-card v-if="keywords.length > 0" class="result-card">
        <template #header>
          <div class="result-header">
            <span>关键词</span>
            <el-button type="info" size="small" @click="copyKeywords">
              <el-icon><DocumentCopy /></el-icon>
              复制
            </el-button>
          </div>
        </template>
        <div class="keywords-list">
          <el-tag 
            v-for="(keyword, index) in keywords" 
            :key="index" 
            type="info" 
            effect="plain"
            class="keyword-tag"
          >
            {{ keyword }}
          </el-tag>
        </div>
      </el-card>
    </div>
    
    <div class="tips">
      <el-alert
        title="提示"
        type="info"
        :closable="false"
        show-icon
      >
        <template #default>
          <ul>
            <li>优化前请确保已填写求职岗位</li>
            <li>建议只优化简历中的部分内容，如个人简介、项目描述等</li>
            <li>优化结果可手动调整</li>
          </ul>
        </template>
      </el-alert>
    </div>
  </el-card>
</template>

<style scoped>
.ai-optimize-card {
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

.optimization-result {
  margin-top: 30px;
}

.result-card {
  margin-bottom: 20px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.problems-list {
  margin-top: 10px;
}

.problem-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
  padding: 8px 12px;
  background: #fef0f0;
  border-radius: 4px;
  border-left: 4px solid #f56c6c;
}

.problem-icon {
  color: #f56c6c;
  margin-right: 8px;
  margin-top: 2px;
}

.keywords-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.keyword-tag {
  background: #ecf5ff;
  border-color: #d9ecff;
  color: #409eff;
}

.tips {
  margin-top: 20px;
}

@media (max-width: 768px) {
  .ai-optimize-card {
    margin: 0 10px 20px 10px;
  }
  
  .ai-form {
    padding: 10px 0;
  }
  
  .result-card {
    margin-bottom: 15px;
  }
}
</style>
