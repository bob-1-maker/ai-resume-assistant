<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElTag } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import { useResumeStore } from '@/store'

const resumeStore = useResumeStore()

const currentResume = computed(() => resumeStore.currentResume)
const selfEvaluation = computed(() => currentResume.value?.selfEvaluation || { content: '', keywords: [] })

// 更新自我评价内容
const updateContent = (value: string) => {
  if (!currentResume.value) return
  
  const updatedResume = { ...currentResume.value }
  updatedResume.selfEvaluation = {
    ...(updatedResume.selfEvaluation || { content: '', keywords: [] }),
    content: value
  }
  resumeStore.saveResume(updatedResume)
}

// 新增关键词
const keywordInput = ref('')
const addKeyword = () => {
  if (!currentResume.value || !keywordInput.value.trim()) return
  
  const updatedResume = { ...currentResume.value }
  const keywords = [...(updatedResume.selfEvaluation?.keywords || [])]
  
  if (!keywords.includes(keywordInput.value.trim())) {
    keywords.push(keywordInput.value.trim())
    updatedResume.selfEvaluation = {
      ...(updatedResume.selfEvaluation || { content: '', keywords: [] }),
      keywords
    }
    resumeStore.saveResume(updatedResume)
    keywordInput.value = ''
    ElMessage.success('添加关键词成功')
  } else {
    ElMessage.warning('关键词已存在')
  }
}

// 删除关键词
const deleteKeyword = (keyword: string) => {
  if (!currentResume.value) return
  
  const updatedResume = { ...currentResume.value }
  updatedResume.selfEvaluation = {
    ...(updatedResume.selfEvaluation || { content: '', keywords: [] }),
    keywords: (updatedResume.selfEvaluation?.keywords || []).filter(k => k !== keyword)
  }
  resumeStore.saveResume(updatedResume)
  ElMessage.success('删除关键词成功')
}
</script>

<template>
  <el-card class="self-evaluation-form">
    <template #header>
      <div class="card-header">
        <span class="title">自我评价</span>
      </div>
    </template>
    
    <div class="evaluation-content">
      <el-form label-width="80px">
        <el-form-item label="自我评价">
          <el-input
            v-model="selfEvaluation.content"
            type="textarea"
            placeholder="请输入您的自我评价，突出个人优势和职业素养"
            rows="6"
            @input="updateContent(selfEvaluation.content)"
          />
          <div class="hint">
            建议包含：个人特质、专业能力、工作态度、职业目标等
          </div>
        </el-form-item>
        
        <el-form-item label="个人标签">
          <div class="keywords-section">
            <el-tag
              v-for="keyword in selfEvaluation.keywords"
              :key="keyword"
              closable
              @close="deleteKeyword(keyword)"
              class="keyword-tag"
            >
              {{ keyword }}
            </el-tag>
            
            <el-input
              v-model="keywordInput"
              placeholder="输入个人标签"
              style="width: 200px;"
              @keyup.enter="addKeyword"
            >
              <template #append>
                <el-button @click="addKeyword" icon="Plus" />
              </template>
            </el-input>
          </div>
          <div class="hint">
            添加能体现您优势的标签，如：团队协作、问题解决、创新思维等
          </div>
        </el-form-item>
      </el-form>
    </div>
  </el-card>
</template>

<style scoped>
.self-evaluation-form {
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

.evaluation-content {
  margin-top: 10px;
}

.keywords-section {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 10px;
}

.keyword-tag {
  margin: 4px 0;
}

.hint {
  font-size: 13px;
  color: #909399;
  margin-top: 6px;
}
</style>