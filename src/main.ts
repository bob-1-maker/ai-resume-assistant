import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import App from './App.vue'
import './style.css'
import './assets/templates/index.css'
import router from './router/index'

const app = createApp(App)
const pinia = createPinia()

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
app.use(ElementPlus)
app.use(router)

// 监听窗口关闭事件，自动保存简历数据
if (window.__TAURI__?.window) {
  window.__TAURI__.window.getCurrent().on('close-requested', async () => {
    const { useResumeStore } = await import('./store/resume')
    const resumeStore = useResumeStore()
    await resumeStore.autoSave()
    return true
  })
}

app.mount('#app')
