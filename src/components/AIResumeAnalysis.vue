<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElLoading, ElProgress, ElCard, ElSelect, ElOption, ElButton, ElEmpty, ElDivider } from 'element-plus'
import { useResumeStore } from '@/store'
import { Star, Position, Check, Warning, Download, Delete, Clock } from '@element-plus/icons-vue'

const resumeStore = useResumeStore()

// 分析状态
const isAnalyzing = ref(false)
const analysisResult = ref<any>(null)
const currentStep = ref(0)
const totalSteps = 4
const analysisProgress = ref(0)

// 目标岗位
const targetPosition = ref('前端开发')
const positionOptions = [
  { label: '前端开发', value: '前端开发' },
  { label: '后端开发', value: '后端开发' },
  { label: '全栈开发', value: '全栈开发' },
  { label: '移动端开发', value: '移动端开发' },
  { label: '产品经理', value: '产品经理' },
  { label: 'UI/UX设计', value: 'UI/UX设计' },
  { label: '数据分析师', value: '数据分析师' },
  { label: '测试工程师', value: '测试工程师' },
  { label: '运维工程师', value: '运维工程师' },
  { label: '算法工程师', value: '算法工程师' },
  { label: '架构师', value: '架构师' },
  { label: '技术经理', value: '技术经理' },
  { label: '项目经理', value: '项目经理' }
]

// AI API配置
const useRealAI = ref(false)
const analysisHistory = ref<any[]>([])

// 分析维度
const analysisDimensions = [
  { key: 'completeness', label: '完整性', icon: Check },
  { key: 'positionFit', label: '岗位适配度', icon: Position },
  { key: 'expressionQuality', label: '表达质量', icon: Star },
  { key: 'structureStandard', label: '结构规范', icon: Warning }
]

// 从localStorage加载历史记录
const loadAnalysisHistory = () => {
  try {
    const saved = localStorage.getItem('resumeAnalysisHistory')
    if (saved) {
      analysisHistory.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('加载历史记录失败:', error)
  }
}

// 保存分析记录到localStorage
const saveAnalysisHistory = (result: any) => {
  try {
    const historyItem = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      position: targetPosition.value,
      result: result
    }
    
    analysisHistory.value.unshift(historyItem)
    
    // 只保留最近10条记录
    if (analysisHistory.value.length > 10) {
      analysisHistory.value = analysisHistory.value.slice(0, 10)
    }
    
    localStorage.setItem('resumeAnalysisHistory', JSON.stringify(analysisHistory.value))
  } catch (error) {
    console.error('保存历史记录失败:', error)
  }
}

