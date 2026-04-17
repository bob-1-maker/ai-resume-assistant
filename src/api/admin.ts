import { createApiClient, unwrapApiResponse } from '@/api/client'

const apiClient = createApiClient({ auth: 'admin', timeout: 30000 })

export interface AdminUser {
  username: string;
  isAdmin: boolean;
}

export interface AdminResumeRecord {
  id?: number;
  resume_id: string;
  user_id: number;
  name: string | null;
  phone: string | null;
  email: string | null;
  education: string | null;
  projects: Array<Record<string, unknown>>;
  skills: string[];
  created_at: string | null;
}

export interface AdminPaginationResponse {
  list: AdminResumeRecord[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export const adminLogin = async (username: string, password: string) => {
  const response = await apiClient.post('/admin/login', { username, password })
  return unwrapApiResponse(response)
}

export const getAdminResumes = async (page = 1, pageSize = 10): Promise<{
  code: number;
  msg: string;
  data: AdminPaginationResponse;
}> => {
  const response = await apiClient.get('/admin/resumes', {
    params: { page, pageSize }
  })

  return unwrapApiResponse(response)
}

export const deleteAdminResume = async (resumeId: string) => {
  const response = await apiClient.delete(`/admin/resumes/${resumeId}`)
  return unwrapApiResponse(response)
}
