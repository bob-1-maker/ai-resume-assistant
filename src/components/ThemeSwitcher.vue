<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
// 从Element Plus图标库导入图标
import { Star, Moon, ArrowDown } from '@element-plus/icons-vue'

// 主题列表
const themes = [
  { value: 'default', label: '商务蓝', icon: 'Star' },
  { value: 'gray', label: '简约黑灰', icon: 'Moon' },
  { value: 'green', label: '清新绿', icon: 'Star' }
]

// 当前主题
const currentTheme = ref('default')

// 从localStorage加载主题
const loadThemeFromStorage = () => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme && ['default', 'gray', 'green'].includes(savedTheme)) {
    currentTheme.value = savedTheme
  }
}

// 保存主题到localStorage
const saveThemeToStorage = (theme: string) => {
  localStorage.setItem('theme', theme)
}

// 切换主题
const changeTheme = (theme: string) => {
  // 移除所有主题类
  document.body.classList.remove('theme-gray', 'theme-green')
  
  // 添加新主题类
  if (theme === 'gray') {
    document.body.classList.add('theme-gray')
  } else if (theme === 'green') {
    document.body.classList.add('theme-green')
  }
  
  currentTheme.value = theme
  saveThemeToStorage(theme)
  ElMessage.success(`已切换到${getThemeName(theme)}主题`)
}

// 获取主题名称
const getThemeName = (theme: string): string => {
  const themeMap = {
    default: '商务蓝',
    gray: '简约黑灰',
    green: '清新绿'
  }
  return themeMap[theme as keyof typeof themeMap] || theme
}

// 获取主题图标组件
const getThemeIcon = (theme: string) => {
  const iconMap: Record<string, any> = {
    default: Star,
    gray: Moon,
    green: Star
  }
  return iconMap[theme] || Star
}

// 初始化
onMounted(() => {
  loadThemeFromStorage()
  changeTheme(currentTheme.value)
})
</script>

<template>
  <div class="theme-switcher">
    <el-dropdown @command="changeTheme" trigger="click">
      <el-button type="default" plain class="theme-button">
        <component :is="getThemeIcon(currentTheme)" class="theme-icon" />
        {{ getThemeName(currentTheme) }}
        <el-icon class="el-icon--right"><ArrowDown /></el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item 
            v-for="theme in themes" 
            :key="theme.value" 
            :command="theme.value"
          >
            <component :is="getThemeIcon(theme.value)" class="theme-item-icon" />
            {{ theme.label }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<style scoped>
.theme-switcher {
  display: inline-block;
}

.theme-button {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.theme-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.theme-icon {
  margin-right: 8px;
  font-size: 16px;
}

.theme-item-icon {
  margin-right: 8px;
  font-size: 14px;
}

/* 确保下拉菜单样式一致 */
:deep(.el-dropdown-menu) {
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--border-color);
}

:deep(.el-dropdown-item) {
  padding: 8px 16px;
  transition: all 0.2s ease;
}

:deep(.el-dropdown-item:hover) {
  background-color: var(--theme-light-bg);
  color: var(--theme-color);
}
</style>