// 导出分析结果
const exportAnalysisResult = () => {
  if (!analysisResult.value) {
    ElMessage.warning('请先进行分析')
    return
  }
  
  try {
    const exportData = {
      timestamp: new Date().toISOString(),
      position: targetPosition.value,
      totalScore: analysisResult.value.totalScore,
      dimensions: analysisResult.value.dimensions,
      highlights: analysisResult.value.highlights,
      selfEvaluation: analysisResult.value.selfEvaluation
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `简历分析结果_${targetPosition.value}_${new Date().getTime()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    ElMessage.success('分析结果已导出')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请重试')
  }
}

// 导出为Word文档
const exportToWord = () => {
  if (!analysisResult.value) {
    ElMessage.warning('请先进行分析')
    return
  }
  
  try {
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>简历AI分析结果</title>
        <style>
          body { font-family: 'Microsoft YaHei', sans-serif; padding: 40px; line-height: 1.6; }
          h1 { color: #1677FF; border-bottom: 2px solid #1677FF; padding-bottom: 10px; }
          h2 { color: #333; margin-top: 30px; }
          .score { font-size: 24px; font-weight: bold; color: #1677FF; }
          .dimension { margin: 20px 0; padding: 15px; background: #f5f7fa; border-radius: 8px; }
          .suggestion { margin: 10px 0; padding-left: 20px; }
          .highlight { margin: 10px 0; padding-left: 20px; }
        </style>
      </head>
      <body>
        <h1>简历AI分析报告</h1>
        <p><strong>目标岗位：</strong>${targetPosition.value}</p>
        <p><strong>分析时间：</strong>${new Date().toLocaleString()}</p>
        <p><strong>综合评分：</strong><span class="score">${analysisResult.value.totalScore}分</span></p>
        
        <h2>维度分析</h2>
        ${Object.entries(analysisResult.value.dimensions).map(([key, dimension]: [string, any]) => `
          <div class="dimension">
            <h3>${dimension.label || key} - ${dimension.score}分</h3>
            <p><strong>评分依据：</strong></p>
            <ul>
              ${dimension.basis.map((b: string) => `<li>${b}</li>`).join('')}
            </ul>
            <p><strong>优化建议：</strong></p>
            <ul>
              ${dimension.suggestions.map((s: string) => `<li>${s}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
        
        <h2>简历亮点</h2>
        ${analysisResult.value.highlights.map((h: string) => `<p class="highlight">✓ ${h}</p>`).join('')}
        
        <h2>自动生成自我评价</h2>
        <p>${analysisResult.value.selfEvaluation}</p>
      </body>
      </html>
    `
    
    const blob = new Blob([content], { type: 'application/msword' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `简历分析结果_${targetPosition.value}_${new Date().getTime()}.doc`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    ElMessage.success('分析结果已导出为Word文档')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请重试')
  }
}

// 查看历史记录详情
const viewHistoryDetail = (historyItem: any) => {
  analysisResult.value = historyItem.result
  targetPosition.value = historyItem.position
}

// 删除历史记录
const deleteHistoryItem = (id: number) => {
  analysisHistory.value = analysisHistory.value.filter(item => item.id !== id)
  localStorage.setItem('resumeAnalysisHistory', JSON.stringify(analysisHistory.value))
  ElMessage.success('历史记录已删除')
}

// 清空所有历史记录
const clearAllHistory = () => {
  analysisHistory.value = []
  localStorage.removeItem('resumeAnalysisHistory')
  ElMessage.success('所有历史记录已清空')
}

// 组件挂载时加载历史记录
onMounted(() => {
  loadAnalysisHistory()
  
  // 加载API配置
  try {
    const savedUseRealAI = localStorage.getItem('useRealAI')
    if (savedUseRealAI) {
      useRealAI.value = savedUseRealAI === 'true'
    }
  } catch (error) {
    console.error('加载API配置失败:', error)
  }
})

// 保存API配置
const saveApiConfig = () => {
  try {
    localStorage.setItem('useRealAI', String(useRealAI.value))
    ElMessage.success('API配置已保存')
  } catch (error) {
    console.error('保存API配置失败:', error)
    ElMessage.error('保存失败，请重试')
  }
}

// 调用真实AI API
const callRealAIAPI = async (resume: any, position: string): Promise<any> => {
  // 固定硅基流动API密钥
  const apiKey = 'sk-dqkhnozyghmxfqgtfiqmncvnpzwlwdyewnboiorktxrvpjpo'
  
  const prompt = `
    请分析以下简历，针对${position}岗位进行评估，返回JSON格式的分析结果。
    
    简历信息：
    ${JSON.stringify(resume, null, 2)}
    
    请从以下4个维度进行分析：
    1. 完整性 - 评估简历信息的完整程度
    2. 岗位适配度 - 评估简历与${position}岗位的匹配程度
    3. 表达质量 - 评估简历内容的表达质量
    4. 结构规范 - 评估简历结构的规范性
    
    返回格式要求：
    {
      "totalScore": 0-100的整数,
      "dimensions": {
        "completeness": {
          "score": 0-100的整数,
          "basis": ["评分依据1", "评分依据2"],
          "suggestions": ["建议1", "建议2"]
        },
        "positionFit": {
          "score": 0-100的整数,
          "basis": ["评分依据1", "评分依据2"],
          "suggestions": ["建议1", "建议2"]
        },
        "expressionQuality": {
          "score": 0-100的整数,
          "basis": ["评分依据1", "评分依据2"],
          "suggestions": ["建议1", "建议2"]
        },
        "structureStandard": {
          "score": 0-100的整数,
          "basis": ["评分依据1", "评分依据2"],
          "suggestions": ["建议1", "建议2"]
        }
      },
      "highlights": ["亮点1", "亮点2", "亮点3"],
      "selfEvaluation": "自动生成的自我评价内容"
    }
  `
  
  try {
    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-ai/DeepSeek-V3.2',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    })
    
    console.log('API响应状态:', response.status)
    console.log('API响应状态文本:', response.statusText)
    
    const data = await response.json()
    
    console.log('API响应:', data)
    
    if (data.error) {
      throw new Error(data.error.message || JSON.stringify(data.error))
    }
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('API返回格式错误：缺少choices字段')
    }
    
    if (!data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      throw new Error('API返回格式错误：缺少message.content字段')
    }
    
    const content = data.choices[0].message.content
    
    // 提取JSON内容
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('AI返回格式错误：无法提取JSON内容')
    }
    
    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error('AI API调用失败:', error)
    throw error
  }
}

// 模拟AI分析（实际项目中应调用真实的AI API）
const analyzeResume = async () => {
  if (!resumeStore.currentResume) {
    ElMessage.error('请先创建或选择一份简历')
    return
  }

  isAnalyzing.value = true
  analysisResult.value = null
  currentStep.value = 0
  analysisProgress.value = 0

  const loading = ElLoading.service({
    lock: true,
    text: 'AI 分析中...',
    background: 'rgba(0, 0, 0, 0.7)'
  })

  try {
    // 模拟分析过程
    for (let i = 0; i < totalSteps; i++) {
      await new Promise(resolve => setTimeout(resolve, 800))
      currentStep.value = i + 1
      analysisProgress.value = (i + 1) * 25
    }

    // 根据配置选择使用真实AI还是模拟分析
    let result: any
    if (useRealAI.value) {
      try {
        result = await callRealAIAPI(resumeStore.currentResume, targetPosition.value)
      } catch (error) {
        ElMessage.error(`AI分析失败: ${(error as Error).message}，已切换到模拟分析`)
        result = await getMockAnalysisResult()
      }
    } else {
      result = await getMockAnalysisResult()
    }

    analysisResult.value = result
    
    // 保存到历史记录
    saveAnalysisHistory(result)
    
    ElMessage.success('AI 分析完成！')
  } catch (error) {
    console.error('AI 分析失败:', error)
    ElMessage.error('分析失败，请重试')
  } finally {
    loading.close()
    isAnalyzing.value = false
  }
}

// 模拟AI分析结果
const getMockAnalysisResult = async (): Promise<any> => {
  const resume = resumeStore.currentResume
  
  // 基于简历内容生成分析结果
  const completenessScore = calculateCompletenessScore(resume)
  const positionFitScore = calculatePositionFitScore(resume, targetPosition.value)
  const expressionQualityScore = calculateExpressionQualityScore(resume)
  const structureStandardScore = calculateStructureStandardScore(resume)
  
  const totalScore = Math.round((completenessScore + positionFitScore + expressionQualityScore + structureStandardScore) / 4)

  return {
    totalScore,
    dimensions: {
      completeness: {
        score: completenessScore,
        basis: getCompletenessBasis(resume),
        suggestions: getCompletenessSuggestions(resume)
      },
      positionFit: {
        score: positionFitScore,
        basis: getPositionFitBasis(resume, targetPosition.value),
        suggestions: getPositionFitSuggestions(resume, targetPosition.value)
      },
      expressionQuality: {
        score: expressionQualityScore,
        basis: getExpressionQualityBasis(resume),
        suggestions: getExpressionQualitySuggestions(resume)
      },
      structureStandard: {
        score: structureStandardScore,
        basis: getStructureStandardBasis(resume),
        suggestions: getStructureStandardSuggestions(resume)
      }
    },
    highlights: generateHighlights(resume, targetPosition.value),
    selfEvaluation: generateSelfEvaluation(resume, targetPosition.value)
  }
}

// 生成简历亮点
const generateHighlights = (resume: any, position: string): string[] => {
  const highlights: string[] = []
  
  // 基于简历内容生成亮点
  if (resume?.basic?.summary && resume.basic.summary.length > 50) {
    highlights.push('个人简介内容充实，清晰表达了职业目标')
  }
  
  const projects = resume?.project || []
  if (projects.length > 0) {
    highlights.push(`拥有${projects.length}个项目经验，实践能力强`)
  }
  
  const skills = resume?.skills || []
  if (skills.length > 5) {
    highlights.push('技术栈丰富，具备多种技能')
  }
  
  const workExperience = resume?.work || []
  if (workExperience.length > 0) {
    highlights.push('具有工作经验，熟悉职场环境')
  }
  
  // 根据不同岗位生成特定亮点
  if (position === '前端开发' || position === '全栈开发' || position === '移动端开发') {
    const frontendSkills = ['Vue', 'React', 'JavaScript', 'TypeScript', 'HTML', 'CSS']
    const hasFrontendSkills = skills.some((skill: any) => 
      frontendSkills.some(fs => skill.name?.includes(fs))
    )
    if (hasFrontendSkills) {
      highlights.push('具备前端开发所需的核心技能')
    }
  } else if (position === '后端开发' || position === '全栈开发') {
    const backendSkills = ['Java', 'Python', 'Go', 'Node.js', 'Spring', 'Django']
    const hasBackendSkills = skills.some((skill: any) => 
      backendSkills.some(bs => skill.name?.includes(bs))
    )
    if (hasBackendSkills) {
      highlights.push('具备后端开发所需的核心技能')
    }
  } else if (position === '产品经理') {
    if (resume?.basic?.summary?.includes('产品') || resume?.basic?.summary?.includes('用户')) {
      highlights.push('具备产品思维和用户视角')
    }
  } else if (position === 'UI/UX设计') {
    const designSkills = ['Figma', 'Sketch', 'Photoshop', '设计', 'UI', 'UX']
    const hasDesignSkills = skills.some((skill: any) => 
      designSkills.some(ds => skill.name?.includes(ds))
    )
    if (hasDesignSkills) {
      highlights.push('具备设计工具和设计思维')
    }
  } else if (position === '数据分析师') {
    const dataSkills = ['SQL', 'Python', 'R', '数据分析', '数据挖掘', '机器学习']
    const hasDataSkills = skills.some((skill: any) => 
      dataSkills.some(ds => skill.name?.includes(ds))
    )
    if (hasDataSkills) {
      highlights.push('具备数据分析相关技能')
    }
  }
  
  if (highlights.length === 0) {
    highlights.push('简历基础信息完整')
  }
  
  return highlights
}

// 生成自我评价
const generateSelfEvaluation = (resume: any, position: string): string => {
  let evaluation = ''
  
  // 根据不同岗位生成不同的自我评价
  if (position === '前端开发' || position === '全栈开发' || position === '移动端开发') {
    evaluation = '具备扎实的前端开发技能，熟悉Vue/React等现代前端框架，注重代码质量和用户体验。拥有良好的团队协作能力和问题解决能力，能够快速适应新环境和新技术。对前端工程化和性能优化有深入了解，致力于构建高质量的Web应用。'
  } else if (position === '后端开发' || position === '全栈开发') {
    evaluation = '具备扎实的后端开发技能，熟悉Java/Python等编程语言，掌握数据库设计和API开发。注重系统架构和性能优化，能够设计可扩展的后端系统。拥有良好的问题解决能力和团队协作精神，致力于构建稳定可靠的后端服务。'
  } else if (position === '产品经理') {
    evaluation = '具备产品思维和用户视角，擅长需求分析和产品规划。熟悉产品开发流程，能够协调设计、开发和测试团队。注重数据驱动决策，善于沟通和表达，致力于打造用户满意的产品。'
  } else if (position === 'UI/UX设计') {
    evaluation = '具备良好的设计审美和用户体验意识，熟悉设计工具和设计规范。注重用户研究和交互设计，能够将复杂的业务需求转化为直观的设计方案。拥有良好的沟通能力和团队协作精神，致力于创造美观实用的产品界面。'
  } else if (position === '数据分析师') {
    evaluation = '具备扎实的数据分析技能，熟悉SQL、Python等数据分析工具。擅长数据可视化和数据建模，能够从数据中提取有价值的 insights。注重数据质量和分析方法，能够为业务决策提供数据支持。'
  } else if (position === '测试工程师') {
    evaluation = '具备扎实的测试技能，熟悉自动化测试、性能测试等方法。注重测试用例设计和缺陷管理，能够保证产品质量。拥有良好的问题发现和分析能力，致力于提升产品的稳定性和可靠性。'
  } else if (position === '运维工程师') {
    evaluation = '具备扎实的运维技能，熟悉Linux、Docker、Kubernetes等技术。注重系统稳定性和安全性，能够快速响应和处理故障。拥有良好的问题排查和优化能力，致力于保障系统的高可用性。'
  } else if (position === '算法工程师') {
    evaluation = '具备扎实的算法和数学基础，熟悉机器学习、深度学习等技术。注重算法优化和模型调优，能够解决复杂的技术问题。拥有良好的研究和创新能力，致力于将先进算法应用到实际业务中。'
  } else if (position === '架构师') {
    evaluation = '具备丰富的系统设计经验，熟悉微服务、分布式系统等架构模式。注重系统可扩展性和可维护性，能够设计高可用的技术架构。拥有良好的技术决策和团队指导能力，致力于构建稳定可靠的技术平台。'
  } else if (position === '技术经理' || position === '项目经理') {
    evaluation = '具备良好的管理能力和沟通技巧，熟悉项目管理和团队协作。注重项目进度和质量控制，能够协调各方资源完成项目目标。拥有良好的问题解决和决策能力，致力于提升团队效率和项目成功率。'
  } else {
    evaluation = '具备良好的专业素养和学习能力，注重个人成长和职业发展。拥有良好的团队协作精神和沟通能力，能够快速适应新环境和新挑战。致力于在工作中发挥自己的专业技能，为团队和公司创造价值。'
  }
  
  return evaluation
}

// 计算完整性分数
const calculateCompletenessScore = (resume: any): number => {
  let score = 100
  
  if (!resume?.basic?.name) score -= 10
  if (!resume?.basic?.phone) score -= 8
  if (!resume?.basic?.email) score -= 8
  if (!resume?.basic?.position) score -= 10
  if (!resume?.education || resume.education.length === 0) score -= 15
  if (!resume?.work || resume.work.length === 0) score -= 20
  if (!resume?.skills || resume.skills.length === 0) score -= 10
  
  return Math.max(score, 0)
}

// 计算岗位适配度分数
const calculatePositionFitScore = (resume: any, position: string): number => {
  let score = 100
  
  // 根据不同岗位评估适配度
  if (position === '前端开发' || position === '全栈开发' || position === '移动端开发') {
    const skills = resume?.skills || []
    const frontendSkills = ['Vue', 'React', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Node.js', 'webpack', 'vite']
    const matchedSkills = skills.filter((skill: any) => 
      frontendSkills.some(fs => skill.name?.includes(fs))
    )
    
    if (matchedSkills.length < 3) score -= 30
    if (matchedSkills.length < 5) score -= 20
    
    // 检查项目经验
    if (!resume?.project || resume.project.length === 0) score -= 20
  } else if (position === '后端开发' || position === '全栈开发') {
    const skills = resume?.skills || []
    const backendSkills = ['Java', 'Python', 'Go', 'Node.js', 'Spring', 'Django', 'MySQL', 'Redis']
    const matchedSkills = skills.filter((skill: any) => 
      backendSkills.some(bs => skill.name?.includes(bs))
    )
    
    if (matchedSkills.length < 3) score -= 30
    if (matchedSkills.length < 5) score -= 20
    
    if (!resume?.project || resume.project.length === 0) score -= 20
  } else if (position === '产品经理') {
    const skills = resume?.skills || []
    const pmSkills = ['产品', '需求', '原型', '用户研究', '数据分析', '项目管理']
    const matchedSkills = skills.filter((skill: any) => 
      pmSkills.some(ps => skill.name?.includes(ps))
    )
    
    if (matchedSkills.length < 2) score -= 30
    if (!resume?.work || resume.work.length === 0) score -= 20
  } else if (position === 'UI/UX设计') {
    const skills = resume?.skills || []
    const designSkills = ['Figma', 'Sketch', 'Photoshop', '设计', 'UI', 'UX', '原型']
    const matchedSkills = skills.filter((skill: any) => 
      designSkills.some(ds => skill.name?.includes(ds))
    )
    
    if (matchedSkills.length < 2) score -= 30
    if (!resume?.project || resume.project.length === 0) score -= 20
  } else if (position === '数据分析师') {
    const skills = resume?.skills || []
    const dataSkills = ['SQL', 'Python', 'R', '数据分析', '数据挖掘', '机器学习', 'Excel', 'Tableau']
    const matchedSkills = skills.filter((skill: any) => 
      dataSkills.some(ds => skill.name?.includes(ds))
    )
    
    if (matchedSkills.length < 3) score -= 30
    if (!resume?.project || resume.project.length === 0) score -= 20
  } else if (position === '测试工程师') {
    const skills = resume?.skills || []
    const testSkills = ['测试', '自动化', '性能测试', 'Selenium', 'JMeter', '接口测试']
    const matchedSkills = skills.filter((skill: any) => 
      testSkills.some(ts => skill.name?.includes(ts))
    )
    
    if (matchedSkills.length < 2) score -= 30
    if (!resume?.work || resume.work.length === 0) score -= 20
  } else if (position === '运维工程师') {
    const skills = resume?.skills || []
    const opsSkills = ['Linux', 'Docker', 'Kubernetes', 'Jenkins', 'CI/CD', '监控', '部署']
    const matchedSkills = skills.filter((skill: any) => 
      opsSkills.some(os => skill.name?.includes(os))
    )
    
    if (matchedSkills.length < 3) score -= 30
    if (!resume?.work || resume.work.length === 0) score -= 20
  } else if (position === '算法工程师') {
    const skills = resume?.skills || []
    const algoSkills = ['机器学习', '深度学习', '算法', 'Python', 'TensorFlow', 'PyTorch', '数学']
    const matchedSkills = skills.filter((skill: any) => 
      algoSkills.some(as => skill.name?.includes(as))
    )
    
    if (matchedSkills.length < 3) score -= 30
    if (!resume?.project || resume.project.length === 0) score -= 20
  } else if (position === '架构师') {
    const skills = resume?.skills || []
    const archSkills = ['微服务', '分布式', '架构', '系统设计', '高并发', '缓存', '消息队列']
    const matchedSkills = skills.filter((skill: any) => 
      archSkills.some(ars => skill.name?.includes(ars))
    )
    
    if (matchedSkills.length < 3) score -= 30
    if (!resume?.work || resume.work.length === 0) score -= 20
  } else if (position === '技术经理' || position === '项目经理') {
    const skills = resume?.skills || []
    const mgmtSkills = ['管理', '领导', '协调', '沟通', '项目管理', '团队', '决策']
    const matchedSkills = skills.filter((skill: any) => 
      mgmtSkills.some(ms => skill.name?.includes(ms))
    )
    
    if (matchedSkills.length < 2) score -= 30
    if (!resume?.work || resume.work.length === 0) score -= 20
  }
  
  return Math.max(score, 0)
}

// 计算表达质量分数
const calculateExpressionQualityScore = (resume: any): number => {
  let score = 100
  
  // 检查个人简介
  if (!resume?.basic?.summary || resume.basic.summary.length < 50) score -= 20
  
  // 检查项目描述
  const projects = resume?.project || []
  projects.forEach((project: any) => {
    if (!project.description || project.description.length < 100) score -= 5
  })
  
  return Math.max(score, 0)
}

// 计算结构规范分数
const calculateStructureStandardScore = (resume: any): number => {
  let score = 100
  
  // 检查模块完整性
  const requiredModules = ['basic', 'education', 'work', 'skills']
  requiredModules.forEach(module => {
    if (!resume?.[module] || (Array.isArray(resume[module]) && resume[module].length === 0)) {
      score -= 15
    }
  })
  
  return Math.max(score, 0)
}

// 获取完整性依据
const getCompletenessBasis = (resume: any): string[] => {
  const basis: string[] = []
  
  if (!resume?.basic?.name) basis.push('缺少姓名信息')
  if (!resume?.basic?.phone) basis.push('缺少联系电话')
  if (!resume?.basic?.email) basis.push('缺少邮箱地址')
  if (!resume?.basic?.position) basis.push('缺少求职意向')
  if (!resume?.education || resume.education.length === 0) basis.push('缺少教育经历')
  if (!resume?.work || resume.work.length === 0) basis.push('缺少工作经历')
  if (!resume?.skills || resume.skills.length === 0) basis.push('缺少技能信息')
  
  if (basis.length === 0) basis.push('简历信息完整')
  
  return basis
}

// 获取完整性建议
const getCompletenessSuggestions = (resume: any): string[] => {
  const suggestions: string[] = []
  
  if (!resume?.basic?.name) suggestions.push('添加姓名信息')
  if (!resume?.basic?.phone) suggestions.push('添加联系电话')
  if (!resume?.basic?.email) suggestions.push('添加邮箱地址')
  if (!resume?.basic?.position) suggestions.push('添加求职意向')
  if (!resume?.education || resume.education.length === 0) suggestions.push('添加教育经历')
  if (!resume?.work || resume.work.length === 0) suggestions.push('添加工作经历')
  if (!resume?.skills || resume.skills.length === 0) suggestions.push('添加技能信息')
  
  return suggestions
}

// 获取岗位适配度依据
const getPositionFitBasis = (resume: any, position: string): string[] => {
  const basis: string[] = []
  
  if (position === '前端开发' || position === '全栈开发' || position === '移动端开发') {
    const skills = resume?.skills || []
    const frontendSkills = ['Vue', 'React', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Node.js', 'webpack', 'vite']
    const matchedSkills = skills.filter((skill: any) => 
      frontendSkills.some(fs => skill.name?.includes(fs))
    )
    
    if (matchedSkills.length >= 5) {
      basis.push('具备丰富的前端技术栈')
    } else if (matchedSkills.length >= 3) {
      basis.push('具备基本的前端技术栈')
    } else {
      basis.push('前端技术栈不够丰富')
    }
    
    if (resume?.project && resume.project.length > 0) {
      basis.push('有项目经验')
    } else {
      basis.push('缺少项目经验')
    }
  } else if (position === '后端开发' || position === '全栈开发') {
    const skills = resume?.skills || []
    const backendSkills = ['Java', 'Python', 'Go', 'Node.js', 'Spring', 'Django', 'MySQL', 'Redis']
    const matchedSkills = skills.filter((skill: any) => 
      backendSkills.some(bs => skill.name?.includes(bs))
    )
    
    if (matchedSkills.length >= 5) {
      basis.push('具备丰富的后端技术栈')
    } else if (matchedSkills.length >= 3) {
      basis.push('具备基本的后端技术栈')
    } else {
      basis.push('后端技术栈不够丰富')
    }
    
    if (resume?.project && resume.project.length > 0) {
      basis.push('有项目经验')
    } else {
      basis.push('缺少项目经验')
    }
  } else if (position === '产品经理') {
    const skills = resume?.skills || []
    const pmSkills = ['产品', '需求', '原型', '用户研究', '数据分析', '项目管理']
    const matchedSkills = skills.filter((skill: any) => 
      pmSkills.some(ps => skill.name?.includes(ps))
    )
    
    if (matchedSkills.length >= 3) {
      basis.push('具备产品经理相关技能')
    } else if (matchedSkills.length >= 1) {
      basis.push('具备基本的产品技能')
    } else {
      basis.push('产品技能不够丰富')
    }
    
    if (resume?.work && resume.work.length > 0) {
      basis.push('有工作经验')
    } else {
      basis.push('缺少工作经验')
    }
  } else if (position === 'UI/UX设计') {
    const skills = resume?.skills || []
    const designSkills = ['Figma', 'Sketch', 'Photoshop', '设计', 'UI', 'UX', '原型']
    const matchedSkills = skills.filter((skill: any) => 
      designSkills.some(ds => skill.name?.includes(ds))
    )
    
    if (matchedSkills.length >= 3) {
      basis.push('具备设计相关技能')
    } else if (matchedSkills.length >= 1) {
      basis.push('具备基本的设计技能')
    } else {
      basis.push('设计技能不够丰富')
    }
    
    if (resume?.project && resume.project.length > 0) {
      basis.push('有设计项目经验')
    } else {
      basis.push('缺少设计项目经验')
    }
  } else if (position === '数据分析师') {
    const skills = resume?.skills || []
    const dataSkills = ['SQL', 'Python', 'R', '数据分析', '数据挖掘', '机器学习', 'Excel', 'Tableau']
    const matchedSkills = skills.filter((skill: any) => 
      dataSkills.some(ds => skill.name?.includes(ds))
    )
    
    if (matchedSkills.length >= 4) {
      basis.push('具备数据分析相关技能')
    } else if (matchedSkills.length >= 2) {
      basis.push('具备基本的数据分析技能')
    } else {
      basis.push('数据分析技能不够丰富')
    }
    
    if (resume?.project && resume.project.length > 0) {
      basis.push('有数据分析项目经验')
    } else {
      basis.push('缺少数据分析项目经验')
    }
  } else {
    basis.push('该岗位的评估标准正在完善中')
  }
  
  return basis
}

// 获取岗位适配度建议
const getPositionFitSuggestions = (resume: any, position: string): string[] => {
  const suggestions: string[] = []
  
  if (position === '前端开发' || position === '全栈开发' || position === '移动端开发') {
    const skills = resume?.skills || []
    const frontendSkills = ['Vue', 'React', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Node.js', 'webpack', 'vite']
    const matchedSkills = skills.filter((skill: any) => 
      frontendSkills.some(fs => skill.name?.includes(fs))
    )
    
    if (matchedSkills.length < 5) {
      suggestions.push('添加更多前端相关技能，如Vue、React、TypeScript等')
      suggestions.push('突出前端框架使用经验')
      suggestions.push('添加性能优化、工程化相关经验')
    }
    
    if (!resume?.project || resume.project.length === 0) {
      suggestions.push('添加项目经验，突出前端技术应用')
    }
  } else if (position === '后端开发' || position === '全栈开发') {
    const skills = resume?.skills || []
    const backendSkills = ['Java', 'Python', 'Go', 'Node.js', 'Spring', 'Django', 'MySQL', 'Redis']
    const matchedSkills = skills.filter((skill: any) => 
      backendSkills.some(bs => skill.name?.includes(bs))
    )
    
    if (matchedSkills.length < 5) {
      suggestions.push('添加更多后端相关技能，如Java、Python、Go等')
      suggestions.push('突出后端框架和数据库使用经验')
      suggestions.push('添加系统设计和架构相关经验')
    }
    
    if (!resume?.project || resume.project.length === 0) {
      suggestions.push('添加项目经验，突出后端技术应用')
    }
  } else if (position === '产品经理') {
    const skills = resume?.skills || []
    const pmSkills = ['产品', '需求', '原型', '用户研究', '数据分析', '项目管理']
    const matchedSkills = skills.filter((skill: any) => 
      pmSkills.some(ps => skill.name?.includes(ps))
    )
    
    if (matchedSkills.length < 3) {
      suggestions.push('添加产品经理相关技能，如需求分析、原型设计等')
      suggestions.push('突出产品思维和用户视角')
      suggestions.push('添加项目管理经验')
    }
    
    if (!resume?.work || resume.work.length === 0) {
      suggestions.push('添加产品相关工作经验')
    }
  } else if (position === 'UI/UX设计') {
    const skills = resume?.skills || []
    const designSkills = ['Figma', 'Sketch', 'Photoshop', '设计', 'UI', 'UX', '原型']
    const matchedSkills = skills.filter((skill: any) => 
      designSkills.some(ds => skill.name?.includes(ds))
    )
    
    if (matchedSkills.length < 3) {
      suggestions.push('添加设计相关技能，如Figma、Sketch、Photoshop等')
      suggestions.push('突出设计工具使用经验')
      suggestions.push('添加设计项目经验')
    }
    
    if (!resume?.project || resume.project.length === 0) {
      suggestions.push('添加设计项目经验')
    }
  } else if (position === '数据分析师') {
    const skills = resume?.skills || []
    const dataSkills = ['SQL', 'Python', 'R', '数据分析', '数据挖掘', '机器学习', 'Excel', 'Tableau']
    const matchedSkills = skills.filter((skill: any) => 
      dataSkills.some(ds => skill.name?.includes(ds))
    )
    
    if (matchedSkills.length < 4) {
      suggestions.push('添加数据分析相关技能，如SQL、Python、R等')
      suggestions.push('突出数据可视化和数据建模经验')
      suggestions.push('添加数据分析项目经验')
    }
    
    if (!resume?.project || resume.project.length === 0) {
      suggestions.push('添加数据分析项目经验')
    }
  } else {
    suggestions.push('该岗位的优化建议正在完善中')
  }
  
  return suggestions
}

// 获取表达质量依据
const getExpressionQualityBasis = (resume: any): string[] => {
  const basis: string[] = []
  
  if (resume?.basic?.summary && resume.basic.summary.length >= 50) {
    basis.push('个人简介内容充实')
  } else {
    basis.push('个人简介内容过于简短')
  }
  
  const projects = resume?.project || []
  const hasDetailedProjects = projects.some((project: any) => 
    project.description && project.description.length >= 100
  )
  
  if (hasDetailedProjects) {
    basis.push('项目描述详细')
  } else {
    basis.push('项目描述不够详细')
  }
  
  return basis
}

// 获取表达质量建议
const getExpressionQualitySuggestions = (resume: any): string[] => {
  const suggestions: string[] = []
  
  if (!resume?.basic?.summary || resume.basic.summary.length < 50) {
    suggestions.push('丰富个人简介，突出个人优势和职业目标')
  }
  
  const projects = resume?.project || []
  projects.forEach((project: any, index: number) => {
    if (!project.description || project.description.length < 100) {
      suggestions.push(`完善第${index + 1}个项目的描述，包括技术栈、实现功能和个人贡献`)
    }
  })
  
  return suggestions
}

// 获取结构规范依据
const getStructureStandardBasis = (resume: any): string[] => {
  const basis: string[] = []
  
  const requiredModules = ['basic', 'education', 'work', 'skills']
  const missingModules = requiredModules.filter(module => 
    !resume?.[module] || (Array.isArray(resume[module]) && resume[module].length === 0)
  )
  
  if (missingModules.length === 0) {
    basis.push('简历结构完整')
  } else {
    missingModules.forEach(module => {
      const moduleNames: Record<string, string> = {
        basic: '个人信息',
        education: '教育经历',
        work: '工作经历',
        skills: '技能信息'
      }
      basis.push(`缺少${moduleNames[module] || module}模块`)
    })
  }
  
  return basis
}

// 获取结构规范建议
const getStructureStandardSuggestions = (resume: any): string[] => {
  const suggestions: string[] = []
  
  const requiredModules = ['basic', 'education', 'work', 'skills']
  const missingModules = requiredModules.filter(module => 
    !resume?.[module] || (Array.isArray(resume[module]) && resume[module].length === 0)
  )
  
  missingModules.forEach(module => {
    const moduleNames: Record<string, string> = {
      basic: '个人信息',
      education: '教育经历',
      work: '工作经历',
      skills: '技能信息'
    }
    suggestions.push(`添加${moduleNames[module] || module}模块`)
  })
  
  return suggestions
}

// 重置分析
const resetAnalysis = () => {
  analysisResult.value = null
  currentStep.value = 0
  analysisProgress.value = 0
}
</script>

<template>
  <el-card class="ai-analysis-card">
    <template #header>
      <div class="card-header">
        <span class="title">
          <el-icon class="icon"><Star /></el-icon>
          简历 AI 分析
        </span>
      </div>
    </template>
    
    <div class="analysis-content">
      <!-- 分析设置 -->
      <div class="analysis-settings" v-if="!analysisResult">
        <el-form label-width="100px">
          <el-form-item label="目标岗位">
            <el-select v-model="targetPosition" style="width: 200px">
              <el-option
                v-for="option in positionOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="AI配置">
            <el-checkbox v-model="useRealAI">使用真实AI (硅基流动)</el-checkbox>
          </el-form-item>
        </el-form>
        
        <div class="analysis-actions">
          <el-button 
            type="primary" 
            size="large"
            @click="analyzeResume"
            :loading="isAnalyzing"
            :disabled="!resumeStore.currentResume"
          >
            <el-icon><Star /></el-icon>
            开始 AI 分析
          </el-button>
          
          <el-button 
            v-if="useRealAI"
            type="success"
            size="large"
            @click="saveApiConfig"
          >
            <el-icon><Check /></el-icon>
            保存配置
          </el-button>
        </div>
      </div>
      
      <!-- 分析进度 -->
      <div class="analysis-progress" v-if="isAnalyzing">
        <h3>分析中，请稍候...</h3>
        <el-progress 
          :percentage="analysisProgress" 
          :format="() => `步骤 ${currentStep}/${totalSteps}`"
          :stroke-width="15"
          status="success"
        />
      </div>
      
      <!-- 分析结果 -->
      <div class="analysis-result" v-if="analysisResult">
        <!-- 导出按钮 -->
        <div class="export-actions">
          <el-button type="primary" @click="exportAnalysisResult">
            <el-icon><Download /></el-icon>
            导出 JSON
          </el-button>
          <el-button type="success" @click="exportToWord">
            <el-icon><Download /></el-icon>
            导出 Word
          </el-button>
        </div>
        
        <!-- 总分 -->
        <div class="total-score">
          <h3>综合评分</h3>
          <div class="score-display">
            <el-progress 
              :percentage="analysisResult.totalScore" 
              :format="() => `${analysisResult.totalScore}分`"
              :stroke-width="20"
              :color="analysisResult.totalScore >= 80 ? '#67C23A' : analysisResult.totalScore >= 60 ? '#E6A23C' : '#F56C6C'"
            />
          </div>
        </div>
        
        <el-divider />
        
        <!-- 维度评分 -->
        <div class="dimension-scores">
          <h3>维度分析</h3>
          
          <el-card 
            v-for="dimension in analysisDimensions" 
            :key="dimension.key"
            class="dimension-card"
          >
            <template #header>
              <div class="dimension-header">
                <span class="dimension-label">
                  <el-icon :size="20"><component :is="dimension.icon" /></el-icon>
                  {{ dimension.label }}
                </span>
                <span class="dimension-score">{{ analysisResult.dimensions[dimension.key].score }}分</span>
              </div>
            </template>
            
            <div class="dimension-content">
              <!-- 评分依据 -->
              <div class="basis-section">
                <h4>评分依据</h4>
                <ul class="basis-list">
                  <li v-for="(item, index) in analysisResult.dimensions[dimension.key].basis" :key="index">
                    {{ item }}
                  </li>
                </ul>
              </div>
              
              <!-- 优化建议 -->
              <div class="suggestions-section">
                <h4>优化建议</h4>
                <ul class="suggestions-list">
                  <li v-for="(item, index) in analysisResult.dimensions[dimension.key].suggestions" :key="index">
                    {{ item }}
                  </li>
                </ul>
              </div>
            </div>
          </el-card>
        </div>
        
        <el-divider />
        
        <!-- 简历亮点 -->
        <div class="highlights-section">
          <h3>简历亮点</h3>
          <el-card class="highlights-card">
            <ul class="highlights-list">
              <li v-for="(highlight, index) in analysisResult.highlights" :key="index">
                <el-icon class="highlight-icon"><Check /></el-icon>
                {{ highlight }}
              </li>
            </ul>
          </el-card>
        </div>
        
        <!-- 自我评价 -->
        <div class="self-evaluation-section">
          <h3>自动生成自我评价</h3>
          <el-card class="self-evaluation-card">
            <p class="self-evaluation-content">{{ analysisResult.selfEvaluation }}</p>
          </el-card>
        </div>
        
        <!-- 操作按钮 -->
        <div class="result-actions">
          <el-button type="primary" @click="analyzeResume" :loading="isAnalyzing">
            重新分析
          </el-button>
          <el-button @click="resetAnalysis">
            重置
          </el-button>
        </div>
        
        <!-- 免责声明 -->
        <div class="disclaimer">
          <el-icon class="disclaimer-icon"><Warning /></el-icon>
          <span>免责提示：本分析仅为优化参考，不代表真实HR评价</span>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div class="empty-state" v-if="!resumeStore.currentResume && !analysisResult">
        <el-empty description="请先创建或选择一份简历" :image-size="120" />
      </div>
      
      <!-- 历史记录 -->
      <div class="history-section" v-if="analysisHistory.length > 0">
        <div class="history-header">
          <h3>
            <el-icon><Clock /></el-icon>
            历史分析记录
          </h3>
          <el-button type="danger" size="small" @click="clearAllHistory">
            清空全部
          </el-button>
        </div>
        
        <div class="history-list">
          <div 
            v-for="item in analysisHistory" 
            :key="item.id"
            class="history-item"
          >
            <div class="history-info">
              <div class="history-position">{{ item.position }}</div>
              <div class="history-time">{{ new Date(item.timestamp).toLocaleString() }}</div>
              <div class="history-score">综合评分: {{ item.result.totalScore }}分</div>
            </div>
            <div class="history-actions">
              <el-button type="primary" size="small" @click="viewHistoryDetail(item)">
                查看
              </el-button>
              <el-button type="danger" size="small" @click="deleteHistoryItem(item.id)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<style scoped>
.ai-analysis-card {
  width: 100%;
  margin: 0 0 20px;
  transition: all 0.3s ease;
}

.ai-analysis-card:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.12) !important;
  transform: translateY(-2px) !important;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon {
  color: var(--theme-color);
}

.analysis-content {
  padding: 20px 0;
}

.analysis-settings {
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
}

.analysis-actions {
  margin-top: 30px;
  display: flex;
  gap: 10px;
  justify-content: center;
}

.analysis-progress {
  padding: 40px 20px;
  text-align: center;
}

.analysis-progress h3 {
  margin-bottom: 30px;
  color: var(--text-primary);
}

.total-score {
  margin-bottom: 30px;
}

.total-score h3 {
  margin-bottom: 20px;
  color: var(--text-primary);
}

.score-display {
  width: 200px;
  margin: 0 auto;
}

.export-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.dimension-scores {
  margin-top: 30px;
}

.dimension-scores h3 {
  margin-bottom: 20px;
  color: var(--text-primary);
}

.dimension-card {
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.dimension-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1) !important;
}

.dimension-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dimension-label {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.dimension-score {
  font-size: 16px;
  font-weight: 600;
  color: var(--theme-color);
}

.dimension-content {
  padding-top: 15px;
}

.basis-section,
.suggestions-section {
  margin-bottom: 20px;
}

.basis-section h4,
.suggestions-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.basis-list,
.suggestions-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.basis-list li,
.suggestions-list li {
  padding: 8px 0;
  color: var(--text-secondary);
  border-bottom: 1px solid #f0f0f0;
}

.basis-list li:last-child,
.suggestions-list li:last-child {
  border-bottom: none;
}

.result-actions {
  margin-top: 30px;
  display: flex;
  gap: 10px;
  justify-content: center;
}

.highlights-section,
.self-evaluation-section {
  margin-top: 30px;
}

.highlights-section h3,
.self-evaluation-section h3 {
  margin-bottom: 15px;
  color: var(--text-primary);
}

.highlights-card,
.self-evaluation-card {
  transition: all 0.3s ease;
}

.highlights-card:hover,
.self-evaluation-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1) !important;
}

.highlights-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.highlights-list li {
  padding: 10px 0;
  color: var(--text-secondary);
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.highlights-list li:last-child {
  border-bottom: none;
}

.highlight-icon {
  color: #67C23A;
  margin-top: 2px;
}

.self-evaluation-content {
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

.disclaimer {
  margin-top: 30px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: var(--text-secondary);
}

.disclaimer-icon {
  color: #E6A23C;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
}

.history-section {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 2px solid #e4e7ed;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.history-header h3 {
  margin: 0;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.history-item:hover {
  border-color: var(--theme-color);
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1);
}

.history-info {
  flex: 1;
}

.history-position {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.history-time {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.history-score {
  font-size: 14px;
  color: var(--theme-color);
  font-weight: 600;
}

.history-actions {
  display: flex;
  gap: 8px;
}

@media (max-width: 768px) {
  .ai-analysis-card {
    margin: 0 10px 20px;
  }
  
  .analysis-settings {
    padding: 15px;
  }
  
  .analysis-progress {
    padding: 30px 15px;
  }
  
  .score-display {
    width: 150px;
  }
  
  .dimension-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .export-actions {
    flex-direction: column;
  }
  
  .history-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .history-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>