<script setup lang="ts">
import { ArrowDown, ArrowUp, Menu, QuestionFilled } from '@element-plus/icons-vue'
import BasicInfoForm from './BasicInfoForm.vue'
import EducationForm from './EducationForm.vue'
import WorkForm from './WorkForm.vue'
import ProjectForm from './ProjectForm.vue'
import SkillsForm from './SkillsForm.vue'
import AwardsForm from './AwardsForm.vue'
import SelfEvaluationForm from './SelfEvaluationForm.vue'
import AIGenerate from './AIGenerate.vue'
import AIOptimize from './AIOptimize.vue'
import ResumeImport from './ResumeImport.vue'

const props = defineProps<{
  moduleOrder: string[]
  modules: Array<{ id: string; name: string }>
}>()

defineEmits<{
  (e: 'move-module', index: number, direction: number): void
}>()

const getModuleName = (moduleId: string) => {
  return props.modules.find((module) => module.id === moduleId)?.name || moduleId
}
</script>

<template>
  <div class="edit-mode">
    <ResumeImport />
    <AIGenerate />
    <AIOptimize />

    <el-card class="modules-card">
      <template #header>
        <div class="card-header">
          <span>模块排序</span>
          <el-tooltip content="拖拽调整模块顺序">
            <el-icon class="help-icon"><QuestionFilled /></el-icon>
          </el-tooltip>
        </div>
      </template>

      <div class="modules-list">
        <div
          v-for="(moduleId, index) in moduleOrder"
          :key="moduleId"
          class="module-item"
        >
          <el-icon class="drag-icon"><Menu /></el-icon>
          <span>{{ getModuleName(moduleId) }}</span>
          <div class="module-controls">
            <el-button
              type="text"
              size="small"
              @click="$emit('move-module', index, -1)"
              :disabled="index === 0"
            >
              <el-icon><ArrowUp /></el-icon>
            </el-button>
            <el-button
              type="text"
              size="small"
              @click="$emit('move-module', index, 1)"
              :disabled="index === moduleOrder.length - 1"
            >
              <el-icon><ArrowDown /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </el-card>

    <div class="modules-content">
      <div v-for="moduleId in moduleOrder" :key="moduleId" class="module-section">
        <BasicInfoForm v-if="moduleId === 'basic'" />
        <EducationForm v-else-if="moduleId === 'education'" />
        <WorkForm v-else-if="moduleId === 'work'" />
        <ProjectForm v-else-if="moduleId === 'project'" />
        <SkillsForm v-else-if="moduleId === 'skills'" />
        <AwardsForm v-else-if="moduleId === 'awards'" />
        <SelfEvaluationForm v-else-if="moduleId === 'selfEvaluation'" />
        <div v-else class="placeholder-module">
          <el-empty :description="`${getModuleName(moduleId)}模块开发中`" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.edit-mode {
  padding: 20px;
}

.modules-card {
  margin-bottom: 20px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.help-icon {
  color: #909399;
  cursor: help;
}

.modules-list {
  min-height: 200px;
}

.module-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 8px;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  transition: all 0.3s;
}

.module-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.drag-icon {
  margin-right: 12px;
  color: #c0c4cc;
}

.module-controls {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.modules-content {
  max-width: 1200px;
  margin: 0 auto;
}

.module-section {
  margin-bottom: 30px;
}

.placeholder-module {
  background: white;
  padding: 40px;
  border-radius: 8px;
  border: 1px dashed #dcdfe6;
}

@media (max-width: 768px) {
  .edit-mode {
    padding: 10px;
  }
}
</style>
