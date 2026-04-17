<template>
  <div id="app">
    <el-container class="app-container">
      <el-header class="app-header">
        <div class="header-content">
          <h1>AI 简历助手</h1>
          <div class="header-buttons">
            <ResumeHistory v-if="userStore.isLoggedIn" />
            <ThemeSwitcher />
            <template v-if="userStore.isLoggedIn">
              <el-dropdown>
                <span class="user-info">
                  {{ userStore.user?.username }}
                  <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="handleLogout">退出</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
            <el-button type="primary" @click="dialogVisible = true">
              <el-icon><Plus /></el-icon>
              新建简历
            </el-button>
            <el-button type="default" @click="handleLogout">
              退出登录
            </el-button>
          </div>
        </div>
      </el-header>

      <el-container class="main-container">
        <el-aside width="280px" class="aside-container">
          <div class="aside-header">
            <h3>简历列表</h3>
          </div>
          <el-scrollbar class="resume-list">
            <el-empty v-if="resumeStore.resumeList.length === 0" description="暂无简历" :image-size="80" />
            <div
              v-else
              v-for="resume in resumeStore.resumeList"
              :key="resume.id"
              class="resume-item"
              :class="{ active: resumeStore.currentResume?.id === resume.id }"
            >
              <div class="resume-item-content" @click="handleLoadResume(resume.id)">
                <div class="resume-name">{{ resume.name }}</div>
                <div class="resume-date">{{ new Date(resume.updatedAt).toLocaleDateString('zh-CN') }}</div>
              </div>
              <el-button
                class="delete-btn"
                type="danger"
                size="small"
                circle
                @click.stop="handleDeleteResume(resume.id)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </el-scrollbar>
        </el-aside>

        <el-main class="main-content">
          <ResumeBuilder v-if="resumeStore.currentResume" />
          <el-empty v-else description="请选择或创建一份简历" />
        </el-main>
      </el-container>
    </el-container>

    <el-dialog v-model="dialogVisible" title="新建简历" width="500px">
      <el-form label-width="80px">
        <el-form-item label="简历名称">
          <el-input v-model="newResumeName" placeholder="请输入简历名称" @keyup.enter="handleCreateResume" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreateResume">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, ArrowDown, Delete } from '@element-plus/icons-vue'
import { useResumeStore, useUserStore } from '../store'
import ResumeBuilder from '../components/ResumeBuilder.vue'
import ResumeHistory from '../components/ResumeHistory.vue'
import ThemeSwitcher from '../components/ThemeSwitcher.vue'

const resumeStore = useResumeStore()
const userStore = useUserStore()
const newResumeName = ref('')
const dialogVisible = ref(false)

const handleCreateResume = () => {
  if (!newResumeName.value.trim()) {
    ElMessage.warning('请输入简历名称')
    return
  }

  resumeStore.createNewResume(newResumeName.value)
  newResumeName.value = ''
  dialogVisible.value = false
  ElMessage.success('简历创建成功')
}

const handleLogout = () => {
  userStore.logout()
  window.location.href = '/login'
  ElMessage.success('退出成功')
}

const handleDeleteResume = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这份简历吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    resumeStore.deleteResume(id)
    ElMessage.success('简历删除成功')
  } catch {
  }
}

const handleLoadResume = (id: string) => {
  resumeStore.loadResume(id)
  ElMessage.success('简历加载成功')
}
</script>

<style scoped>
#app {
  width: 100%;
  height: 100vh;
}

.app-container {
  height: 100%;
}

.app-header {
  background-color: var(--theme-color, #409eff);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100%;
}

.header-content h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.header-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.main-container {
  height: calc(100vh - 60px);
}

.aside-container {
  background: #f5f7fa;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
}

.aside-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e8e8e8;
  background: #fff;
}

.aside-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.resume-list {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
}

.resume-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  margin-bottom: 8px;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid transparent;
}

.resume-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.resume-item.active {
  border-color: #409eff;
  background: #ecf5ff;
}

.resume-item-content {
  flex: 1;
  overflow: hidden;
}

.resume-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.resume-date {
  font-size: 12px;
  color: #999;
}

.delete-btn {
  opacity: 0;
  transition: opacity 0.3s;
}

.resume-item:hover .delete-btn {
  opacity: 1;
}

.main-content {
  padding: 20px;
  background: #fff;
  overflow-y: auto;
}
</style>
