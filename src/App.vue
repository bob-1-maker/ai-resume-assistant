<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useResumeStore } from '@/store'
import ResumeBuilder from '@/components/ResumeBuilder.vue'

const resumeStore = useResumeStore()
const newResumeName = ref('')
const dialogVisible = ref(false)

const handleCreateResume = async () => {
  if (!newResumeName.value.trim()) {
    ElMessage.warning('请输入简历名称')
    return
  }
  
  resumeStore.createNewResume(newResumeName.value)
  newResumeName.value = ''
  dialogVisible.value = false
  ElMessage.success('简历创建成功！')
}

const handleDeleteResume = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这份简历吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    resumeStore.deleteResume(id)
    ElMessage.success('简历删除成功！')
  } catch {
  }
}

const handleLoadResume = (id: string) => {
  resumeStore.loadResume(id)
  ElMessage.success('简历加载成功！')
}
</script>

<template>
  <div id="app">
    <el-container class="app-container">
      <el-header class="app-header">
        <div class="header-content">
          <h1>AI 简历助手</h1>
          <el-button type="primary" @click="dialogVisible = true">
            <el-icon><Plus /></el-icon>
            新建简历
          </el-button>
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

<style scoped>
#app {
  width: 100%;
  height: 100vh;
}

.app-container {
  height: 100%;
}

.app-header {
  background-color: #409eff;
  color: white;
  padding: 0 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.app-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.main-container {
  height: calc(100vh - 60px);
}

.aside-container {
  background-color: #fff;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.aside-header {
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.aside-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.resume-list {
  flex: 1;
  padding: 10px;
}

.resume-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid transparent;
}

.resume-item:hover {
  background-color: #f5f7fa;
}

.resume-item.active {
  background-color: #ecf5ff;
  border-color: #409eff;
}

.resume-item-content {
  flex: 1;
  min-width: 0;
}

.resume-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.resume-date {
  font-size: 12px;
  color: #909399;
}

.delete-btn {
  opacity: 0;
  transition: opacity 0.3s;
}

.resume-item:hover .delete-btn {
  opacity: 1;
}

.main-content {
  background-color: #f5f7fa;
  overflow-y: auto;
  padding: 0;
}

@media (max-width: 768px) {
  .aside-container {
    width: 200px;
  }
  
  .app-header {
    padding: 0 12px;
  }
  
  .app-header h1 {
    font-size: 18px;
  }
}
</style>
