<template>
  <div class="admin-login-page">
    <div class="admin-login-card">
      <div class="admin-login-header">
        <p class="admin-login-tag">Admin</p>
        <h1>管理员后台登录</h1>
        <p>使用固定管理员账号进入简历管理后台</p>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        class="admin-login-form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入管理员用户名"
            size="large"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入管理员密码"
            size="large"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="submit-btn"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="back-link">
        <router-link to="/login">返回普通用户登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAdminStore } from '@/store'

const router = useRouter()
const adminStore = useAdminStore()
const formRef = ref()
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入管理员用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入管理员密码', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    const response = await adminStore.login(form.username, form.password)

    if (response.code === 200) {
      ElMessage.success('管理员登录成功')
      router.push('/admin')
      return
    }

    ElMessage.error(response.msg || '登录失败')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.msg || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.admin-login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background:
    radial-gradient(circle at top left, rgba(16, 185, 129, 0.18), transparent 35%),
    radial-gradient(circle at bottom right, rgba(14, 116, 144, 0.2), transparent 32%),
    linear-gradient(135deg, #f4f7f2 0%, #dbeafe 100%);
}

.admin-login-card {
  width: 100%;
  max-width: 460px;
  padding: 32px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.12);
}

.admin-login-header h1 {
  margin: 8px 0;
  font-size: 28px;
  color: #0f172a;
}

.admin-login-header p {
  margin: 0;
  color: #475569;
}

.admin-login-tag {
  display: inline-flex;
  margin: 0;
  padding: 4px 10px;
  border-radius: 999px;
  background: #0f766e;
  color: #fff;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.admin-login-form {
  margin-top: 24px;
}

.submit-btn {
  width: 100%;
}

.back-link {
  margin-top: 8px;
  text-align: center;
}

.back-link a {
  color: #0f766e;
  text-decoration: none;
}
</style>
