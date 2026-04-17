<script setup lang="ts">
import { ArrowDown, DataAnalysis, Document, Download, Picture, Plus, Star } from '@element-plus/icons-vue'

defineProps<{
  templates: Array<{ id: string; name: string }>
  currentTemplate: string
  isLoading: boolean
  isPreviewMode: boolean
}>()

defineEmits<{
  (e: 'create-resume'): void
  (e: 'change-template', template: string): void
  (e: 'toggle-preview'): void
  (e: 'open-ai'): void
  (e: 'export-pdf'): void
  (e: 'export-image'): void
  (e: 'export-word'): void
  (e: 'export-json'): void
}>()
</script>

<template>
  <div class="builder-header">
    <div class="template-selector">
      <el-button type="primary" @click="$emit('create-resume')" :disabled="isLoading">
        <el-icon><Plus /></el-icon>
        新建简历
      </el-button>
      <el-button
        v-for="template in templates"
        :key="template.id"
        :type="currentTemplate === template.id ? 'primary' : 'default'"
        @click="$emit('change-template', template.id)"
        :disabled="isLoading"
      >
        {{ template.name }}
      </el-button>
    </div>

    <div class="mode-toggle">
      <el-button type="info" @click="$emit('open-ai')">
        <el-icon><Star /></el-icon>
        AI 分析
      </el-button>
      <el-dropdown v-if="isPreviewMode">
        <el-button type="primary">
          <el-icon><Download /></el-icon>
          导出
          <el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="$emit('export-pdf')">
              <el-icon><Document /></el-icon>
              导出 PDF
            </el-dropdown-item>
            <el-dropdown-item @click="$emit('export-image')">
              <el-icon><Picture /></el-icon>
              导出图片
            </el-dropdown-item>
            <el-dropdown-item @click="$emit('export-word')">
              <el-icon><Document /></el-icon>
              导出 Word
            </el-dropdown-item>
            <el-dropdown-item @click="$emit('export-json')">
              <el-icon><DataAnalysis /></el-icon>
              导出 JSON
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-button type="success" @click="$emit('toggle-preview')">
        {{ isPreviewMode ? '编辑模式' : '预览模式' }}
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.builder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: white;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.template-selector {
  display: flex;
  gap: 10px;
}

.mode-toggle {
  display: flex;
  gap: 10px;
}

@media (max-width: 768px) {
  .builder-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 10px;
  }

  .template-selector {
    flex-wrap: wrap;
  }
}
</style>
