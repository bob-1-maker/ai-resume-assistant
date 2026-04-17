import axios from 'axios'
import { getAdminToken, getUserToken } from '@/utils/authStorage'

type AuthScope = 'user' | 'admin' | 'none'

const resolveToken = (auth: AuthScope) => {
  if (auth === 'admin') {
    return getAdminToken()
  }

  if (auth === 'user') {
    return getUserToken()
  }

  return null
}

export const createApiClient = ({
  auth = 'user',
  timeout = 30000
}: {
  auth?: AuthScope
  timeout?: number
} = {}) => {
  const client = axios.create({
    baseURL: '/api',
    timeout,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  client.interceptors.request.use(
    (config) => {
      const token = resolveToken(auth)

      if (token) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
      }

      return config
    },
    (error) => Promise.reject(error)
  )

  return client
}

export const unwrapApiResponse = <T>(response: { data: T }) => response.data

export const unwrapApiData = <T>(response: { data: { data?: T } & T }) => {
  return response.data?.data ?? response.data
}
