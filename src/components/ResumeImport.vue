<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled, Loading, QuestionFilled } from '@element-plus/icons-vue'
import { useResumeStore, useUserStore } from '@/store'
import { parseResumeFile, type ParseProgressCallback } from '@/utils/resumeParser'
import { debounce } from '@/utils/debounce'

const resumeStore = useResumeStore()
const userStore = useUserStore()

const isUploading = ref(false)
const isParsing = ref(false)
const isSavingToDb = ref(false)
const parseProgress = ref(0)
const parseMessage = ref('')
const parseResult = ref<any | null>(null)
const showResult = ref(false)
const unrecognizedFields = ref<string[]>([])
const useAiParsing = ref(false)

const acceptTypes = '.pdf,.doc,.docx,.txt'
const maxSize = 10 * 1024 * 1024

const onParseProgress: ParseProgressCallback = (progress, message) => {
  parseProgress.value = progress
  parseMessage.value = message
}

const checkUnrecognizedFields = (_data: any) => {
  unrecognizedFields.value = []
}

const handleFileUpload = debounce(async (uploadFile: any) => {
  if (isParsing.value || isUploading.value) {
    ElMessage.warning('正在处理文件，请稍候...')
    return
  }

  const file = uploadFile?.raw || uploadFile
  if (!file) {
    ElMessage.error('文件对象无效')
    return
  }

  if (file.size > maxSize) {
    ElMessage.error('文件大小不能超过 10MB')
    return
  }

  isUploading.value = true
  isParsing.value = true
  parseProgress.value = 0
  parseMessage.value = '正在提取全文...'
  showResult.value = false
  parseResult.value = null
  unrecognizedFields.value = []

  try {
    const result = await parseResumeFile(file, onParseProgress, useAiParsing.value)
    checkUnrecognizedFields(result)
    parseResult.value = result
    showResult.value = true
    ElMessage.success(useAiParsing.value ? 'AI 智能解析成功！' : '简历解析成功！')
  } catch (error: any) {
    console.error('文件解析失败:', error)
    ElMessage.error(error?.message || '文件解析失败，请重试')
    parseResult.value = null
    showResult.value = false
  } finally {
    setTimeout(() => {
      isUploading.value = false
      isParsing.value = false
    }, 300)
  }
}, 300)

const splitTime = (time?: string) => {
  if (!time) return ['', '']
  const normalized = String(time).replace(/[–—]/g, '-')
  const parts = normalized.split('-').map(item => item.trim()).filter(Boolean)
  if (parts.length >= 2) return [parts[0], parts.slice(1).join('-')]
  return [normalized.trim(), '']
}

const mapEducation = (list: any[] = []) =>
  list.map((edu, index) => {
    const [startDate, endDate] = splitTime(edu.time)
    return {
      id: `edu-${Date.now()}-${index}`,
      school: edu.school || '',
      major: edu.major || '',
      degree: edu.degree || '',
      startDate,
      endDate,
      description: edu.courses || edu.description || ''
    }
  })

const mapWork = (list: any[] = []) =>
  list.map((work, index) => {
    const [startDate, endDate] = splitTime(work.time)
    return {
      id: `work-${Date.now()}-${index}`,
      company: work.company || '',
      position: work.role || work.position || '',
      startDate,
      endDate,
      description: work.desc || work.description || ''
    }
  })

const mapProjects = (list: any[] = []) =>
  list.map((project, index) => {
    const [startDate, endDate] = splitTime(project.time)
    return {
      id: `project-${Date.now()}-${index}`,
      name: project.name || '',
      role: project.role || '',
      startDate,
      endDate,
      description: project.desc || project.description || '',
      technologies: project.tech
        ? String(project.tech).split(',').map((item: string) => item.trim()).filter(Boolean)
        : Array.isArray(project.technologies)
          ? project.technologies
          : []
    }
  })

const mapCampus = (list: any[] = []) =>
  list.map((campus, index) => {
    const [startDate, endDate] = splitTime(campus.time)
    return {
      id: `campus-${Date.now()}-${index}`,
      organization: campus.org || campus.organization || '',
      position: campus.role || campus.position || '',
      startDate,
      endDate,
      description: campus.desc || campus.description || ''
    }
  })

