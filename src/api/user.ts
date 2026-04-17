import { createApiClient, unwrapApiResponse } from '@/api/client'

const apiClient = createApiClient({ auth: 'user', timeout: 30000 })

const register = async (username: string, password: string) => {
  const response = await apiClient.post('/users/register', { username, password })
  return unwrapApiResponse(response)
}

const login = async (username: string, password: string) => {
  const response = await apiClient.post('/users/login', { username, password })
  return unwrapApiResponse(response)
}

const getCurrentUser = async () => {
  const response = await apiClient.get('/users/me')
  return unwrapApiResponse(response)
}

export {
  register,
  login,
  getCurrentUser
}
