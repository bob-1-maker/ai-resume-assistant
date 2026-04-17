export interface BasicInfo {
  name: string
  gender: 'male' | 'female' | ''
  phone: string
  email: string
  position: string
  expectedSalary: string
  location: string
  summary: string
  avatar?: string
}

export interface Education {
  id: string
  school: string
  major: string
  degree: string
  startDate: string
  endDate: string
  description?: string
}

export interface Work {
  id: string
  company: string
  position: string
  startDate: string
  endDate: string
  description: string
}

export interface Project {
  id: string
  name: string
  role: string
  startDate: string
  endDate: string
  description: string
  technologies: string[]
}

export interface Skill {
  id: string
  name: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  category: string
}

export interface Award {
  id: string
  name: string
  description: string
  time: string
}

export interface SelfEvaluation {
  content: string
  keywords: string[]
}

export interface ResumeInfo {
  id: string
  name: string
  basic: BasicInfo
  education: Education[]
  work: Work[]
  project: Project[]
  skills: Skill[]
  awards: Award[]
  selfEvaluation: SelfEvaluation
  moduleOrder: string[]
  createdAt: string
  updatedAt: string
}
