/**
 * 导出工具函数
 * 解决超大简历导出卡顿/崩溃、高频点击重复导出、无内容校验问题
 */

import { ElMessage, ElMessageBox } from 'element-plus'

/**
 * 校验简历内容
 * @param {Object} resumeData 简历数据
 * @returns {Promise<boolean>} 是否通过校验
 */
export const validateResumeContent = async (resumeData) => {
  // 计算简历纯文本长度
  const textLength = calculateTextLength(resumeData)
  
  // 当纯文本超过10000字时，提示用户
  if (textLength > 10000) {
    try {
      await ElMessageBox.confirm(
        `简历内容较长（${textLength}字），导出可能需要较长时间，是否继续？`,
        '提示',
        {
          confirmButtonText: '继续导出',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      return true
    } catch {
      return false
    }
  }
  
  return true
}

/**
 * 计算简历纯文本长度
 * @param {Object} resumeData 简历数据
 * @returns {number} 文本长度
 */
const calculateTextLength = (resumeData) => {
  let text = ''
  
  // 基本信息
  if (resumeData.basic) {
    text += resumeData.basic.name || ''
    text += resumeData.basic.summary || ''
    text += resumeData.basic.phone || ''
    text += resumeData.basic.email || ''
    text += resumeData.basic.location || ''
  }
  
  // 教育经历
  if (resumeData.education && resumeData.education.length) {
    resumeData.education.forEach(edu => {
      text += edu.school || ''
      text += edu.major || ''
      text += edu.degree || ''
      text += edu.description || ''
    })
  }
  
  // 工作经历
  if (resumeData.work && resumeData.work.length) {
    resumeData.work.forEach(work => {
      text += work.company || ''
      text += work.position || ''
      text += work.description || ''
    })
  }
  
  // 项目经历
  if (resumeData.project && resumeData.project.length) {
    resumeData.project.forEach(project => {
      text += project.name || ''
      text += project.description || ''
      text += project.technologies || ''
    })
  }
  
  // 技能
  if (resumeData.skills && resumeData.skills.length) {
    resumeData.skills.forEach(skill => {
      text += skill.name || ''
    })
  }
  
  // 荣誉奖项
  if (resumeData.awards && resumeData.awards.length) {
    resumeData.awards.forEach(award => {
      text += award.name || ''
      text += award.description || ''
    })
  }
  
  // 自我评价
  if (resumeData.selfEvaluation) {
    text += resumeData.selfEvaluation.content || ''
  }
  
  return text.length
}

/**
 * 导出防抖函数
 * @param {Function} exportFn 导出函数
 * @param {number} delay 延迟时间（毫秒），默认1000ms
 * @returns {Function} 防抖处理后的导出函数
 */
export const exportDebounce = (exportFn, delay = 1000) => {
  let lastExportTime = 0
  
  return async (...args) => {
    const now = Date.now()
    
    // 检查是否在防抖时间内
    if (now - lastExportTime < delay) {
      ElMessage.warning('导出操作过于频繁，请稍后再试')
      return
    }
    
    // 更新最后导出时间
    lastExportTime = now
    
    // 执行导出函数
    try {
      return await exportFn(...args)
    } catch (error) {
      console.error('导出失败:', error)
      ElMessage.error('导出失败，请重试')
      throw error
    }
  }
}
