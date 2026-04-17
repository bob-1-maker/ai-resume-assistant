import { ElMessage } from 'element-plus';
import type { ResumeInfo } from '@/types';

const DOCUMENTS_DIR = 'resume-data';

// 检查是否在 Tauri 环境中
const isTauri = typeof window !== 'undefined' && window.__TAURI__;

// 条件导入 Tauri API
let fs: any = null;
let path: any = null;

if (isTauri) {
  // 动态导入 Tauri API
  import('@tauri-apps/api').then(api => {
    fs = api.fs;
    path = api.path;
  });
}

// 获取文档目录路径
export const getDocumentsDir = async (): Promise<string> => {
  if (!isTauri || !fs || !path) {
    throw new Error('不在 Tauri 环境中');
  }
  
  const homeDir = await path.documentDir();
  if (!homeDir) {
    throw new Error('无法获取文档目录');
  }
  const resumeDir = await path.join(homeDir, DOCUMENTS_DIR);
  
  // 确保目录存在
  try {
    await fs.exists(resumeDir);
  } catch {
    await fs.createDir(resumeDir, { recursive: true });
  }
  
  return resumeDir;
};

// 保存简历到文件
export const saveResumeToFile = async (resume: ResumeInfo): Promise<void> => {
  if (!isTauri || !fs || !path) {
    // 在非 Tauri 环境中，只在控制台提示
    console.log('保存简历到文件:', resume.id);
    return;
  }
  
  try {
    const documentsDir = await getDocumentsDir();
    const filePath = await path.join(documentsDir, `${resume.id}.json`);
    
    await fs.writeFile({
      path: filePath,
      contents: JSON.stringify(resume, null, 2)
    });
    
    ElMessage.success('简历保存成功！');
  } catch (error) {
    console.error('保存简历失败:', error);
    ElMessage.error('保存简历失败，请重试');
  }
};

// 从文件加载简历
export const loadResumeFromFile = async (filePath: string): Promise<ResumeInfo | null> => {
  if (!isTauri || !fs || !path) {
    return null;
  }
  
  try {
    const contents = await fs.readFile({
      path: filePath,
      options: {
        encoding: 'utf8'
      }
    });
    
    return JSON.parse(contents) as ResumeInfo;
  } catch (error) {
    console.error('加载简历失败:', error);
    ElMessage.error('加载简历失败，请检查文件格式');
    return null;
  }
};

// 列出所有简历文件
export const listResumeFiles = async (): Promise<Array<{ name: string; path: string }>> => {
  if (!isTauri || !fs || !path) {
    return [];
  }
  
  try {
    const documentsDir = await getDocumentsDir();
    const files = await fs.readDir(documentsDir);
    
    return files
      .filter(file => file.name.endsWith('.json'))
      .map(file => ({
        name: file.name.replace('.json', ''),
        path: path.join(documentsDir, file.name)
      }));
  } catch (error) {
    console.error('列出简历文件失败:', error);
    return [];
  }
};

// 删除简历文件
export const deleteResumeFile = async (resumeId: string): Promise<void> => {
  if (!isTauri || !fs || !path) {
    return;
  }
  
  try {
    const documentsDir = await getDocumentsDir();
    const filePath = await path.join(documentsDir, `${resumeId}.json`);
    
    await fs.removeFile(filePath);
    ElMessage.success('简历文件删除成功！');
  } catch (error) {
    console.error('删除简历文件失败:', error);
    ElMessage.error('删除简历文件失败，请重试');
  }
};

// 自动保存所有简历
export const autoSaveAllResumes = async (resumes: ResumeInfo[]): Promise<void> => {
  if (!isTauri || !fs || !path) {
    return;
  }
  
  try {
    for (const resume of resumes) {
      await saveResumeToFile(resume);
    }
  } catch (error) {
    console.error('自动保存失败:', error);
  }
};