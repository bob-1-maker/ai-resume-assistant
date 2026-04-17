<script setup lang="ts">
import { ref, defineExpose } from 'vue'
import { ElMessage, ElLoading, ElMessageBox } from 'element-plus'
import { useResumeStore } from '@/store'
import html2pdf from 'html2pdf.js'
import html2canvas from 'html2canvas'

const resumeStore = useResumeStore()

const exportOptions = ref({
  pdf: {
    withWatermark: false
  },
  image: {
    format: 'png',
    quality: 0.9
  }
})

const getResumeElement = () => {
  return document.querySelector('.resume-preview')
}

const getFileName = (prefix: string, extension: string) => {
  const timestamp = new Date().getTime()
  return `${prefix}_${timestamp}.${extension}`
}

const exportPDF = async () => {
  const resumeElement = getResumeElement()
  if (!resumeElement) {
    ElMessage.error('未找到简历预览元素')
    return
  }

  const loading = ElLoading.service({
    lock: true,
    text: '正在导出 PDF...',
    background: 'rgba(0, 0, 0, 0.7)'
  })

  try {
    // 添加水印（如果需要）
    let watermarkElement = null
    if (exportOptions.value.pdf.withWatermark) {
      watermarkElement = document.createElement('div')
      watermarkElement.className = 'watermark'
      watermarkElement.style.position = 'absolute'
      watermarkElement.style.top = '0'
      watermarkElement.style.left = '0'
      watermarkElement.style.width = '100%'
      watermarkElement.style.height = '100%'
      watermarkElement.style.display = 'flex'
      watermarkElement.style.justifyContent = 'center'
      watermarkElement.style.alignItems = 'center'
      watermarkElement.style.pointerEvents = 'none'
      watermarkElement.style.opacity = '0.1'
      watermarkElement.style.fontSize = '60px'
      watermarkElement.style.fontWeight = 'bold'
      watermarkElement.style.color = '#000'
      watermarkElement.style.transform = 'rotate(-45deg)'
      watermarkElement.style.zIndex = '1000'
      watermarkElement.textContent = '简历预览'
      resumeElement.appendChild(watermarkElement)
    }

    const opt = {
      margin: 0,
      filename: getFileName('简历', 'pdf'),
      image: {
        type: 'jpeg',
        quality: 0.98
      },
      html2canvas: {
        scale: 2,
        useCORS: true,
        dpi: 200
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      }
    }

    await html2pdf().set(opt).from(resumeElement).save()
    ElMessage.success('PDF 导出成功！')

    // 移除水印
    if (watermarkElement) {
      resumeElement.removeChild(watermarkElement)
    }
  } catch (error) {
    console.error('PDF 导出失败:', error)
    ElMessage.error('PDF 导出失败，请重试')
  } finally {
    loading.close()
  }
}

const exportImage = async () => {
  const resumeElement = getResumeElement()
  if (!resumeElement) {
    ElMessage.error('未找到简历预览元素')
    return
  }

  const loading = ElLoading.service({
    lock: true,
    text: '正在导出图片...',
    background: 'rgba(0, 0, 0, 0.7)'
  })

  try {
    const canvas = await html2canvas(resumeElement, {
      scale: 2,
      useCORS: true,
      dpi: 200,
      logging: false
    })

    const dataUrl = canvas.toDataURL(`image/${exportOptions.value.image.format}`, exportOptions.value.image.quality)
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = getFileName('简历', exportOptions.value.image.format)
    link.click()

    ElMessage.success('图片导出成功！')
  } catch (error) {
    console.error('图片导出失败:', error)
    ElMessage.error('图片导出失败，请重试')
  } finally {
    loading.close()
  }
}

