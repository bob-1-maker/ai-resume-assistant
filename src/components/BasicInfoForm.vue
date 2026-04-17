<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Avatar } from '@element-plus/icons-vue'
import { useResumeStore } from '@/store'
import type { BasicInfo } from '@/types'

const resumeStore = useResumeStore()
const formRef = ref<FormInstance>()
const fileList = ref<any[]>([])

const formData = ref<BasicInfo>({
  name: '',
  gender: '',
  phone: '',
  email: '',
  position: '',
  expectedSalary: '',
  location: '',
  summary: '',
  avatar: ''
})

const handleAvatarChange = (file: any) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    formData.value.avatar = e.target?.result as string
    saveBasicInfo()
    ElMessage.success('头像上传成功！')
  }
  reader.readAsDataURL(file.raw)
}

const removeAvatar = () => {
  formData.value.avatar = ''
  fileList.value = []
  saveBasicInfo()
  ElMessage.success('头像已移除！')
}

const validatePhone = (rule: any, value: any, callback: any) => {
  const phoneReg = /^1[3-9]\d{9}$/
  if (!value) {
    callback()
  } else if (!phoneReg.test(value)) {
    callback(new Error('请输入正确的手机号'))
  } else {
    callback()
  }
}

const validateEmail = (rule: any, value: any, callback: any) => {
  const emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!value) {
    callback()
  } else if (!emailReg.test(value)) {
    callback(new Error('请输入正确的邮箱格式'))
  } else {
    callback()
  }
}

const rules: FormRules<BasicInfo> = {
  name: [
    { required: true, message: '请输入姓名', trigger: ['blur', 'change'] }
  ],
  phone: [
    { validator: validatePhone, trigger: ['blur', 'change'] }
  ],
  email: [
    { validator: validateEmail, trigger: ['blur', 'change'] }
  ],
  position: [
    { required: true, message: '请输入求职意向', trigger: ['blur', 'change'] }
  ]
}

const genderOptions = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' }
]

const salaryOptions = [
  { label: '10K以下', value: '10K以下' },
  { label: '10K-15K', value: '10K-15K' },
  { label: '15K-20K', value: '15K-20K' },
  { label: '20K-30K', value: '20K-30K' },
  { label: '30K-50K', value: '30K-50K' },
  { label: '50K以上', value: '50K以上' },
  { label: '面议', value: '面议' }
]

const syncFormData = () => {
  if (resumeStore.currentResume) {
    formData.value = { ...resumeStore.currentResume.basic }
  }
}

const saveBasicInfo = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      if (!resumeStore.currentResume) {
        resumeStore.createNewResume('未命名简历')
      }
      
      const updatedResume = {
        ...resumeStore.currentResume!,
        basic: { ...formData.value }
      }
      
      resumeStore.saveResume(updatedResume)
      ElMessage.success('基础信息保存成功！')
    } else {
      ElMessage.error('请完善必填信息')
      return false
    }
  })
}

const resetForm = () => {
  formRef.value?.resetFields()
  syncFormData()
}

onMounted(() => {
  syncFormData()
})

watch(() => resumeStore.currentResume, () => {
  syncFormData()
}, { deep: true })
</script>

<template>
  <div class="basic-info-form">
    <el-card class="form-card">
      <template #header>
        <div class="card-header">
          <span class="title">基础信息</span>
        </div>
      </template>
      
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
        class="form-content"
      >
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="头像">
              <div class="avatar-upload">
                <el-upload
                  v-model:file-list="fileList"
                  action="#"
                  :auto-upload="false"
                  :on-change="handleAvatarChange"
                  :show-file-list="false"
                  accept="image/*"
                >
                  <div class="avatar-preview">
                    <img v-if="formData.avatar" :src="formData.avatar" class="avatar-img" />
                    <div v-else class="avatar-placeholder">
                      <el-icon><Avatar /></el-icon>
                      <span>上传头像</span>
                    </div>
                  </div>
                </el-upload>
                <el-button v-if="formData.avatar" type="text" @click="removeAvatar" class="remove-avatar-btn">
                  移除头像
                </el-button>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="formData.name" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
          
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="性别" prop="gender">
              <el-select v-model="formData.gender" placeholder="请选择性别" style="width: 100%">
                <el-option
                  v-for="item in genderOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="formData.phone" placeholder="请输入手机号" maxlength="11" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="formData.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
          
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="求职意向" prop="position">
              <el-input v-model="formData.position" placeholder="请输入求职意向" />
            </el-form-item>
          </el-col>
          
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="期望薪资" prop="expectedSalary">
              <el-select v-model="formData.expectedSalary" placeholder="请选择期望薪资" style="width: 100%" clearable>
                <el-option
                  v-for="item in salaryOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <el-form-item label="所在地" prop="location">
              <el-input v-model="formData.location" placeholder="请输入所在地" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="个人简介" prop="summary">
          <el-input
            v-model="formData.summary"
            type="textarea"
            :rows="4"
            placeholder="请输入个人简介"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="saveBasicInfo" size="large">
            保存信息
          </el-button>
          <el-button @click="resetForm" size="large">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.basic-info-form {
  padding: 20px;
}

.form-card {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.form-content {
  padding: 20px 0;
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-preview {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #e4e7ed;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  margin-bottom: 10px;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
}

.avatar-placeholder .el-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.remove-avatar-btn {
  margin-top: 5px;
  color: #f56c6c;
}

@media (max-width: 768px) {
  .form-card {
    margin: 0 10px;
  }
  
  .basic-info-form {
    padding: 10px;
  }
  
  .el-form-item {
    margin-bottom: 18px;
  }
  
  .avatar-preview {
    width: 100px;
    height: 100px;
  }
}
</style>