const mapAwards = (list: any[] = []) =>
  list.map((award, index) => ({
    id: `award-${Date.now()}-${index}`,
    name: award.name || '',
    date: award.time || award.date || '',
    description: award.desc || award.description || ''
  }))

const mapSkills = (list: string[] = []) =>
  list.map((skill, index) => ({
    id: `skill-${Date.now()}-${index}`,
    name: skill,
    level: 'intermediate' as const,
    category: '专业技能'
  }))

const applyToResume = async () => {
  if (!parseResult.value) return

  try {
    await ElMessageBox.confirm(
      '确定要将解析结果应用到当前简历吗？这将覆盖部分已有内容。',
      '确认应用',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const currentResume = resumeStore.currentResume
    if (!currentResume) {
      ElMessage.error('请先创建或选择一份简历')
      return
    }

    const updatedResume = JSON.parse(JSON.stringify(currentResume))

    updatedResume.basic.name = parseResult.value.name || updatedResume.basic.name
    updatedResume.basic.phone = parseResult.value.phone || updatedResume.basic.phone
    updatedResume.basic.email = parseResult.value.email || updatedResume.basic.email
    updatedResume.basic.position = parseResult.value.jobIntent || updatedResume.basic.position
    updatedResume.basic.summary = parseResult.value.selfIntro || updatedResume.basic.summary

    if (Array.isArray(parseResult.value.education) && parseResult.value.education.length) {
      updatedResume.education = mapEducation(parseResult.value.education)
    }

    if (Array.isArray(parseResult.value.workExperience) && parseResult.value.workExperience.length) {
      updatedResume.work = mapWork(parseResult.value.workExperience)
    }

    if (Array.isArray(parseResult.value.projects) && parseResult.value.projects.length) {
      updatedResume.project = mapProjects(parseResult.value.projects)
    }

    if (Array.isArray(parseResult.value.skills) && parseResult.value.skills.length) {
      updatedResume.skills = mapSkills(parseResult.value.skills)
    }

    if (Array.isArray(parseResult.value.campusExperience) && parseResult.value.campusExperience.length) {
      updatedResume.campus = mapCampus(parseResult.value.campusExperience)
    }

    if (Array.isArray(parseResult.value.awards) && parseResult.value.awards.length) {
      updatedResume.honors = mapAwards(parseResult.value.awards)
    }

    await resumeStore.saveResume(updatedResume)
    ElMessage.success('已成功应用到简历！')
    closeResult()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('应用失败:', error)
      ElMessage.error('应用失败，请重试')
    }
  }
}

const closeResult = () => {
  showResult.value = false
  setTimeout(() => {
    parseResult.value = null
    unrecognizedFields.value = []
  }, 300)
}

const saveToDatabase = async () => {
  if (!parseResult.value) return

  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录后再保存到云端')
    return
  }

  try {
    isSavingToDb.value = true
    const newResume = resumeStore.createNewResume(parseResult.value.name || '新简历')
    const updatedResume = {
      ...newResume,
      basic: {
        ...newResume.basic,
        name: parseResult.value.name || '',
        phone: parseResult.value.phone || '',
        email: parseResult.value.email || '',
        position: parseResult.value.jobIntent || '',
        summary: parseResult.value.selfIntro || ''
      },
      education: mapEducation(parseResult.value.education || []),
      work: mapWork(parseResult.value.workExperience || []),
      project: mapProjects(parseResult.value.projects || []),
      campus: mapCampus(parseResult.value.campusExperience || []),
      honors: mapAwards(parseResult.value.awards || []),
      skills: mapSkills(parseResult.value.skills || [])
    }

    await resumeStore.saveResume(updatedResume)
    const success = await resumeStore.saveToDatabase(updatedResume)

    if (success) {
      ElMessage.success('简历已成功保存到云端！')
      closeResult()
    } else {
      ElMessage.error('保存到云端失败，请检查网络连接')
    }
  } catch (error) {
    console.error('保存到数据库失败:', error)
    ElMessage.error('保存失败，请重试')
  } finally {
    isSavingToDb.value = false
  }
}
</script>

