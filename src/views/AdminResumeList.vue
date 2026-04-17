<template>
  <div class="admin-page">
    <div class="admin-header">
      <div>
        <p class="admin-header-tag">Admin</p>
        <h1>所有简历列表</h1>
        <p>只读查看全站简历记录，可执行删除操作。</p>
      </div>

      <div class="admin-header-actions">
        <el-button @click="refreshList" :loading="adminStore.isLoading">刷新</el-button>
        <el-button type="danger" plain @click="handleLogout">退出后台</el-button>
      </div>
    </div>

    <el-card class="admin-table-card" shadow="never">
      <el-table
        :data="adminStore.resumeList"
        v-loading="adminStore.isLoading"
        empty-text="暂无简历数据"
      >
        <el-table-column prop="resume_id" label="简历ID" min-width="200" />
        <el-table-column prop="user_id" label="用户ID" width="100" />
        <el-table-column prop="name" label="姓名" min-width="120" />
        <el-table-column prop="phone" label="手机号" min-width="140" />
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column prop="created_at" label="创建时间" min-width="180" />
        <el-table-column label="技能" min-width="220">
          <template #default="{ row }">
            <el-tag
              v-for="skill in row.skills"
              :key="skill"
              size="small"
              class="skill-tag"
            >
              {{ skill }}
            </el-tag>
            <span v-if="!row.skills?.length">-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="danger" link @click="handleDelete(row.resume_id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-row">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :current-page="adminStore.pagination.page"
          :page-size="adminStore.pagination.pageSize"
          :total="adminStore.pagination.total"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAdminStore } from '@/store'

const router = useRouter()
const adminStore = useAdminStore()

const refreshList = async () => {
  try {
    await adminStore.fetchResumes(adminStore.pagination.page, adminStore.pagination.pageSize)
  } catch (error: any) {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      adminStore.logout()
      router.push('/admin-login')
      return
    }

    ElMessage.error(error?.response?.data?.msg || '获取简历列表失败')
  }
}

const handlePageChange = async (page: number) => {
  try {
    await adminStore.fetchResumes(page, adminStore.pagination.pageSize)
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.msg || '分页加载失败')
  }
}

const handleDelete = async (resumeId: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这份简历吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await adminStore.removeResume(resumeId)
    ElMessage.success('简历删除成功')
  } catch (error: any) {
    if (error === 'cancel' || error === 'close') {
      return
    }

    ElMessage.error(error?.response?.data?.msg || '删除简历失败')
  }
}

const handleLogout = () => {
  adminStore.logout()
  router.push('/admin-login')
  ElMessage.success('已退出管理员后台')
}

onMounted(async () => {
  await refreshList()
})
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  padding: 24px;
  background:
    radial-gradient(circle at top left, rgba(20, 184, 166, 0.12), transparent 25%),
    linear-gradient(180deg, #f8fafc 0%, #ecfeff 100%);
}

.admin-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.admin-header h1 {
  margin: 8px 0;
  color: #0f172a;
}

.admin-header p {
  margin: 0;
  color: #475569;
}

.admin-header-tag {
  display: inline-flex;
  margin: 0;
  padding: 4px 10px;
  border-radius: 999px;
  background: #115e59;
  color: #fff;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.admin-header-actions {
  display: flex;
  gap: 12px;
}

.admin-table-card {
  border-radius: 18px;
}

.skill-tag {
  margin-right: 6px;
  margin-bottom: 6px;
}

.pagination-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .admin-page {
    padding: 16px;
  }

  .admin-header {
    flex-direction: column;
  }

  .admin-header-actions {
    width: 100%;
  }
}
</style>