const exportJSON = () => {
  if (!resumeStore.currentResume) {
    ElMessage.error('没有可导出的简历数据')
    return
  }

  try {
    const dataStr = JSON.stringify(resumeStore.currentResume, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = getFileName('简历备份', 'json')
    link.click()
    URL.revokeObjectURL(url)
    ElMessage.success('JSON 导出成功！')
  } catch (error) {
    console.error('JSON 导出失败:', error)
    ElMessage.error('JSON 导出失败，请重试')
  }
}

const importJSON = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (e) => {
    const target = e.target as HTMLInputElement
    if (target.files && target.files[0]) {
      const file = target.files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const jsonData = JSON.parse(event.target?.result as string)
          ElMessageBox.confirm('确定要导入此简历数据吗？这将覆盖当前简历内容。', '确认导入', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            resumeStore.saveResume(jsonData)
            ElMessage.success('JSON 导入成功！')
          }).catch(() => {
            ElMessage.info('已取消导入')
          })
        } catch (error) {
          ElMessage.error('JSON 格式错误，请检查文件')
        }
      }
      reader.readAsText(file)
    }
  }
  input.click()
}

// 暴露方法给父组件
defineExpose({
  exportPDF,
  exportImage,
  exportJSON
})
</script>

<template>
  <el-card class="export-component">
    <template #header>
      <div class="card-header">
        <span class="title">导出功能</span>
        <el-tooltip content="导出简历为不同格式">
          <el-icon class="help-icon"><QuestionFilled /></el-icon>
        </el-tooltip>
      </div>
    </template>
    
    <el-tabs type="border-card">
      <!-- PDF 导出 -->
      <el-tab-pane label="PDF 导出">
        <el-form :model="exportOptions.pdf" label-width="120px">
          <el-form-item label="导出选项">
            <el-checkbox v-model="exportOptions.pdf.withWatermark">添加水印</el-checkbox>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="large" @click="exportPDF">
              <el-icon><Download /></el-icon>
              导出 PDF
            </el-button>
            <el-button size="large" @click="exportPDF">
              <el-icon><Download /></el-icon>
              导出 PDF（无水印）
            </el-button>
          </el-form-item>
        </el-form>
        <el-alert
          title="提示"
          type="info"
          :closable="false"
          show-icon
        >
          <template #default>
            <ul>
              <li>PDF 导出尺寸为 A4</li>
              <li>分辨率为 200dpi</li>
              <li>文件名格式：简历_时间戳.pdf</li>
            </ul>
          </template>
        </el-alert>
      </el-tab-pane>
      
      <!-- 图片导出 -->
      <el-tab-pane label="图片导出">
        <el-form :model="exportOptions.image" label-width="120px">
          <el-form-item label="图片格式">
            <el-radio-group v-model="exportOptions.image.format">
              <el-radio label="png">PNG</el-radio>
              <el-radio label="jpg">JPG</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="图片质量">
            <el-slider v-model="exportOptions.image.quality" :min="0.1" :max="1" :step="0.1" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="large" @click="exportImage">
              <el-icon><Download /></el-icon>
              导出图片
            </el-button>
          </el-form-item>
        </el-form>
        <el-alert
          title="提示"
          type="info"
          :closable="false"
          show-icon
        >
          <template #default>
            <ul>
              <li>导出分辨率 ≥1080P</li>
              <li>适配移动端分享</li>
              <li>文件名格式：简历_时间戳.格式</li>
            </ul>
          </template>
        </el-alert>
      </el-tab-pane>
      
      <!-- 备份功能 -->
      <el-tab-pane label="备份功能">
        <el-form label-width="120px">
          <el-form-item>
            <el-button type="primary" size="large" @click="exportJSON">
              <el-icon><Download /></el-icon>
              导出 JSON
            </el-button>
            <el-button type="success" size="large" @click="importJSON">
              <el-icon><Upload /></el-icon>
              导入 JSON
            </el-button>
          </el-form-item>
        </el-form>
        <el-alert
          title="提示"
          type="info"
          :closable="false"
          show-icon
        >
          <template #default>
            <ul>
              <li>导出为 JSON 格式备份文件</li>
              <li>导入前会进行二次确认</li>
              <li>导入会覆盖当前简历内容</li>
            </ul>
          </template>
        </el-alert>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<style scoped>
.export-component {
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

.title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.help-icon {
  color: #909399;
  cursor: help;
}

@media (max-width: 768px) {
  .export-component {
    margin: 0 10px 20px 10px;
  }
}
</style>
