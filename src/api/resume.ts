import { createApiClient, unwrapApiData } from "@/api/client";

const apiClient = createApiClient({
  auth: "user",
  timeout: 120000,
});

export interface ResumeRecord {
  id: number;
  resume_id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  education: string | null;
  projects: any[];
  skills: string[];
  created_at: string;
}

export interface PaginationResponse {
  list: ResumeRecord[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export const batchSaveResumes = async (resumes: any[]): Promise<any> => {
  const response = await apiClient.post("/resumes/batch-save", resumes);
  return unwrapApiData(response);
};

export const getResumes = async (
  page: number = 1,
  pageSize: number = 10,
): Promise<PaginationResponse> => {
  const response = await apiClient.get("/resumes", {
    params: { page, pageSize },
  });

  return unwrapApiData<PaginationResponse>(response);
};

export const getResumeById = async (
  resumeId: string,
): Promise<ResumeRecord> => {
  const response = await apiClient.get(`/resumes/${resumeId}`);
  return unwrapApiData<ResumeRecord>(response);
};

export const updateResume = async (
  resumeId: string,
  data: any,
): Promise<any> => {
  const response = await apiClient.put(`/resumes/${resumeId}`, data);
  return unwrapApiData(response);
};

export const deleteResume = async (resumeId: string): Promise<any> => {
  const response = await apiClient.delete(`/resumes/${resumeId}`);
  return unwrapApiData(response);
};

export const aiParseResume = async (text: string): Promise<any> => {
  const response = await apiClient.post("/ai/parse-resume", { text });
  return unwrapApiData(response);
};

export const aiGenerate = async (data: {
  basicInfo: any;
  jobDescription: string;
}): Promise<any> => {
  const response = await apiClient.post("/ai/generate", data);
  return unwrapApiData(response);
};

export const aiOptimize = async (data: {
  resumeData: any;
  section: string;
  content: string;
}): Promise<any> => {
  const response = await apiClient.post("/ai/optimize", data);
  return unwrapApiData(response);
};

export const aiAnalyze = async (data: {
  resume: any;
  position: string;
}): Promise<any> => {
  const response = await apiClient.post("/ai/analyze", data);
  return unwrapApiData(response);
};

export default {
  batchSaveResumes,
  getResumes,
  getResumeById,
  updateResume,
  deleteResume,
  aiParseResume,
};
