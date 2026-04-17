import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { ResumeInfo } from '@/types'
import type { ResumeRecord } from '@/api/resume'
import { useLocalStorage } from '@/composables/useLocalStorage'
import {
  autoSaveResumeList,
  deleteResumeRecordById,
  fetchResumeRecordPage,
  loadResumeRecordById,
  saveResumeToLocalFile,
  saveResumeToRemoteDatabase
} from '@/services/resumePersistence'

export const useResumeStore = defineStore('resume', () => {
  const [storedResumeList] = useLocalStorage<ResumeInfo[]>('resumeList', [])
  const [storedCurrentResumeId, setStoredCurrentResumeId] = useLocalStorage<string | null>('currentResumeId', null)
  const [storedActiveTemplate, setStoredActiveTemplate] = useLocalStorage<string>('activeTemplate', 'business')

  const resumeRecords = ref<ResumeRecord[]>([])
  const isLoadingRecords = ref(false)
  const pagination = ref({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  })

  const resumeList = computed(() => storedResumeList.value)
  const activeTemplate = computed(() => storedActiveTemplate.value)

  const currentResume = computed(() => {
    if (!storedCurrentResumeId.value) {
      return null
    }

    return resumeList.value.find((resume) => resume.id === storedCurrentResumeId.value) || null
  })

  const saveResume = async (resume: ResumeInfo) => {
    const existingIndex = storedResumeList.value.findIndex((item) => item.id === resume.id)
    const now = new Date().toISOString()

    if (existingIndex >= 0) {
      storedResumeList.value[existingIndex] = { ...resume, updatedAt: now }
    } else {
      storedResumeList.value.push({ ...resume, createdAt: now, updatedAt: now })
    }

    setStoredCurrentResumeId(resume.id)
    await saveResumeToLocalFile(resume)
  }

  const loadResume = (id: string) => {
    const resume = storedResumeList.value.find((item) => item.id === id)

    if (resume) {
      setStoredCurrentResumeId(id)
      return resume
    }

    return null
  }

  const deleteResume = (id: string) => {
    const index = storedResumeList.value.findIndex((item) => item.id === id)

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
      awards: [],
      selfEvaluation: {
        content: '',
        keywords: []
      },
      moduleOrder: ['basic', 'education', 'work', 'project', 'skills', 'awards', 'selfEvaluation'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    void saveResume(newResume)
    return newResume
  }

  const setActiveTemplate = (template: string) => {
    setStoredActiveTemplate(template)
  }

  const autoSave = async () => {
    if (storedResumeList.value.length > 0) {
      await autoSaveResumeList(storedResumeList.value)
    }
  }

  const saveToDatabase = async (resume: ResumeInfo) => {
    try {
      return await saveResumeToRemoteDatabase(resume)
    } catch {
      return false
    }
  }

  const loadFromDatabase = async (resumeId: string) => {
    try {
      isLoadingRecords.value = true
      return await loadResumeRecordById(resumeId)
    } catch {
      return null
    } finally {
      isLoadingRecords.value = false
    }
  }

  const fetchResumeRecords = async (page = 1, pageSize = 10) => {
    try {
      isLoadingRecords.value = true
      const response = await fetchResumeRecordPage(page, pageSize)
      resumeRecords.value = response.list
      pagination.value = response.pagination
    } finally {
      isLoadingRecords.value = false
    }
  }

  const deleteFromDatabase = async (resumeId: string) => {
    try {
      return await deleteResumeRecordById(resumeId)
    } catch {
      return false
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
    autoSave,
    resumeRecords,
    isLoadingRecords,
    pagination,
    saveToDatabase,
    loadFromDatabase,
    fetchResumeRecords,
    deleteFromDatabase
  }
})
