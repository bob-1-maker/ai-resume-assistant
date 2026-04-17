import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getAdminToken, getAdminUser, getUserToken } from '@/utils/authStorage'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: {
      requiresAuth: false,
      requiresAdmin: false
    }
  },
  {
    path: '/admin-login',
    name: 'AdminLogin',
    component: () => import('../views/AdminLogin.vue'),
    meta: {
      requiresAuth: false,
      requiresAdmin: false
    }
  },
  {
    path: '/admin',
    name: 'AdminResumes',
    component: () => import('../views/AdminResumeList.vue'),
    meta: {
      requiresAuth: false,
      requiresAdmin: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userToken = getUserToken()
  const adminToken = getAdminToken()
  const adminUser = getAdminUser<{ username: string; isAdmin?: boolean }>()

  if (to.meta.requiresAdmin) {
    if (adminToken && adminUser?.isAdmin) {
      next()
    } else {
      ElMessage.warning('请先登录管理员后台')
      next('/admin-login')
    }
    return
  }

  if (to.meta.requiresAuth) {
    if (userToken) {
      next()
    } else {
      ElMessage.warning('请先登录')
      next('/login')
    }
    return
  }

  if (userToken && to.path === '/login') {
    next('/')
    return
  }

  if (adminToken && adminUser?.isAdmin && to.path === '/admin-login') {
    next('/admin')
    return
  }

  next()
})

export default router
