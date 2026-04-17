﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿import * as pdfjsLib from 'pdfjs-dist'
import JSZip from 'jszip'
import { reconstructPdfPageText } from './pdfLineStructure.js'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href

export interface ResumeData {
  name: string
  phone: string
  email: string
  jobIntent: string
  education: Array<{
    school: string
    major: string
    time?: string
    gpa?: string
    courses?: string
  }>
  skills: string[]
  projects: Array<{
    name: string
    role: string
    time?: string
    desc?: string
    tech?: string
  }>
  workExperience: Array<{
    company: string
    role: string
    time?: string
    desc?: string
  }>
  campusExperience: Array<{
    org: string
    role: string
    time?: string
    desc?: string
  }>
  awards: Array<{
    name: string
    time?: string
    desc?: string
  }>
  selfIntro: string
}

export type ParseProgressCallback = (progress: number, message: string) => void

const emptyResumeData = (): ResumeData => ({
  name: '',
  phone: '',
  email: '',
  jobIntent: '',
  education: [],
  skills: [],
  projects: [],
  workExperience: [],
  campusExperience: [],
  awards: [],
  selfIntro: ''
})

export const parsePDF = async (
  file: File,
  onProgress?: ParseProgressCallback
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        onProgress?.(10, '读取 PDF 文件...')
        const arrayBuffer = e.target?.result as ArrayBuffer
        if (!arrayBuffer) {
          throw new Error('文件读取失败，无法获取文件内容')
        }

        onProgress?.(30, '解析 PDF 内容...')
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        const pageCount = Math.min(pdf.numPages, 50)
        let fullText = ''

        for (let i = 1; i <= pageCount; i++) {
          const page = await pdf.getPage(i)
          const textContent = await page.getTextContent()
          const pageText = reconstructPdfPageText(textContent.items as any[])
          fullText += `${pageText}\n`
          onProgress?.(30 + Math.round((i / pageCount) * 40), `解析第 ${i}/${pageCount} 页...`)
        }

        if (!fullText.trim()) {
          reject(new Error('无法从 PDF 中提取文本，可能是扫描件或图片 PDF'))
          return
        }

        onProgress?.(80, '文本提取完成')
        resolve(fullText.trim())
      } catch (error) {
        reject(new Error('PDF 解析失败: ' + (error as Error).message))
      }
    }

    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsArrayBuffer(file)
  })
}

const extractTextFromXML = (xml: string): string => {
  return xml
    .replace(/<[^>]+>/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

export const parseWord = async (
  file: File,
  onProgress?: ParseProgressCallback
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        onProgress?.(10, '读取 Word 文件...')
        const arrayBuffer = e.target?.result as ArrayBuffer
        if (!arrayBuffer) {
          throw new Error('文件读取失败，无法获取文件内容')
        }

        onProgress?.(40, '解析 Word 内容...')
        const zip = await JSZip.loadAsync(arrayBuffer)
        let text = ''

        if (zip.files['word/document.xml']) {
          const documentXml = await zip.files['word/document.xml'].async('text')
          text = extractTextFromXML(documentXml)
        }

        if (!text.trim()) {
          reject(new Error('无法从 Word 文档中提取文本'))
          return
        }

        onProgress?.(80, '文本提取完成')
        resolve(text.trim())
      } catch (error) {
        reject(new Error('Word 解析失败: ' + (error as Error).message))
      }
    }

    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsArrayBuffer(file)
  })
}

const cleanText = (text: string): string => {
  return text
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/Page\s*\d+/gi, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]*\n[ \t]*/g, '\n')
    .trim()
}

const extractPhone = (text: string) => text.match(/1[3-9]\d{9}/)?.[0] || ''
const extractEmail = (text: string) => text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/)?.[0] || ''

const extractName = (text: string) => {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean)
  for (const line of lines.slice(0, 8)) {
    if (/^[\u4e00-\u9fa5]{2,4}$/.test(line)) return line
  }
  return ''
}

const extractJobIntent = (text: string) => {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean)
  for (const line of lines.slice(0, 12)) {
    if (/(前端|后端|开发|工程师|产品|测试|运营|设计)/.test(line) && line.length <= 20) {
      return line
    }
  }
  return ''
}

const sectionAliases: Record<string, string[]> = {
  education: ['教育经历', '教育背景'],
  skills: ['专业技能', '技能特长', '技能'],
  projects: ['项目经历', '项目经验'],
  workExperience: ['工作经历', '实习经历'],
  campusExperience: ['在校经历', '校园经历'],
  awards: ['荣誉奖项', '奖项荣誉', '获奖经历'],
  selfIntro: ['自我评价', '个人评价', '自我介绍']
}

const splitSections = (text: string) => {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean)
  const sections: Record<string, string[]> = {
    basic: []
  }
  let current = 'basic'

  for (const line of lines) {
    const matched = Object.entries(sectionAliases).find(([, aliases]) => aliases.some(alias => line.includes(alias)))
    if (matched) {
      current = matched[0]
      if (!sections[current]) sections[current] = []
      continue
    }

    if (!sections[current]) sections[current] = []
    sections[current].push(line)
  }

  return sections
}

const extractEducation = (lines: string[] = []) => {
  if (!lines.length) return []

  const result: Array<{ school: string; major: string; time: string; gpa: string; courses: string }> = []
  
  const time = lines.find(l => /\d{4}[.\-/年]\d{1,2}/.test(l)) || ''
  const school = lines.find(l => /大学|学院|学校/.test(l)) || ''
  const major = lines.filter(l => !/\d{4}[.\-/年]\d{1,2}/.test(l) && !/大学|学院|学校/.test(l)).join(' ').trim()
  
  result.push({
    time,
    school,
    major,
    gpa: '',
    courses: ''
  })
  
  return result.filter(item => item.school || item.major || item.time)
}

