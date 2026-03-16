<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useResumeStore } from '@/store'
import type { Education } from '@/types'

const resumeStore = useResumeStore()

const educations = ref<Education[]>([])

const syncEducations = () => {
  if (resumeStore.currentResume) {
    educations.value = [...(resumeStore.currentResume.education || [])]
  }
}

const saveEducations = () => {
  if (resumeStore.currentResume) {
    const updatedResume = {
      ...resumeStore.currentResume,
      education: educations.value
    }
    resumeStore.saveResume(updatedResume)
    ElMessage.success('教育经历保存成功！')
  }
}

const addEducation = () => {
  const newEducation: Education = {
    id: crypto.randomUUID(),
    school: '',
    major: '',
    degree: '',
    startDate: '',
    endDate: '',
    description: ''
  }
  educations.value.push(newEducation)
  saveEducations()
}

const removeEducation = (id: string) => {
  const index = educations.value.findIndex(edu => edu.id === id)
  if (index >= 0) {
    educations.value.splice(index, 1)
    saveEducations()
  }
}

const updateEducation = (id: string, field: keyof Education, value: string) => {
  const education = educations.value.find(edu => edu.id === id)
  if (education) {
    education[field] = value
    saveEducations()
  }
}

onMounted(() => {
  syncEducations()
})

watch(() => resumeStore.currentResume, () => {
  syncEducations()
}, { deep: true })
</script>

<template>
  <el-card class="education-form">
    <template #header>
      <div class="card-header">
        <span class="title">教育经历</span>
        <el-button type="primary" size="small" @click="addEducation">
          <el-icon><Plus /></el-icon>
          添加
        </el-button>
      </div>
    </template>
    
    <div v-if="educations.length === 0" class="empty-state">
      <el-empty description="暂无教育经历" :image-size="80" />
      <el-button type="primary" style="margin-top: 20px" @click="addEducation">
        <el-icon><Plus /></el-icon>
        添加教育经历
      </el-button>
    </div>
    
    <div v-else class="educations-list">
      <el-card
        v-for="education in educations"
        :key="education.id"
        class="education-item"
        :body-style="{ padding: '20px' }"
      >
        <div class="education-header">
          <span class="item-title">教育经历 {{ educations.indexOf(education) + 1 }}</span>
          <el-button
            type="danger"
            size="small"
            circle
            @click="removeEducation(education.id)"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
        
        <el-form :model="education" label-width="80px" class="education-form">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12">
              <el-form-item label="学校" required>
                <el-input 
                  v-model="education.school" 
                  placeholder="请输入学校名称"
                  @input="updateEducation(education.id, 'school', education.school)"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item label="专业" required>
                <el-input 
                  v-model="education.major" 
                  placeholder="请输入专业名称"
                  @input="updateEducation(education.id, 'major', education.major)"
                />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12">
              <el-form-item label="学历" required>
                <el-select 
                  v-model="education.degree" 
                  placeholder="请选择学历" 
                  style="width: 100%"
                  @change="updateEducation(education.id, 'degree', education.degree)"
                >
                  <el-option label="高中" value="高中" />
                  <el-option label="大专" value="大专" />
                  <el-option label="本科" value="本科" />
                  <el-option label="硕士" value="硕士" />
                  <el-option label="博士" value="博士" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12">
              <el-form-item label="开始时间" required>
                <el-date-picker 
                  v-model="education.startDate" 
                  type="month" 
                  placeholder="选择开始时间"
                  style="width: 100%"
                  @change="updateEducation(education.id, 'startDate', education.startDate)"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item label="结束时间" required>
                <el-date-picker 
                  v-model="education.endDate" 
                  type="month" 
                  placeholder="选择结束时间"
                  style="width: 100%"
                  @change="updateEducation(education.id, 'endDate', education.endDate)"
                />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-form-item label="描述">
            <el-input 
              v-model="education.description" 
              type="textarea" 
              :rows="3"
              placeholder="请输入教育经历描述"
              @input="updateEducation(education.id, 'description', education.description)"
            />
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </el-card>
</template>

<style scoped>
.education-form {
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

.educations-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.education-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
}

.education-header {
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
  .education-form {
    margin: 0 10px 20px 10px;
  }
  
  .education-item {
    margin: 0;
  }
}
</style>
