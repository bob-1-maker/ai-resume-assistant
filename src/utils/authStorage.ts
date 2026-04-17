export const USER_TOKEN_KEY = 'userToken'
export const USER_INFO_KEY = 'userInfo'
export const ADMIN_TOKEN_KEY = 'adminToken'
export const ADMIN_USER_KEY = 'adminUser'

const getStorage = () => {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage
}

const getRawItem = (key: string) => getStorage()?.getItem(key) ?? null
const setRawItem = (key: string, value: string) => getStorage()?.setItem(key, value)
const removeRawItem = (key: string) => getStorage()?.removeItem(key)

export const normalizeToken = (token: unknown) => String(token).replace(/^"|"$/g, '')

const readJson = <T>(key: string): T | null => {
  const raw = getRawItem(key)

  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as T
  } catch {
    removeRawItem(key)
    return null
  }
}

export const getUserToken = () => {
  const token = getRawItem(USER_TOKEN_KEY)
  return token ? normalizeToken(token) : null
}

export const getAdminToken = () => {
  const token = getRawItem(ADMIN_TOKEN_KEY)
  return token ? normalizeToken(token) : null
}

export const getUserInfo = <T>() => readJson<T>(USER_INFO_KEY)
export const getAdminUser = <T>() => readJson<T>(ADMIN_USER_KEY)

export const setUserSession = (token: unknown, user: unknown) => {
  setRawItem(USER_TOKEN_KEY, normalizeToken(token))
  setRawItem(USER_INFO_KEY, JSON.stringify(user))
}

export const setAdminSession = (token: unknown, user: unknown) => {
  setRawItem(ADMIN_TOKEN_KEY, normalizeToken(token))
  setRawItem(ADMIN_USER_KEY, JSON.stringify(user))
}

export const clearUserSession = () => {
  removeRawItem(USER_TOKEN_KEY)
  removeRawItem(USER_INFO_KEY)
}

export const clearAdminSession = () => {
  removeRawItem(ADMIN_TOKEN_KEY)
  removeRawItem(ADMIN_USER_KEY)
}