const extractSkills = (lines: string[] = []) => {
  return lines
    .flatMap(line => line.split(/[,，、;；:：]/).map(item => item.trim()))
    .map(item => item.replace(/(前端开发|后端开发|全栈开发|工具|其他)\s*[：:]\s*/, '').trim())
    .filter(Boolean)
    .filter(item => item.length > 0 && item.length < 30)
    .filter((item, index, arr) => arr.indexOf(item) === index)
}

const extractProjects = (lines: string[] = []) => {
  if (!lines.length) return []

  const result: Array<{ name: string; role: string; time: string; desc: string; tech: string }> = []
  
  const time = lines.find(l => /\d{4}[.\-/年]\d{1,2}/.test(l)) || ''
  const name = lines[0] || ''
  const role = lines.length > 1 ? lines[1] : ''
  const desc = lines.slice(2).join(' ').trim()
  
  result.push({
    name,
    role,
    time,
    desc,
    tech: ''
  })
  
  return result.filter(item => item.name || item.desc)
}

const extractWork = (lines: string[] = []) => {
  return extractProjects(lines).map(item => ({
    company: item.name,
    role: item.role,
    time: item.time,
    desc: item.desc
  }))
}

const extractCampus = (lines: string[] = []) => {
  return extractProjects(lines).map(item => ({
    org: item.name,
    role: item.role,
    time: item.time,
    desc: item.desc
  }))
}

const extractAwards = (lines: string[] = []) => {
  return lines
    .map(line => line.replace(/^[•·\-]\s*/, '').trim())
    .filter(Boolean)
    .map(line => {
      const time = line.match(/\d{4}[.\-/年]\d{1,2}(?:\s*[—-]\s*\d{4}[.\-/年]\d{1,2})?/)?.[0] || ''
      const name = line.replace(time, '').trim()
      return { name, time, desc: '' }
    })
}

const extractSelfIntro = (lines: string[] = []) => lines.join('\n').trim()

export const parseResumeText = async (
  text: string,
  onProgress?: ParseProgressCallback
): Promise<ResumeData> => {
  console.log('=== TS解析开始 ===')
  console.log('输入文本:', text)
  
  const cleanedText = cleanText(text)
  console.log('清洗后文本:', cleanedText)
  onProgress?.(20, '清洗文本...')

  const sections = splitSections(cleanedText)
  console.log('分割后的sections:', sections)
  onProgress?.(40, '识别简历模块...')

  const education = extractEducation(sections.education)
  console.log('教育经历:', education)

  const skills = extractSkills(sections.skills)
  console.log('技能:', skills)

  const projects = extractProjects(sections.projects)
  const workExperience = extractWork(sections.workExperience)
  const campusExperience = extractCampus(sections.campusExperience)
  console.log('项目经验:', projects)
  console.log('在校经历:', campusExperience)

  const awards = extractAwards(sections.awards)
  const selfIntro = extractSelfIntro(sections.selfIntro)
  console.log('荣誉奖项:', awards)

  const result = {
    name: extractName(cleanedText),
    phone: extractPhone(cleanedText),
    email: extractEmail(cleanedText),
    jobIntent: extractJobIntent(cleanedText),
    education,
    skills,
    projects,
    workExperience,
    campusExperience,
    awards,
    selfIntro
  }

  console.log('=== TS解析完成 ===')
  console.log('最终结果:', result)

  onProgress?.(100, '解析完成')
  return result
}

const aiParseResume = async (text: string): Promise<any> => {
  const { aiParseResume: apiAiParseResume } = await import('../api/resume')
  const aiData = await apiAiParseResume(text)
  if (!aiData) {
    throw new Error('AI 解析响应格式错误')
  }
  return {
    name: aiData.name || '',
    phone: aiData.phone || '',
    email: aiData.email || '',
    jobIntent: aiData.jobIntent || '',
    education: aiData.education || [],
    skills: aiData.skills || [],
    projects: aiData.projects || [],
    workExperience: aiData.workExperience || [],
    campusExperience: aiData.campusExperience || [],
    awards: aiData.awards || [],
    selfIntro: aiData.selfIntro || ''
  }
}

export const parseResumeFile = async (
  file: File,
  onProgress?: ParseProgressCallback,
  useAi: boolean = false
): Promise<ResumeData> => {
  try {
    onProgress?.(0, '开始解析文件...')
    const fileName = file.name.toLowerCase()
    let text = ''

    if (fileName.endsWith('.pdf')) {
      text = await parsePDF(file, onProgress)
    } else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
      text = await parseWord(file, onProgress)
    } else if (fileName.endsWith('.txt')) {
      text = await file.text()
      onProgress?.(50, '读取文本文件...')
    } else {
      throw new Error('不支持的文件格式，请上传 PDF、Word 或 TXT 文件')
    }

    if (!text || text.trim().length < 10) {
      throw new Error('无法从文件中提取有效文本')
    }

    onProgress?.(80, '全文提取完成')

    if (useAi) {
      try {
        onProgress?.(85, '正在结构化解析...')
        const aiResult = await aiParseResume(text)
        onProgress?.(95, '结构化解析完成')
        return aiResult
      } catch (error) {
        console.error('AI 解析失败，降级为 TS 解析:', error)
      }
    }

    return await parseResumeText(text, onProgress)
  } catch (error) {
    console.error('解析文件失败:', error)
    onProgress?.(100, '解析失败')
    return emptyResumeData()
  }
}
