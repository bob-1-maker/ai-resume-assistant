/**
 * 文本预处理工具函数
 * 用于清洗 PDF/Word 解析出的文本，格式化后传给 AI 解析
 */

/**
 * 解析后的简历数据结构
 */
export interface ParsedResumeData {
  name: string | null
  phone: string | null
  email: string | null
  position: string | null
  location: string | null
  summary: string | null
  education: Array<{
    school: string
    major: string
    degree: string
    startDate: string
    endDate: string
    description?: string
  }>
  workExperience: Array<{
    company: string
    position: string
    startDate: string
    endDate: string
    description: string
  }>
  projectExperience: Array<{
    name: string
    role: string
    startDate: string
    endDate: string
    description: string
    technologies: string[]
  }>
  skills: string[]
  _parseWarning?: string
}

/**
 * 清洗无效字符
 * @param text 原始文本
 * @returns 清洗后的文本
 */
export const cleanInvalidChars = (text: string): string => {
  if (!text || typeof text !== 'string') return ''

  let cleaned = text

  // 移除常见的 PDF 解析乱码字符
  cleaned = cleaned.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')

  // 移除 Unicode 控制字符
  cleaned = cleaned.replace(/[\u200B-\u200D\uFEFF]/g, '')

  // 移除特殊符号但保留中文标点
  cleaned = cleaned.replace(/[^\u4e00-\u9fa5\u0020-\u007E\u3000-\u303F\uFF00-\uFFEF\n\r\t]/g, '')

  // 移除页码标记（如 "第 1 页" "Page 1" 等）
  cleaned = cleaned.replace(/第\s*\d+\s*页/gi, '')
  cleaned = cleaned.replace(/Page\s*\d+/gi, '')

  // 移除页眉页脚常见文字
  cleaned = cleaned.replace(/(简历|个人简历|RESUME|Curriculum Vitae)\s*$/gim, '')

  return cleaned.trim()
}

/**
 * 格式化文本
 * @param text 原始文本
 * @returns 格式化后的文本
 */
export const formatText = (text: string): string => {
  if (!text || typeof text !== 'string') return ''

  let formatted = text

  // 合并连续空格为单个空格
  formatted = formatted.replace(/[ \t]+/g, ' ')

  // 合并连续换行为最多两个换行（保留段落分隔）
  formatted = formatted.replace(/\n{3,}/g, '\n\n')

  // 移除行首行尾空格
  formatted = formatted.split('\n').map(line => line.trim()).join('\n')

  // 统一日期格式（将各种日期格式统一为 YYYY-MM-DD）
  formatted = normalizeDates(formatted)

  // 移除多余的空行
  formatted = formatted.replace(/\n\s*\n\s*\n/g, '\n\n')

  return formatted.trim()
}

/**
 * 统一日期格式
 * @param text 文本
 * @returns 格式化后的文本
 */
export const normalizeDates = (text: string): string => {
  if (!text || typeof text !== 'string') return ''

  let result = text

  // 2020年1月 -> 2020-01
  result = result.replace(/(\d{4})\s*年\s*(\d{1,2})\s*月/g, (_, year, month) => {
    return `${year}-${month.padStart(2, '0')}`
  })

  // 2020.01 -> 2020-01
  result = result.replace(/(\d{4})\.(\d{1,2})/g, (_, year, month) => {
    return `${year}-${month.padStart(2, '0')}`
  })

  // 2020/01 -> 2020-01
  result = result.replace(/(\d{4})\/(\d{1,2})/g, (_, year, month) => {
    return `${year}-${month.padStart(2, '0')}`
  })

  // 至今、现在、目前 -> 至今
  result = result.replace(/(至今|现在|目前|present|now)/gi, '至今')

  return result
}

/**
 * 提取可能的邮箱地址
 * @param text 文本
 * @returns 邮箱地址数组
 */
export const extractEmails = (text: string): string[] => {
  if (!text || typeof text !== 'string') return []
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
  const matches = text.match(emailRegex)
  return matches ? [...new Set(matches)] : []
}

/**
 * 提取可能的手机号
 * @param text 文本
 * @returns 手机号数组
 */
export const extractPhones = (text: string): string[] => {
  if (!text || typeof text !== 'string') return []
  const phoneRegex = /(?:手机|电话|联系方式|手机号|联系电话)?[：:\s]*(1[3-9]\d{9})/g
  const matches = []
  let match
  while ((match = phoneRegex.exec(text)) !== null) {
    if (match[1]) {
      matches.push(match[1])
    }
  }
  return [...new Set(matches)]
}

