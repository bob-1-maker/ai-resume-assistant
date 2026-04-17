import type { ResumeInfo } from '@/types'
import * as resumeApi from '@/api/resume'
import { autoSaveAllResumes, saveResumeToFile } from '@/utils/file'

const toResumeRecord = (resume: ResumeInfo) => ({
  resume_id: resume.id,
  name: resume.basic.name,
  phone: resume.basic.phone,
  email: resume.basic.email,
  education: JSON.stringify(resume.education),
  projects: resume.project,
  skills: resume.skills
})

export const saveResumeToLocalFile = async (resume: ResumeInfo) => {
  try {
    await saveResumeToFile(resume)
    return true
  } catch {
    return false
  }
}

export const autoSaveResumeList = async (resumeList: ResumeInfo[]) => {
  try {
    await autoSaveAllResumes(resumeList)
    return true
  } catch {
    return false
  }
}

export const saveResumeToRemoteDatabase = async (resume: ResumeInfo) => {
  await resumeApi.batchSaveResumes([toResumeRecord(resume)])
  return true
}

export const loadResumeRecordById = async (resumeId: string) => {
  return resumeApi.getResumeById(resumeId)
}

export const fetchResumeRecordPage = async (page = 1, pageSize = 10) => {
  return resumeApi.getResumes(page, pageSize)
}

export const deleteResumeRecordById = async (resumeId: string) => {
  await resumeApi.deleteResume(resumeId)
  return true
}
