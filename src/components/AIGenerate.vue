<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElLoading, ElMessageBox } from 'element-plus'
import { MagicStick, Loading, Refresh, DocumentCopy, Check, QuestionFilled } from '@element-plus/icons-vue'
import { useResumeStore } from '@/store'

const resumeStore = useResumeStore()

const isGenerating = ref(false)
const jobType = ref('')
const style = ref('简洁')
const generatedContent = ref('')
const showResult = ref(false)

const styles = [
  { label: '简洁', value: '简洁' },
  { label: '成果', value: '成果' },
  { label: '应届生', value: '应届生' }
]

const canGenerate = computed(() => {
  return jobType.value.trim() && resumeStore.currentResume
})

const filterSensitiveInfo = (data: any) => {
  if (!data) return data
  
  const sensitiveFields = ['phone', 'email']
  const filteredData = { ...data }
  
  sensitiveFields.forEach(field => {
    if (filteredData[field]) {
      filteredData[field] = '***'
    }
  })
  
  return filteredData
}

const generateWithAI = async () => {
  if (!canGenerate.value) {
    ElMessage.warning('请填写求职岗位和个人信息')
    return
  }
  
  isGenerating.value = true
  const loading = ElLoading.service({
    lock: true,
    text: 'AI 正在生成简历...',
    background: 'rgba(0, 0, 0, 0.7)'
  })
  
  try {
    const basicInfo = filterSensitiveInfo(resumeStore.currentResume?.basic)
    
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        basicInfo,
        jobDescription: jobType.value
      })
    })
    
    if (!response.ok) {
      throw new Error('API 调用失败')
    }
    
    const result = await response.json()
    
    if (result.code === 200) {
      generatedContent.value = result.data.content
      showResult.value = true
      ElMessage.success('AI 生成成功！' + result.msg)
      console.log('AI 生成结果:', result.data.content)
    } else {
      throw new Error(result.msg || '生成失败')
    }
  } catch (error) {
    console.error('AI 生成失败:', error)
    ElMessage.error('AI 生成失败，请检查后端服务或 API Key')
  } finally {
    loading.close()
    isGenerating.value = false
  }
}

const copyToClipboard = () => {
  navigator.clipboard.writeText(generatedContent.value).then(() => {
    ElMessage.success('内容已复制到剪贴板！')
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制')
  })
}

const applyToResume = () => {
  // 解析生成的内容，提取信息
  const content = generatedContent.value
  console.log('开始解析生成的内容:', content.substring(0, 200) + '...')
  
  const parsedInfo = parseGeneratedContent(content)
  console.log('解析结果:', parsedInfo)
  
  // 显示选择对话框
  ElMessageBox.confirm('确定要将生成的内容应用到简历吗？', '应用 AI 生成示例', {
    confirmButtonText: '全部应用',
    cancelButtonText: '取消',
    distinguishCancelAndClose: true,
    type: 'warning',
    customClass: 'apply-dialog'
  }).then(() => {
    // 全部应用
    applyAllModules(parsedInfo)
  }).catch((action) => {
    if (action === 'close') {
      // 用户点击了取消，不做任何操作
      return
    }
    // 用户点击了取消，不做任何操作
  })
}

const applyAllModules = async (parsedInfo: any) => {
  if (resumeStore.currentResume) {
    // 获取当前简历的完整数据
    const currentResume = resumeStore.currentResume
    
    // 更新简历数据 - 只更新有内容的模块
    const updatedResume: ResumeInfo = {
      ...currentResume,
      basic: {
        ...currentResume.basic,
        // 只在用户未填写时才更新
        name: (parsedInfo.name && !currentResume.basic.name) ? parsedInfo.name : currentResume.basic.name,
        position: (parsedInfo.position && !currentResume.basic.position) ? parsedInfo.position : currentResume.basic.position,
        summary: parsedInfo.summary || currentResume.basic.summary
      },
      // 只在用户未填写时才更新
      skills: (parsedInfo.skills.length > 0 && currentResume.skills.length === 0) ? parsedInfo.skills : currentResume.skills,
      work: (parsedInfo.work.length > 0 && currentResume.work.length === 0) ? parsedInfo.work : currentResume.work,
      project: (parsedInfo.project.length > 0 && currentResume.project.length === 0) ? parsedInfo.project : currentResume.project,
      updatedAt: new Date().toISOString()
    }
    
    console.log('更新后的简历数据:', updatedResume)
    
    // 保存简历
    await resumeStore.saveResume(updatedResume)
    
    ElMessage.success('已成功应用到简历！')
    
    // 触发预览更新
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('resume-updated'))
    }, 100)
  }
}

