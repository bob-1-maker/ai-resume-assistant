<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete, Edit } from '@element-plus/icons-vue'
import { useResumeStore } from '@/store'
import type { Award } from '@/types'

const resumeStore = useResumeStore()

const currentResume = computed(() => resumeStore.currentResume)

// 新增奖项
const addAward = () => {
  if (!currentResume.value) return
  
  const newAward: Award = {
    id: `award-${Date.now()}`,
    name: '',
    description: '',
    time: ''
  }
  
  const updatedResume = { ...currentResume.value }
  updatedResume.awards = [...(updatedResume.awards || []), newAward]
  resumeStore.saveResume(updatedResume)
  
  ElMessage.success('添加奖项成功')
}

// 删除奖项
const deleteAward = (id: string) => {
  if (!currentResume.value) return
  
  const updatedResume = { ...currentResume.value }
  updatedResume.awards = (updatedResume.awards || []).filter(award => award.id !== id)
  resumeStore.saveResume(updatedResume)
  
  ElMessage.success('删除奖项成功')
}

// 更新奖项
const updateAward = (id: string, field: keyof Award, value: string) => {
  if (!currentResume.value) return
  
  const updatedResume = { ...currentResume.value }
  updatedResume.awards = (updatedResume.awards || []).map(award => {
    if (award.id === id) {
      return { ...award, [field]: value }
    }
    return award
  })
  resumeStore.saveResume(updatedResume)
}
</script>

<template>
  <el-card class="awards-form">
    <template #header>
      <div class="card-header">
        <span class="title">荣誉奖项</span>
        <el-button
          type="primary"
          size="small"
          @click="addAward"
        >
          <el-icon><Plus /></el-icon>
          添加奖项
        </el-button>
      </div>
    </template>
    
    <div v-if="currentResume?.awards && currentResume.awards.length > 0" class="awards-list">
      <el-collapse v-model="activeNames">
        <el-collapse-item
          v-for="award in currentResume.awards"
          :key="award.id"
          :title="award.name || '未命名奖项'"
          :name="award.id"
        >
          <div class="award-form">
            <el-form :model="award" label-width="80px">
              <el-form-item label="奖项名称">
                <el-input
                  v-model="award.name"
                  placeholder="请输入奖项名称"
                  @input="updateAward(award.id, 'name', award.name)"
                />
              </el-form-item>
              
              <el-form-item label="获得时间">
                <el-date-picker
                  v-model="award.time"
                  type="date"
                  format="YYYY-MM"
                  value-format="YYYY-MM"
                  placeholder="选择获得时间"
                  @change="updateAward(award.id, 'time', award.time)"
                />
              </el-form-item>
              
              <el-form-item label="奖项描述">
                <el-input
                  v-model="award.description"
                  type="textarea"
                  placeholder="请描述奖项的获得情况和意义"
                  rows="3"
                  @input="updateAward(award.id, 'description', award.description)"
                />
              </el-form-item>
              
              <el-form-item>
                <el-button
                  type="danger"
                  size="small"
                  icon="Delete"
                  @click="deleteAward(award.id)"
                >
                  删除奖项
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
    
    <div v-else class="empty-state">
      <el-empty description="暂无荣誉奖项">
        <template #description>
          <p>您还没有添加荣誉奖项</p>
          <p class="hint">添加您获得的奖项、证书等荣誉，提升简历竞争力</p>
        </template>
        <el-button type="primary" @click="addAward">
          添加奖项
        </el-button>
      </el-empty>
    </div>
  </el-card>
</template>

<style scoped>
.awards-form {
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

.awards-list {
  margin-top: 10px;
}

.award-form {
  padding: 10px 0;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
}

.hint {
  font-size: 14px;
  color: #909399;
  margin-top: 8px;
}

:deep(.el-collapse-item__content) {
  padding-bottom: 10px;
}
</style>