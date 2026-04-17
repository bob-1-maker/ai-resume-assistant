<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Timer, Delete, Download, Refresh, Loading } from '@element-plus/icons-vue'
import { useResumeStore } from '@/store'
import type { ResumeRecord } from '@/api/resume'

const resumeStore = useResumeStore()

// 状态
const showHistory = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)

// 打开历史面板
const openHistory = async () => {
  showHistory.value = true
  await fetchRecords()
}

// 关闭历史面板
const closeHistory = () => {
  showHistory.value = false
}

// 刷新记录
const fetchRecords = async () => {
  await resumeStore.fetchResumeRecords(currentPage.value, pageSize.value)
}

// 加载简历记录
const loadResume = async (record: ResumeRecord) => {
  try {
    // 先从数据库加载完整记录
    const resumeData = await resumeStore.loadFromDatabase(record.resume_id)
    
    if (!resumeData) {
      ElMessage.error('加载简历失败')
      return
    }
    
    // 创建新的简历并应用数据
    const newResume = resumeStore.createNewResume(record.name || '历史简历')
    
    // 批量更新 - 只触发一次视图更新
    const updatedResume = {
      ...newResume,
      basic: {
        ...newResume.basic,
        name: record.name || '',
        phone: record.phone || '',
        email: record.email || ''
      },
      education: JSON.parse(record.education || '[]'),
      project: record.projects,
      skills: record.skills.map(skill => ({
        name: skill,
        level: 'intermediate' as const,
        category: '专业技能'
      }))
    }
    
    await resumeStore.saveResume(updatedResume)
    ElMessage.success('已成功加载历史简历！')
    closeHistory()
  } catch (error) {
    console.error('加载简历失败:', error)
    ElMessage.error('加载失败，请重试')
  }
}

// 删除简历记录
const deleteRecord = async (record: ResumeRecord) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除简历「${record.name}」吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const success = await resumeStore.deleteFromDatabase(record.resume_id)
    if (success) {
      ElMessage.success('删除成功！')
      await fetchRecords()
    } else {
      ElMessage.error('删除失败')
    }
  } catch (error) {
    // 用户取消
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败，请重试')
    }
  }
}

// 分页变化
const handlePageChange = async (page: number) => {
  currentPage.value = page
  await fetchRecords()
}

// 初始加载
onMounted(() => {
  if (showHistory.value) {
    fetchRecords()
  }
})

// 暴露方法
defineExpose({
  openHistory
})
</script>

<template>
  <div class="resume-history">
    <!-- 打开历史按钮 -->
    <el-button 
      type="info" 
      plain 
      @click="openHistory"
      class="history-button"
    >
      <el-icon><Timer /></el-icon>
      历史简历
    </el-button>
    
    <!-- 历史面板对话框 -->
    <el-dialog
      v-model="showHistory"
      title="历史简历记录"
      width="800px"
      :close-on-click-modal="false"
    >
      <!-- 工具栏 -->
      <div class="toolbar">
        <el-button 
          type="primary" 
          size="small" 
          @click="fetchRecords"
          :loading="resumeStore.isLoadingRecords"
        >
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="resumeStore.isLoadingRecords" class="loading-state">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <span>加载中...</span>
      </div>
      
      <!-- 空状态 -->
      <div v-else-if="!resumeStore.resumeRecords || resumeStore.resumeRecords.length === 0" class="empty-state">
        <el-empty description="暂无历史简历记录" />
      </div>
      
      <!-- 记录列表 -->
      <el-table 
        v-else 
        :data="resumeStore.resumeRecords || []" 
        style="width: 100%"
        stripe
        border
      >
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="phone" label="电话" width="120" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column prop="skills" label="技能" min-width="200">
          <template #default="scope">
            <el-tag 
              v-for="(skill, index) in scope.row.skills" 
              :key="index"
              size="small"
              effect="plain"
            >
              {{ skill }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="scope">
            {{ new Date(scope.row.created_at).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button 
              type="primary" 
              size="small" 
              @click="loadResume(scope.row)"
            >
              <el-icon><Download /></el-icon>
              加载
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              @click="deleteRecord(scope.row)"
            >
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div v-if="resumeStore.resumeRecords && resumeStore.resumeRecords.length > 0" class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="resumeStore.pagination.total"
          @size-change="fetchRecords"
          @current-change="handlePageChange"
        />
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.resume-history {
  display: inline-block;
}

.history-button {
  margin-left: 10px;
}

.toolbar {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #606266;
}

.loading-icon {
  margin-right: 10px;
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.empty-state {
  padding: 40px 0;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-table__row:hover) {
  background-color: #f5f7fa !important;
}

:deep(.el-table-column--fixed-right) {
  background-color: #ffffff;
}
</style>
