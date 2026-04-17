/**
 * 字段校验工具函数
 * 用于校验和修正 AI 解析出的简历字段
 */

/**
 * 校验结果接口
 */
export interface ValidationResult {
  isValid: boolean
  message?: string
  suggestion?: string
  correctedValue?: string
}

/**
 * 校验手机号
 * @param phone 手机号
 * @returns 校验结果
 */
export const validatePhone = (phone: string | null): ValidationResult => {
  if (!phone) {
    return { isValid: false, message: '手机号未识别', suggestion: '请手动填写手机号' }
  }
  
  // 移除所有非数字字符
  const cleanPhone = phone.replace(/[^\d]/g, '')
  
  // 检查是否为11位中国手机号
  if (/^1[3-9]\d{9}$/.test(cleanPhone)) {
    return { isValid: true, correctedValue: cleanPhone }
  }
  
  // 检查是否为其他格式的电话号码
  if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
    return {
      isValid: false,
      message: '手机号格式可能有误',
      suggestion: 'AI 识别可能有误，请核对手机号是否正确',
      correctedValue: cleanPhone
    }
  }
  
  // 手机号位数不对
  if (cleanPhone.length > 0 && cleanPhone.length !== 11) {
    return {
      isValid: false,
      message: `手机号位数不正确（${cleanPhone.length}位）`,
      suggestion: 'AI 识别可能有误，请核对手机号是否正确',
      correctedValue: cleanPhone
    }
  }
  
  return {
    isValid: false,
    message: '手机号格式不正确',
    suggestion: '请核对手机号是否正确'
  }
}

/**
 * 校验邮箱
 * @param email 邮箱
 * @returns 校验结果
 */
export const validateEmail = (email: string | null): ValidationResult => {
  if (!email) {
    return { isValid: false, message: '邮箱未识别', suggestion: '请手动填写邮箱' }
  }
  
  // 邮箱正则
  const emailRegex = /^[\w.-]+@[\w.-]+\.\w{2,}$/
  
  if (emailRegex.test(email)) {
    return { isValid: true, correctedValue: email.toLowerCase() }
  }
  
  // 尝试修正常见错误
  let corrected = email.toLowerCase().trim()
  
  // 修正常见的拼写错误
  corrected = corrected
    .replace(/，/g, '.')  // 中文逗号改点
    .replace(/\s+/g, '')  // 移除空格
    .replace(/@+/g, '@')  // 多个@改为一个
  
  if (emailRegex.test(corrected)) {
    return {
      isValid: true,
      message: '已自动修正邮箱格式',
      correctedValue: corrected
    }
  }
  
  return {
    isValid: false,
    message: '邮箱格式不正确',
    suggestion: '请核对邮箱是否正确'
  }
}

/**
 * 校验日期格式
 * @param date 日期字符串
 * @returns 校验结果
 */
export const validateDate = (date: string | null): ValidationResult => {
  if (!date) {
    return { isValid: false, message: '日期未识别' }
  }
  
  // 已经是标准格式 YYYY-MM 或 YYYY-MM-DD
  if (/^\d{4}-\d{2}(-\d{2})?$/.test(date)) {
    return { isValid: true, correctedValue: date }
  }
  
  // 尝试解析各种日期格式
  let corrected = date.trim()
  
  // 处理中文日期格式
  corrected = corrected
    .replace(/年/g, '-')
    .replace(/月/g, '')
    .replace(/日/g, '')
    .replace(/[.\/]/g, '-')
    .replace(/\s+/g, '')
  
  // 处理"至今"、"现在"等
  if (/至今|现在|present|now/i.test(corrected)) {
    return { isValid: true, correctedValue: '至今' }
  }
  
  // 提取年月
  const match = corrected.match(/(\d{4})-?(\d{1,2})?/)
  if (match) {
    const year = match[1]
    const month = match[2] ? match[2].padStart(2, '0') : '01'
    corrected = `${year}-${month}`
    return {
      isValid: true,
      message: '已自动格式化日期',
      correctedValue: corrected
    }
  }
  
  return {
    isValid: false,
    message: '日期格式不正确',
    suggestion: '请使用 YYYY-MM 格式'
  }
}

/**
 * 格式化日期范围
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @returns 格式化后的日期范围字符串
 */
export const formatDateRange = (startDate: string | null, endDate: string | null): string => {
  const start = validateDate(startDate).correctedValue || ''
  const end = validateDate(endDate).correctedValue || ''
  
  if (start && end) {
    return `${start} - ${end}`
  }
  if (start) {
    return `${start} - 至今`
  }
  return ''
}

