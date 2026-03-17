<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useResumeStore } from '@/store'
import type { Work } from '@/types'

const resumeStore = useResumeStore()

const works = ref<Work[]>([])

const syncWorks = () => {
  if (resumeStore.currentResume) {
    works.value = [...(resumeStore.currentResume.work || [])]
  }
}

const saveWorks = () => {
  if (resumeStore.currentResume) {
    const updatedResume = {
      ...resumeStore.currentResume,
      work: works.value
    }
    resumeStore.saveResume(updatedResume)
  }
}

const addWork = () => {
  const newWork: Work = {
    id: crypto.randomUUID(),
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    description: ''
  }
  works.value.push(newWork)
  saveWorks()
  ElMessage.success('工作经历添加成功！')
}

const removeWork = (id: string) => {
  const index = works.value.findIndex(work => work.id === id)
  if (index >= 0) {
    works.value.splice(index, 1)
    saveWorks()
    ElMessage.success('工作经历删除成功！')
  }
}

const updateWork = (id: string, field: keyof Work, value: string) => {
  const work = works.value.find(work => work.id === id)
  if (work) {
    work[field] = value
    saveWorks()
  }
}

onMounted(() => {
  syncWorks()
})

watch(() => resumeStore.currentResume, () => {
  syncWorks()
}, { deep: true })
</script>

<template>
  <el-card class="work-form">
    <template #header>
      <div class="card-header">
        <span class="title">工作经历</span>
        <el-button type="primary" size="small" @click="addWork">
          <el-icon><Plus /></el-icon>
          添加
        </el-button>
      </div>
    </template>
    
    <div v-if="works.length === 0" class="empty-state">
      <el-empty description="暂无工作经历" :image-size="80" />
      <el-button type="primary" style="margin-top: 20px" @click="addWork">
        <el-icon><Plus /></el-icon>
        添加工作经历
      </el-button>
    </div>
    
    <div v-else class="works-list">
      <el-card
        v-for="work in works"
        :key="work.id"
        class="work-item"
        :body-style="{ padding: '20px' }"
      >
        <div class="work-header">
          <span class="item-title">工作经历 {{ works.indexOf(work) + 1 }}</span>
          <el-button
            type="danger"
            size="small"
            circle
            @click="removeWork(work.id)"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
        
        <el-form :model="work" label-width="80px" class="work-form">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12">
              <el-form-item label="公司" required>
                <el-input 
                  v-model="work.company" 
                  placeholder="请输入公司名称"
                  @input="updateWork(work.id, 'company', work.company)"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item label="职位" required>
                <el-input 
                  v-model="work.position" 
                  placeholder="请输入职位名称"
                  @input="updateWork(work.id, 'position', work.position)"
                />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12">
              <el-form-item label="开始时间" required>
                <el-date-picker 
                  v-model="work.startDate" 
                  type="month" 
                  placeholder="选择开始时间"
                  style="width: 100%"
                  @change="updateWork(work.id, 'startDate', work.startDate)"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item label="结束时间" required>
                <el-date-picker 
                  v-model="work.endDate" 
                  type="month" 
                  placeholder="选择结束时间"
                  style="width: 100%"
                  @change="updateWork(work.id, 'endDate', work.endDate)"
                />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-form-item label="工作内容" required>
            <el-input
              v-model="work.description"
              type="textarea"
              :rows="4"
              placeholder="请输入工作内容，支持多行输入&#10;• 使用 • 或 - 开头添加列表项&#10;• 支持换行分段"
              @input="updateWork(work.id, 'description', work.description)"
            />
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </el-card>
</template>

<style scoped>
.work-form {
  margin-bottom: 20px;
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

.empty-state {
  text-align: center;
  padding: 40px 0;
}

.works-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.work-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
}

.work-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f2f5;
}

.item-title {
  font-size: 14px;
  font-weight: 600;
  color: #409eff;
}

@media (max-width: 768px) {
  .work-form {
    margin: 0 10px 20px 10px;
  }
  
  .work-item {
    margin: 0;
  }
}
</style>
