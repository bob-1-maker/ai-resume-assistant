<template>
  <el-dialog
    v-model="dialogVisible"
    :title="activeTab === 'login' ? '用户登录' : '用户注册'"
    width="400px"
  >
    <el-tabs v-model="activeTab" @tab-click="handleTabClick">
      <el-tab-pane label="登录" name="login">
        <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" label-width="80px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="loginForm.username" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              show-password
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleLogin" :loading="isLoading">
              登录
            </el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="注册" name="register">
        <el-form :model="registerForm" :rules="registerRules" ref="registerFormRef" label-width="80px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="registerForm.username" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码（至少6位）"
              show-password
            />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              show-password
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleRegister" :loading="isLoading">
              注册
            </el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useUserStore } from '@/store/user'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'login-success'): void
}>()

const dialogVisible = ref(props.visible)
const activeTab = ref('login')
const isLoading = ref(false)
const userStore = useUserStore()

// 登录表单
const loginForm = reactive({
  username: '',
  password: ''
})

const loginFormRef = ref()

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

// 注册表单
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

const registerFormRef = ref()

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 处理标签切换
const handleTabClick = () => {
  // 重置表单
  if (activeTab.value === 'login') {
    loginFormRef.value?.resetFields()
  } else {
    registerFormRef.value?.resetFields()
  }
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    await loginFormRef.value.validate()
    isLoading.value = true
    
    const response = await userStore.login(loginForm.username, loginForm.password)
    
    if (response.code === 200) {
      ElMessage.success('登录成功')
      dialogVisible.value = false
      emit('update:visible', false)
      emit('login-success')
    } else {
      ElMessage.error(response.msg || '登录失败')
    }
  } catch (error: any) {
    ElMessage.error(error.msg || '登录失败')
  } finally {
    isLoading.value = false
  }
}

// 处理注册
const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  try {
    await registerFormRef.value.validate()
    isLoading.value = true
    
    const response = await userStore.register(registerForm.username, registerForm.password)
    
    if (response.code === 200) {
      ElMessage.success('注册成功，请登录')
      activeTab.value = 'login'
      loginForm.username = registerForm.username
      loginForm.password = ''
      registerFormRef.value.resetFields()
    } else {
      ElMessage.error(response.msg || '注册失败')
    }
  } catch (error: any) {
    ElMessage.error(error.msg || '注册失败')
  } finally {
    isLoading.value = false
  }
}

// 监听visible属性变化
watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal
})

// 监听dialogVisible变化
watch(dialogVisible, (newVal) => {
  emit('update:visible', newVal)
  if (newVal) {
    // 重置表单
    if (activeTab.value === 'login') {
      loginFormRef.value?.resetFields()
    } else {
      registerFormRef.value?.resetFields()
    }
  }
})
</script>

<style scoped>
.el-tabs {
  margin-top: 20px;
}

.el-form-item {
  margin-bottom: 20px;
}

.el-button {
  width: 100%;
}
</style>