<template>
  <el-card class="resume-import">
    <template #header>
      <div class="card-header">
        <span class="title">导入简历文件</span>
        <el-tooltip content="支持 PDF、Word、TXT 格式，自动解析并结构化">
          <el-icon class="help-icon"><QuestionFilled /></el-icon>
        </el-tooltip>
      </div>
    </template>

    <div class="upload-container">
      <div class="ai-option" v-if="!isParsing">
        <el-checkbox v-model="useAiParsing" size="large">
          <span class="ai-option-text">使用 AI 智能解析（更精准）</span>
        </el-checkbox>
      </div>

      <el-upload
        class="upload-area"
        drag
        :accept="acceptTypes"
        :show-file-list="false"
        :before-upload="() => false"
        :on-change="handleFileUpload"
        :disabled="isParsing"
      >
        <div v-if="!isParsing" class="upload-content">
          <el-icon class="upload-icon"><UploadFilled /></el-icon>
          <div class="upload-text">
            <p class="main-text">{{ useAiParsing ? 'AI 智能解析' : '上传并解析文件' }}</p>
            <p class="sub-text">支持 PDF、Word、TXT 格式，最大 10MB</p>
            <el-button type="primary" class="upload-button">选择文件</el-button>
          </div>
        </div>

        <div v-else class="parsing-content">
          <el-icon class="loading-icon"><Loading /></el-icon>
          <div class="parsing-text">
            <p class="main-text">{{ parseMessage }}</p>
            <el-progress :percentage="parseProgress" :stroke-width="10" />
          </div>
        </div>
      </el-upload>
    </div>

    <el-dialog
      v-model="showResult"
      title="解析结果预览"
      width="700px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div v-if="parseResult" class="parse-result">
        <el-alert
          v-if="unrecognizedFields.length > 0"
          type="warning"
          :closable="false"
          show-icon
          class="warning-alert"
        >
          <template #title>
            以下字段未能识别，请手动补充：
            <span class="unrecognized">{{ unrecognizedFields.join('、') }}</span>
          </template>
        </el-alert>

        <el-descriptions :column="2" border class="result-descriptions">
          <el-descriptions-item v-if="parseResult.name" label="姓名">
            <span>{{ parseResult.name }}</span>
          </el-descriptions-item>
          <el-descriptions-item v-if="parseResult.phone" label="手机号">
            <span>{{ parseResult.phone }}</span>
          </el-descriptions-item>
          <el-descriptions-item v-if="parseResult.email" label="邮箱">
            <span>{{ parseResult.email }}</span>
          </el-descriptions-item>
          <el-descriptions-item v-if="parseResult.jobIntent" label="求职意向">
            <span>{{ parseResult.jobIntent }}</span>
          </el-descriptions-item>
          <el-descriptions-item v-if="parseResult.selfIntro" label="个人简介" :span="2">
            <span>{{ parseResult.selfIntro }}</span>
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="parseResult.education?.length" class="section">
          <h4 class="section-title">教育经历</h4>
          <el-timeline>
            <el-timeline-item
              v-for="(edu, index) in parseResult.education"
              :key="index"
              :timestamp="edu.time || ''"
              placement="top"
            >
              <el-card>
                <p><strong>{{ edu.school }}</strong></p>
                <p>{{ edu.major }}</p>
                <p v-if="edu.gpa" class="description">绩点/排名：{{ edu.gpa }}</p>
                <p v-if="edu.courses" class="description">核心课程：{{ edu.courses }}</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>

        <div v-if="parseResult.skills?.length" class="section">
          <h4 class="section-title">专业技能</h4>
          <div class="skills-container">
            <el-tag v-for="skill in parseResult.skills" :key="skill" class="skill-tag">
              {{ skill }}
            </el-tag>
          </div>
        </div>

        <div v-if="parseResult.projects?.length" class="section">
          <h4 class="section-title">项目经验</h4>
          <el-timeline>
            <el-timeline-item
              v-for="(project, index) in parseResult.projects"
              :key="index"
              :timestamp="project.time || ''"
              placement="top"
            >
              <el-card>
                <p><strong>{{ project.name }}</strong></p>
                <p>{{ project.role }}</p>
                <p v-if="project.desc" class="description">{{ project.desc }}</p>
                <p v-if="project.tech">
                  <el-tag
                    v-for="tech in project.tech.split(',').map((item: string) => item.trim()).filter(Boolean)"
                    :key="tech"
                    size="small"
                    class="tech-tag"
                  >
                    {{ tech }}
                  </el-tag>
                </p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>

        <div v-if="parseResult.workExperience?.length" class="section">
          <h4 class="section-title">工作经历</h4>
          <el-timeline>
            <el-timeline-item
              v-for="(work, index) in parseResult.workExperience"
              :key="index"
              :timestamp="work.time || ''"
              placement="top"
            >
              <el-card>
                <p><strong>{{ work.company }}</strong></p>
                <p>{{ work.role }}</p>
                <p v-if="work.desc" class="description">{{ work.desc }}</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>

        <div v-if="parseResult.campusExperience?.length" class="section">
          <h4 class="section-title">在校经历</h4>
          <el-timeline>
            <el-timeline-item
              v-for="(campus, index) in parseResult.campusExperience"
              :key="index"
              :timestamp="campus.time || ''"
              placement="top"
            >
              <el-card>
                <p><strong>{{ campus.org }}</strong></p>
                <p>{{ campus.role }}</p>
                <p v-if="campus.desc" class="description">{{ campus.desc }}</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>

        <div v-if="parseResult.awards?.length" class="section">
          <h4 class="section-title">荣誉奖项</h4>
          <el-timeline>
            <el-timeline-item
              v-for="(award, index) in parseResult.awards"
              :key="index"
              :timestamp="award.time || ''"
              placement="top"
            >
              <el-card>
                <p><strong>{{ award.name }}</strong></p>
                <p v-if="award.desc" class="description">{{ award.desc }}</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeResult">取消</el-button>
          <el-button type="primary" @click="applyToResume">应用到简历</el-button>
          <el-button
            v-if="userStore.isLoggedIn"
            type="success"
            :loading="isSavingToDb"
            @click="saveToDatabase"
          >
            {{ isSavingToDb ? '保存中...' : '保存到云端' }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <el-alert
      title="使用说明"
      type="info"
      :closable="false"
      show-icon
      class="usage-tips"
    >
      <template #default>
        <ul>
          <li>上传简历文件后，系统会自动解析并结构化内容。</li>
          <li>支持 PDF、Word、TXT 格式，建议上传内容清晰的文件。</li>
          <li>解析结果会先进入预览弹窗，确认后再应用到当前简历。</li>
          <li>登录后可将解析后的简历直接保存到云端。</li>
        </ul>
      </template>
    </el-alert>
  </el-card>
</template>

<style scoped>
.resume-import {
  margin-bottom: 20px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.help-icon {
  color: #909399;
  cursor: help;
}

.upload-container {
  width: 100%;
}

.ai-option {
  margin-bottom: 20px;
  text-align: center;
}

.ai-option-text {
  font-size: 14px;
  color: #606266;
  margin-left: 8px;
}

.upload-area {
  width: 100%;
}

.upload-content,
.parsing-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.upload-icon {
  font-size: 64px;
  color: #409eff;
  margin-bottom: 16px;
}

.loading-icon {
  font-size: 48px;
  color: #409eff;
  margin-bottom: 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.upload-text,
.parsing-text {
  text-align: center;
}

.main-text {
  font-size: 16px;
  color: #606266;
  margin: 0 0 8px;
}

.sub-text {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.upload-button {
  margin-top: 16px;
}

.parsing-text .el-progress {
  width: 300px;
  margin-top: 16px;
}

.parse-result {
  max-height: 60vh;
  overflow-y: auto;
}

.warning-alert,
.result-descriptions {
  margin-bottom: 20px;
}

.unrecognized {
  color: #e6a23c;
  font-weight: 500;
}

.section {
  margin-top: 20px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  padding-left: 10px;
  border-left: 3px solid #409eff;
}

.section .el-card p {
  margin: 4px 0;
  font-size: 14px;
  color: #606266;
}

.section .el-card p strong {
  color: #303133;
}

.description {
  color: #909399;
  font-size: 13px;
  margin-top: 8px;
}

.tech-tag,
.skill-tag {
  margin: 4px;
}

.skills-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.usage-tips {
  margin-top: 20px;
}

.usage-tips ul {
  margin: 8px 0 0;
  padding-left: 20px;
}

.usage-tips li {
  margin: 4px 0;
  font-size: 13px;
  color: #606266;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 768px) {
  .resume-import {
    margin: 0 10px 20px;
  }

  .parse-result {
    max-height: 50vh;
  }
}
</style>