// 解析生成的内容
const parseGeneratedContent = (content: string) => {
  const result = {
    name: '',
    position: '',
    summary: '',
    skills: [],
    work: [],
    project: []
  }
  
  // 将内容按行分割，方便处理
  const lines = content.split('\n')
  
  // 查找各个部分的索引
  let personalInfoStart = -1, personalInfoEnd = -1
  let skillsStart = -1, skillsEnd = -1
  let workStart = -1, workEnd = -1
  let projectStart = -1, projectEnd = -1
  
  const sectionTitles = ['个人信息', '求职意向', '个人简介', '教育背景', '工作经历', '项目经验', '技能证书', '专业技能', '演出经历', '个人评价', '自我评价']
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim()
    
    // 查找个人信息/求职意向/个人简介部分
    if ((trimmedLine.includes('个人信息') || trimmedLine.includes('求职意向') || trimmedLine.includes('个人简介')) && personalInfoStart === -1) {
      personalInfoStart = index
      // 找到下一个部分作为结束
      for (let i = index + 1; i < lines.length; i++) {
        const nextLine = lines[i].trim()
        if (sectionTitles.some(title => nextLine.includes(title) && 
            !nextLine.includes('个人信息') && 
            !nextLine.includes('求职意向') && 
            !nextLine.includes('个人简介'))) {
          personalInfoEnd = i
          break
        }
      }
      if (personalInfoEnd === -1) personalInfoEnd = lines.length
    }
    
    // 查找技能证书/专业技能部分
    if ((trimmedLine.includes('技能证书') || trimmedLine.includes('专业技能')) && skillsStart === -1) {
      skillsStart = index
      for (let i = index + 1; i < lines.length; i++) {
        const nextLine = lines[i].trim()
        if (sectionTitles.some(title => nextLine.includes(title) && 
            !nextLine.includes('技能') && 
            !nextLine.includes('专业'))) {
          skillsEnd = i
          break
        }
      }
      if (skillsEnd === -1) skillsEnd = lines.length
    }
    
    // 查找工作经历部分
    if (trimmedLine.includes('工作经历') && workStart === -1) {
      workStart = index
      for (let i = index + 1; i < lines.length; i++) {
        const nextLine = lines[i].trim()
        if (sectionTitles.some(title => nextLine.includes(title) && 
            !nextLine.includes('工作经历'))) {
          workEnd = i
          break
        }
      }
      if (workEnd === -1) workEnd = lines.length
    }
    
    // 查找项目经验/演出经历部分
    if ((trimmedLine.includes('项目经验') || trimmedLine.includes('演出经历')) && projectStart === -1) {
      projectStart = index
      for (let i = index + 1; i < lines.length; i++) {
        const nextLine = lines[i].trim()
        if (sectionTitles.some(title => nextLine.includes(title) && !nextLine.includes('项目') && !nextLine.includes('演出'))) {
          projectEnd = i
          break
        }
      }
      if (projectEnd === -1) projectEnd = lines.length
    }
  })
  
  // 解析个人信息
  if (personalInfoStart !== -1) {
    for (let i = personalInfoStart; i < personalInfoEnd; i++) {
      const line = lines[i]
      // 匹配各种格式：姓名：xxx、姓名: xxx、姓名（xxx）等
      const nameMatch = line.match(/姓名[：:\s]*([^\n（）]+)/)
      const positionMatch = line.match(/(?:求职岗位|期望岗位|职位)[：:\s]*([^\n（）]+)/)
      
      if (nameMatch) {
        const name = nameMatch[1].trim()
        if (name && !name.includes('此处') && !name.includes('待填写') && !name.includes('填写') && name.length > 0 && name.length < 20) {
          result.name = name
        }
      }
      if (positionMatch) {
        const position = positionMatch[1].trim()
        if (position && !position.includes('此处') && !position.includes('待填写') && !position.includes('填写') && position.length > 0) {
          result.position = position
        }
      }
    }
  }
  
  // 解析技能证书
  if (skillsStart !== -1) {
    for (let i = skillsStart + 1; i < skillsEnd; i++) {
      const line = lines[i].trim()
      // 匹配列表项：- xxx 或 数字. xxx 或 直接的内容
      if (line && (line.startsWith('-') || /^\d+[.．、]/.test(line) || (line.length > 2 && !line.includes('：') && !line.includes('（此处') && !line.includes('（待填写')))) {
        const skill = line.replace(/^[-\d.．、\s]+/, '').trim()
        if (skill && skill.length > 1) {
          result.skills.push({
            id: crypto.randomUUID(),
            name: skill,
            level: '熟练'
          })
        }
      }
    }
  }
  
  // 解析工作经历
  if (workStart !== -1) {
    for (let i = workStart + 1; i < workEnd; i++) {
      const line = lines[i].trim()
      // 匹配列表项：- xxx、数字. xxx、数字、xxx、或者直接的内容
      if (line && (line.startsWith('-') || /^\d+[.．、]/.test(line) || /^\d+/.test(line) || (line.includes('：') && line.length > 5))) {
        const workItem = line.replace(/^[-\d.．、\s]+/, '').trim()
        // 过滤掉占位符，但保留实际内容
        if (workItem && 
            !workItem.includes('此处应填写') && 
            !workItem.includes('（待填写') && 
            !workItem.includes('（这里填写') &&
            !workItem.includes('填写你的') &&
            workItem.length > 3) {
          result.work.push({
            id: crypto.randomUUID(),
            company: '公司名称',
            position: '职位',
            startDate: '',
            endDate: '',
            description: workItem
          })
        }
      }
    }
  }
  
  // 解析项目经验/演出经历
  if (projectStart !== -1) {
    for (let i = projectStart + 1; i < projectEnd; i++) {
      const line = lines[i].trim()
      // 匹配列表项
      if (line && (line.startsWith('-') || /^\d+[.．、]/.test(line) || /^\d+/.test(line) || (line.includes('：') && line.length > 5))) {
        const projectItem = line.replace(/^[-\d.．、\s]+/, '').trim()
        // 过滤掉占位符，但保留实际内容
        if (projectItem && 
            !projectItem.includes('此处应填写') && 
            !projectItem.includes('（待填写') && 
            !projectItem.includes('（这里填写') &&
            !projectItem.includes('填写你的') &&
            projectItem.length > 3) {
          result.project.push({
            id: crypto.randomUUID(),
            name: '项目名称',
            startDate: '',
            endDate: '',
            role: '角色',
            description: projectItem,
            technologies: []
          })
        }
      }
    }
  }
  
  return result
}
</script>