/**
 * 预处理简历文本
 * @param rawText 原始文本
 * @returns 预处理后的文本和提取的基础信息
 */
export const preprocessResumeText = (rawText: string): {
  cleanedText: string
  extractedInfo: {
    emails: string[]
    phones: string[]
  }
} => {
  if (!rawText || typeof rawText !== 'string') {
    return {
      cleanedText: '',
      extractedInfo: {
        emails: [],
        phones: []
      }
    }
  }

  // 第一步：清洗无效字符
  let cleaned = cleanInvalidChars(rawText)

  // 第二步：格式化文本
  cleaned = formatText(cleaned)

  // 提取基础信息
  const emails = extractEmails(cleaned)
  const phones = extractPhones(cleaned)

  return {
    cleanedText: cleaned,
    extractedInfo: {
      emails,
      phones
    }
  }
}

import * as pdfjsLib from 'pdfjs-dist'
import JSZip from 'jszip'

// 设置 PDF.js worker
// 使用本地 worker 文件
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href

/**
 * 解析 PDF 文件为文本
 * @param file PDF 文件
 * @returns 解析后的文本
 */
export const parsePDFToText = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer
        
        if (!arrayBuffer) {
          throw new Error('文件读取失败，无法获取文件内容')
        }
        
        // 使用 PDF.js 解析 PDF
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        
        // 限制最大页数为50页
        const MAX_PAGES = 50
        const pageCount = Math.min(pdf.numPages, MAX_PAGES)
        
        let fullText = ''
        
        // 遍历页面提取文本
        for (let i = 1; i <= pageCount; i++) {
          const page = await pdf.getPage(i)
          const textContent = await page.getTextContent()
          
          // 检查textContent.items是否存在
          if (!textContent || !textContent.items) {
            continue
          }
          
          // 合并所有文本项
          const pageText = textContent.items
            .map((item: any) => item.str || '')
            .join(' ')
          
          fullText += pageText + '\n'
        }
        
        if (!fullText || !fullText.trim()) {
          reject(new Error('无法从 PDF 中提取文本，可能是扫描件或图片 PDF'))
          return
        }
        
        resolve(fullText.trim())
      } catch (error) {
        reject(new Error('PDF 解析失败: ' + (error as Error).message))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }
    
    reader.readAsArrayBuffer(file)
  })
}

/**
 * 从XML文本中提取纯文本
 * @param xml XML文本
 * @returns 纯文本
 */
const extractTextFromXML = (xml: string): string => {
  // 移除XML标签
  let text = xml
    .replace(/<[^>]+>/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
  return text
}

/**
 * 解析 Word 文件为文本
 * @param file Word 文件
 * @returns 解析后的文本
 */
export const parseWordToText = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer
        
        if (!arrayBuffer) {
          throw new Error('文件读取失败，无法获取文件内容')
        }
        
        // 检查JSZip是否可用
        if (!JSZip) {
          throw new Error('JSZip库未加载')
        }
        
        // 使用JSZip解析Word文件（.docx是ZIP格式）
        const zip = await JSZip.loadAsync(arrayBuffer)
        
        // 尝试从主要的文档XML文件中提取文本
        let text = ''
        
        // 只处理主要的document.xml文件
        if (zip.files['word/document.xml']) {
          const documentXml = await zip.files['word/document.xml'].async('text')
          text = extractTextFromXML(documentXml)
        }
        
        if (!text || !text.trim()) {
          reject(new Error('无法从 Word 文档中提取文本'))
          return
        }
        
        resolve(text.trim())
      } catch (error) {
        reject(new Error('Word 解析失败: ' + (error as Error).message))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }
    
    reader.readAsArrayBuffer(file)
  })
}

/**
 * 解析文本文件
 * @param file 文本文件
 * @returns 解析后的文本
 */
export const parseTextFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const text = e.target?.result as string
      resolve(text || '')
    }
    
    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }
    
    reader.readAsText(file)
  })
}

/**
 * 根据文件类型解析文件
 * @param file 文件
 * @returns 解析后的文本
 */
export const parseFileToText = async (file: File): Promise<string> => {
  // 文件大小限制：10MB
  const MAX_FILE_SIZE = 10 * 1024 * 1024
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('文件大小超过限制（最大10MB），请上传较小的文件')
  }
  
  const fileName = file.name.toLowerCase()
  
  if (fileName.endsWith('.pdf')) {
    return parsePDFToText(file)
  } else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
    return parseWordToText(file)
  } else if (fileName.endsWith('.txt')) {
    return parseTextFile(file)
  } else {
    throw new Error('不支持的文件格式，请上传 PDF、Word 或 TXT 文件')
  }
}
