import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import * as userApi from '@/api/user'
import {
  clearUserSession,
  getUserInfo,
  getUserToken,
  setUserSession
} from '@/utils/authStorage'

export const useUserStore = defineStore('user', () => {
  const storedUser = ref<{ id: number; username: string } | null>(null)

  const initUser = () => {
    const token = getUserToken()
    const userInfo = getUserInfo<{ id: number; username: string }>()

    if (token && userInfo) {
      storedUser.value = userInfo
      return
    }

    clearUserSession()
    storedUser.value = null
  }

  initUser()

  const token = computed(() => getUserToken())
  const user = computed(() => storedUser.value)
  const isLoggedIn = computed(() => !!token.value && !!storedUser.value)

  const register = async (username: string, password: string) => {
    return userApi.register(username, password)
  }

  const login = async (username: string, password: string) => {
    const response = await userApi.login(username, password)

    if (response?.code === 200 && response.data?.token) {
      setUserSession(response.data.token, response.data.user)
      storedUser.value = response.data.user
    }

    return response
  }

  const logout = () => {
    clearUserSession()
    storedUser.value = null
  }

  const getCurrentUser = async () => {
    try {
      const response = await userApi.getCurrentUser()

      if (response.data) {
        storedUser.value = response.data
      }

      return response
    } catch (error) {
      logout()
      throw error
    }
  }

  return {
    token,
    user,
    isLoggedIn,
    register,
    login,
    logout,
    getCurrentUser
  }
})
