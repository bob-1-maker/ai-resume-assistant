import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ResumeInfo } from '@/types'
import { useLocalStorage } from '@/composables/useLocalStorage'
import { saveResumeToFile, autoSaveAllResumes } from '@/utils/file'

export const useResumeStore = defineStore('resume', () => {
  const [storedResumeList, setStoredResumeList] = useLocalStorage<ResumeInfo[]>('resumeList', [])
  const [storedCurrentResumeId, setStoredCurrentResumeId] = useLocalStorage<string | null>('currentResumeId', null)
  const [storedActiveTemplate, setStoredActiveTemplate] = useLocalStorage<string>('activeTemplate', 'default')

  const resumeList = computed(() => storedResumeList.value)
  const activeTemplate = computed(() => storedActiveTemplate.value)

  const currentResume = computed(() => {
    if (!storedCurrentResumeId.value) return null
    return resumeList.value.find(r => r.id === storedCurrentResumeId.value) || null
  })

  const saveResume = async (resume: ResumeInfo) => {
    const existingIndex = storedResumeList.value.findIndex(r => r.id === resume.id)
    const now = new Date().toISOString()

    if (existingIndex >= 0) {
      storedResumeList.value[existingIndex] = { ...resume, updatedAt: now }
    } else {
      storedResumeList.value.push({ ...resume, createdAt: now, updatedAt: now })
    }

    setStoredCurrentResumeId(resume.id)
    
    try {
      // 保存到本地文件
      await saveResumeToFile(resume)
    } catch (error) {
      // 在非 Tauri 环境中，忽略错误
      console.log('非 Tauri 环境，跳过文件保存');
    }
  }

  const loadResume = (id: string) => {
    const resume = storedResumeList.value.find(r => r.id === id)
    if (resume) {
      setStoredCurrentResumeId(id)
      return resume
    }
    return null
  }

  const deleteResume = (id: string) => {
    const index = storedResumeList.value.findIndex(r => r.id === id)
    if (index >= 0) {
      storedResumeList.value.splice(index, 1)
      if (storedCurrentResumeId.value === id) {
        setStoredCurrentResumeId(null)
      }
    }
  }

  const createNewResume = (name: string): ResumeInfo => {
    const newResume: ResumeInfo = {
      id: crypto.randomUUID(),
      name,
      basic: {
        name: '',
        gender: '',
        phone: '',
        email: '',
        position: '',
        expectedSalary: '',
        location: '',
        summary: ''
      },
      education: [],
      work: [],
      project: [],
      skills: [],
      moduleOrder: ['basic', 'education', 'work', 'project', 'skills'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    saveResume(newResume)
    return newResume
  }

  const setActiveTemplate = (template: string) => {
    setStoredActiveTemplate(template)
  }

  // 自动保存所有简历
  const autoSave = async () => {
    if (storedResumeList.value.length > 0) {
      try {
        await autoSaveAllResumes(storedResumeList.value)
      } catch (error) {
        // 在非 Tauri 环境中，忽略错误
        console.log('非 Tauri 环境，跳过自动保存');
      }
    }
  }

  return {
    currentResume,
    resumeList,
    activeTemplate,
    saveResume,
    loadResume,
    deleteResume,
    createNewResume,
    setActiveTemplate,
    autoSave
  }
})
