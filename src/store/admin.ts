import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  adminLogin,
  deleteAdminResume,
  getAdminResumes,
  type AdminResumeRecord,
  type AdminUser
} from '@/api/admin'
import {
  clearAdminSession,
  getAdminToken,
  getAdminUser,
  setAdminSession
} from '@/utils/authStorage'

export const useAdminStore = defineStore('admin', () => {
  const storedUser = ref<AdminUser | null>(null)
  const resumeList = ref<AdminResumeRecord[]>([])
  const isLoading = ref(false)
  const pagination = ref({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  })

  const initAdmin = () => {
    const adminToken = getAdminToken()
    const adminUser = getAdminUser<AdminUser>()

    if (!adminToken || !adminUser) {
      clearAdminSession()
      storedUser.value = null
      return
    }

    storedUser.value = adminUser
  }

  initAdmin()

  const token = computed(() => getAdminToken())
  const user = computed(() => storedUser.value)
  const isLoggedIn = computed(() => !!token.value && !!storedUser.value?.isAdmin)

  const login = async (username: string, password: string) => {
    const response = await adminLogin(username, password)

    if (response?.code === 200 && response.data?.token) {
      setAdminSession(response.data.token, response.data.user)
      storedUser.value = response.data.user
    }

    return response
  }

  const logout = () => {
    clearAdminSession()
    storedUser.value = null
    resumeList.value = []
    pagination.value = {
      page: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0
    }
  }

  const fetchResumes = async (page = 1, pageSize = 10) => {
    isLoading.value = true

    try {
      const response = await getAdminResumes(page, pageSize)
      resumeList.value = response.data.list
      pagination.value = response.data.pagination
      return response
    } finally {
      isLoading.value = false
    }
  }

  const removeResume = async (resumeId: string) => {
    const response = await deleteAdminResume(resumeId)
    await fetchResumes(pagination.value.page, pagination.value.pageSize)
    return response
  }

  return {
    token,
    user,
    isLoggedIn,
    isLoading,
    resumeList,
    pagination,
    login,
    logout,
    fetchResumes,
    removeResume
  }
})
