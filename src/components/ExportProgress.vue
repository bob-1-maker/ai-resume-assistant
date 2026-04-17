<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  visible: boolean
  type: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const progress = ref(0)
const timer = ref<number | null>(null)

const startProgress = () => {
  progress.value = 0
  
  timer.value = window.setInterval(() => {
    if (progress.value < 90) {
      // 模拟进度，前 90% 缓慢增长
      progress.value += Math.random() * 5
    } else if (progress.value < 100) {
      // 最后 10% 快速完成
      progress.value += Math.random() * 2
    }
    
    if (progress.value >= 100) {
      progress.value = 100
      if (timer.value) {
        clearInterval(timer.value)
        timer.value = null
        // 延迟关闭，让用户看到 100% 的状态
        setTimeout(() => {
          emit('close')
        }, 500)
      }
    }
  }, 100)
}

const stopProgress = () => {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
}

onMounted(() => {
  if (props.visible) {
    startProgress()
  }
})

onUnmounted(() => {
  stopProgress()
})
</script>

<template>
  <div v-if="visible" class="export-progress-overlay">
    <div class="export-progress-container">
      <div class="export-progress-header">
        <h3>导出{{ type }}中</h3>
        <p>正在处理您的文件，请稍候...</p>
      </div>
      
      <div class="export-progress-body">
        <el-progress
          :percentage="Math.round(progress)"
          :stroke-width="20"
          :color="['#409EFF', '#67C23A']"
          status="success"
        />
        <div class="export-progress-text">
          {{ Math.round(progress) }}%
        </div>
      </div>
      
      <div class="export-progress-footer">
        <el-button type="primary" @click="stopProgress(); emit('close')">
          取消
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.export-progress-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.export-progress-container {
  width: 400px;
  background-color: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.export-progress-header {
  text-align: center;
  margin-bottom: 30px;
}

.export-progress-header h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.export-progress-header p {
  margin: 0;
  font-size: 14px;
  color: #606266;
}

.export-progress-body {
  margin-bottom: 30px;
}

.export-progress-text {
  text-align: center;
  margin-top: 10px;
  font-size: 14px;
  color: #606266;
}

.export-progress-footer {
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .export-progress-container {
    width: 90%;
    max-width: 400px;
    padding: 20px;
  }
}
</style>