/**
 * 智能修正简历数据
 * @param data AI 解析的简历数据
 * @returns 修正后的简历数据和校验结果
 */
export const validateAndCorrectResume = (data: any): {
  correctedData: any
  validationResults: Record<string, ValidationResult>
  warnings: string[]
} => {
  // 检查data是否为null或undefined
  if (!data) {
    return {
      correctedData: {},
      validationResults: {},
      warnings: ['解析数据为空']
    }
  }
  
  const correctedData = { ...data }
  const validationResults: Record<string, ValidationResult> = {}
  const warnings: string[] = []
  
  // 校验手机号
  const phoneResult = validatePhone(data.phone)
  validationResults.phone = phoneResult
  if (phoneResult.correctedValue) {
    correctedData.phone = phoneResult.correctedValue
  }
  if (!phoneResult.isValid && phoneResult.suggestion) {
    warnings.push(`手机号：${phoneResult.suggestion}`)
  }
  
  // 校验邮箱
  const emailResult = validateEmail(data.email)
  validationResults.email = emailResult
  if (emailResult.correctedValue) {
    correctedData.email = emailResult.correctedValue
  }
  if (!emailResult.isValid && emailResult.suggestion) {
    warnings.push(`邮箱：${emailResult.suggestion}`)
  }
  
  // 校验教育经历日期
  if (correctedData.education && Array.isArray(correctedData.education) && correctedData.education.length > 0) {
    correctedData.education = correctedData.education.map((edu: any, index: number) => {
      if (!edu) return {}
      const startResult = validateDate(edu.startDate)
      const endResult = validateDate(edu.endDate)
      
      if (!startResult.isValid || !endResult.isValid) {
        warnings.push(`教育经历 ${index + 1}：日期格式已自动修正`)
      }
      
      return {
        ...edu,
        startDate: startResult.correctedValue || edu.startDate,
        endDate: endResult.correctedValue || edu.endDate
      }
    })
  }
  
  // 校验工作经历日期
  if (correctedData.workExperience && Array.isArray(correctedData.workExperience) && correctedData.workExperience.length > 0) {
    correctedData.workExperience = correctedData.workExperience.map((work: any, index: number) => {
      if (!work) return {}
      const startResult = validateDate(work.startDate)
      const endResult = validateDate(work.endDate)
      
      if (!startResult.isValid || !endResult.isValid) {
        warnings.push(`工作经历 ${index + 1}：日期格式已自动修正`)
      }
      
      return {
        ...work,
        startDate: startResult.correctedValue || work.startDate,
        endDate: endResult.correctedValue || work.endDate
      }
    })
  }
  
  // 校验项目经历日期
  if (correctedData.projectExperience && Array.isArray(correctedData.projectExperience) && correctedData.projectExperience.length > 0) {
    correctedData.projectExperience = correctedData.projectExperience.map((project: any, index: number) => {
      if (!project) return {}
      const startResult = validateDate(project.startDate)
      const endResult = validateDate(project.endDate)
      
      if (!startResult.isValid || !endResult.isValid) {
        warnings.push(`项目经历 ${index + 1}：日期格式已自动修正`)
      }
      
      return {
        ...project,
        startDate: startResult.correctedValue || project.startDate,
        endDate: endResult.correctedValue || project.endDate
      }
    })
  }
  
  // 技能去重
  if (correctedData.skills && Array.isArray(correctedData.skills)) {
    const uniqueSkills = [...new Set(correctedData.skills.map((s: string) => s.trim()).filter((s: string) => s))]
    if (uniqueSkills.length !== correctedData.skills.length) {
      warnings.push('技能列表已去重')
    }
    correctedData.skills = uniqueSkills
  }
  
  return {
    correctedData,
    validationResults,
    warnings
  }
}

/**
 * 获取字段状态样式类
 * @param result 校验结果
 * @returns 样式类名
 */
export const getFieldStatusClass = (result: ValidationResult | undefined): string => {
  if (!result) return ''
  if (result.isValid) return 'field-valid'
  if (result.correctedValue) return 'field-corrected'
  return 'field-invalid'
}

/**
 * 获取字段提示信息
 * @param result 校验结果
 * @returns 提示信息
 */
export const getFieldTip = (result: ValidationResult | undefined): string => {
  if (!result) return ''
  if (result.isValid && result.message) return result.message
  if (!result.isValid) return result.suggestion || result.message || ''
  return ''
}
