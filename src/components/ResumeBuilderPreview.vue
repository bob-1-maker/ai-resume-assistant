<script setup lang="ts">
import SkeletonScreen from './SkeletonScreen.vue'
import TechTemplate from './templates/TechTemplate.vue'
import CampusTemplate from './templates/CampusTemplate.vue'
import BusinessTemplate from './templates/BusinessTemplate.vue'

defineProps<{
  isLoading: boolean
  currentTemplate: string
  moduleOrder: string[]
}>()
</script>

<template>
  <div class="preview-mode">
    <div v-if="isLoading" class="template-loading">
      <SkeletonScreen />
    </div>

    <div v-else class="resume-preview-container">
      <div class="resume-preview-wrapper">
        <div class="resume-preview-shell">
          <div class="resume-preview resume-export-root" :class="`tmpl-${currentTemplate}`">
            <TechTemplate
              v-if="currentTemplate === 'tech'"
              :module-order="moduleOrder"
              :current-template="currentTemplate"
            />
            <CampusTemplate
              v-else-if="currentTemplate === 'campus'"
              :module-order="moduleOrder"
              :current-template="currentTemplate"
            />
            <BusinessTemplate
              v-else
              :module-order="moduleOrder"
              :current-template="currentTemplate"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.preview-mode {
  min-height: calc(100vh - 120px);
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 40px 20px;
  background: #f5f7fa;
}

.resume-preview-container {
  width: 100%;
  display: flex;
  justify-content: center;
}

.resume-preview-wrapper {
  width: 210mm;
  margin: 0 auto;
}

.resume-preview-shell {
  width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.resume-preview {
  width: 210mm;
  min-height: 297mm;
  background: #ffffff;
  padding: 20mm;
  box-sizing: border-box;
  position: relative;
  max-width: 100%;
}

.template-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 297mm;
  width: 210mm;
  margin: 0 auto;
  background: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .preview-mode {
    padding: 20px 10px;
  }

  .resume-preview {
    width: 100%;
    min-height: auto;
  }

  .resume-preview-shell {
    width: 100%;
    min-height: auto;
  }
}
</style>