<template>
  <el-card class="ai-generate-card">
    <template #header>
      <div class="card-header">
        <span class="title">AI 简历生成</span>
        <el-tooltip content="使用 AI 智能生成简历内容">
          <el-icon class="help-icon"><QuestionFilled /></el-icon>
        </el-tooltip>
      </div>
    </template>
    
    <el-form class="ai-form">
      <el-form-item label="求职岗位" required>
        <el-input 
          v-model="jobType" 
          placeholder="请输入您的求职岗位，如：前端工程师"
          :disabled="isGenerating"
        />
      </el-form-item>
      
      <el-form-item label="生成风格">
        <el-select 
          v-model="style" 
          placeholder="请选择生成风格"
          style="width: 100%"
          :disabled="isGenerating"
        >
          <el-option
            v-for="item in styles"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item>
        <el-button 
          type="primary" 
          size="large" 
          @click="generateWithAI"
          :loading="isGenerating"
          :disabled="!canGenerate || isGenerating"
        >
          <el-icon v-if="!isGenerating"><MagicStick /></el-icon>
          <el-icon v-else><Loading /></el-icon>
          {{ isGenerating ? '生成中...' : 'AI 生成简历' }}
        </el-button>
        <el-button size="large" :disabled="isGenerating">
          <el-icon><Refresh /></el-icon>
          重新生成
        </el-button>
      </el-form-item>
    </el-form>
    
    <div class="tips">
      <el-alert
        title="使用说明"
        type="info"
        :closable="false"
        show-icon
      >
        <template #default>
          <ul>
            <li>AI 会根据求职岗位生成各个模块的<strong>示例内容</strong></li>
            <li>示例内容作为参考，帮助您填写简历</li>
            <li>您可以<strong>选择性应用</strong>某个模块的内容</li>
            <li>已填写的内容不会被覆盖</li>
            <li>生成前请确保已填写基本个人信息</li>
          </ul>
        </template>
      </el-alert>
    </div>
    
    <!-- 生成结果展示区域 -->
    <el-card v-if="showResult" class="result-card" style="margin-top: 20px;">
      <template #header>
        <div class="result-header">
          <span class="result-title">AI 生成示例</span>
          <div class="result-actions">
            <el-button size="small" @click="copyToClipboard">
              <el-icon><DocumentCopy /></el-icon>
              复制内容
            </el-button>
            <el-button type="primary" size="small" @click="applyToResume">
              <el-icon><Check /></el-icon>
              应用到简历
            </el-button>
          </div>
        </div>
      </template>
      
      <div class="result-content">
        <pre>{{ generatedContent }}</pre>
      </div>
    </el-card>
  </el-card>
</template>

<style scoped>
.ai-generate-card {
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

.ai-form {
  padding: 20px 0;
}

.tips {
  margin-top: 20px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.result-actions {
  display: flex;
  gap: 10px;
}

.result-content {
  max-height: 500px;
  overflow-y: auto;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.result-content pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: #303133;
  margin: 0;
}

@media (max-width: 768px) {
  .ai-generate-card {
    margin: 0 10px 20px 10px;
  }
  
  .ai-form {
    padding: 10px 0;
  }
  
  .result-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .result-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .result-content {
    max-height: 300px;
  }
}
</style>
