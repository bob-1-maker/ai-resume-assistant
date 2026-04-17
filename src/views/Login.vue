<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo">
          <span class="logo-icon">AI</span>
          <h1 class="logo-text">AI 简历助手</h1>
        </div>
        <h2 class="login-title">{{ isRegisterMode ? '欢迎注册' : '欢迎登录' }}</h2>
        <p class="login-subtitle">
          {{ isRegisterMode ? '创建账号后即可返回登录并开始使用' : '请输入您的账号和密码' }}
        </p>
      </div>

      <el-form
        v-if="!isRegisterMode"
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-position="top"
        class="login-form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            prefix-icon="User"
            size="large"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            size="large"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            @click="handleLogin"
            size="large"
            class="login-button"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <el-form
        v-else
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        label-position="top"
        class="login-form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="请输入用户名"
            prefix-icon="User"
            size="large"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码（至少 6 位）"
            prefix-icon="Lock"
            size="large"
            show-password
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            prefix-icon="Lock"
            size="large"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            @click="handleRegister"
            size="large"
            class="login-button"
          >
            注册
          </el-button>
        </el-form-item>
      </el-form>

      <div class="auth-switch">
        <el-button
          v-if="!isRegisterMode"
          type="primary"
          link
          class="switch-button"
          @click="switchMode('register')"
        >
          还没有账号？立即注册
        </el-button>
        <el-button
          v-else
          type="primary"
          link
          class="switch-button"
          @click="switchMode('login')"
        >
          已有账号？返回登录
        </el-button>
      </div>

      <div class="login-footer">
        <router-link to="/admin-login">前往管理员登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store'

const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref()
const registerFormRef = ref()
const loading = ref(false)
const activeMode = ref<'login' | 'register'>('login')

const loginForm = reactive({
  username: '',
  password: ''
})

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

const isRegisterMode = ref(false)

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

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
      validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
          return
        }

        callback()
      },
      trigger: 'blur'
    }
  ]
}

const syncModeState = () => {
  isRegisterMode.value = activeMode.value === 'register'
}

const switchMode = (mode: 'login' | 'register') => {
  activeMode.value = mode
  syncModeState()

  if (mode === 'login') {
    registerFormRef.value?.clearValidate?.()
    return
  }

  loginFormRef.value?.clearValidate?.()
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    await loginFormRef.value.validate()
    loading.value = true

    const response = await userStore.login(loginForm.username, loginForm.password)

    if (response.code === 200) {
      ElMessage.success('登录成功')
      router.push('/')
      return
    }

    ElMessage.error(response.msg || '登录失败')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.msg || '登录失败')
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  if (!registerFormRef.value) return

  try {
    await registerFormRef.value.validate()
    loading.value = true

    const response = await userStore.register(registerForm.username, registerForm.password)

    if (response.code === 200) {
      ElMessage.success('注册成功，请登录')
      loginForm.username = registerForm.username
      loginForm.password = ''
      registerForm.username = ''
      registerForm.password = ''
      registerForm.confirmPassword = ''
      registerFormRef.value.resetFields?.()
      switchMode('login')
      return
    }

    ElMessage.error(response.msg || '注册失败')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.msg || error?.msg || '注册失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 30px;
  transition: all 0.3s ease;
}

.login-card:hover {
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.logo-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin-right: 12px;
  border-radius: 10px;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
}

.logo-text {
  font-size: 24px;
  font-weight: 700;
  color: #1890ff;
  margin: 0;
}

.login-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.login-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.login-form {
  margin-top: 20px;
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  border: none;
  transition: all 0.3s ease;
}

.login-button:hover {
  background: linear-gradient(135deg, #40a9ff 0%, #1890ff 100%);
}

.login-button:active {
  background: linear-gradient(135deg, #096dd9 0%, #0050b3 100%);
}

.auth-switch {
  margin-top: 8px;
  text-align: center;
}

.switch-button {
  font-size: 14px;
}

.login-footer {
  margin-top: 8px;
  text-align: center;
}

.login-footer a {
  color: #1890ff;
  text-decoration: none;
}

@media (max-width: 768px) {
  .login-card {
    padding: 20px;
  }

  .logo-text {
    font-size: 20px;
  }

  .login-title {
    font-size: 18px;
  }
}
</style>
