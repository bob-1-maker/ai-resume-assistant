<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useResumeStore } from '@/store'
import type { Project } from '@/types'

const resumeStore = useResumeStore()

const projects = ref<Project[]>([])

const syncProjects = () => {
  if (resumeStore.currentResume) {
    projects.value = [...(resumeStore.currentResume.project || [])]
  }
}

const saveProjects = () => {
  if (resumeStore.currentResume) {
    const updatedResume = {
      ...resumeStore.currentResume,
      project: projects.value
    }
    resumeStore.saveResume(updatedResume)
  }
}

const addProject = () => {
  const newProject: Project = {
    id: crypto.randomUUID(),
    name: '',
    role: '',
    startDate: '',
    endDate: '',
    description: '',
    technologies: []
  }
  projects.value.push(newProject)
  saveProjects()
  ElMessage.success('项目经验添加成功！')
}

const removeProject = (id: string) => {
  const index = projects.value.findIndex(project => project.id === id)
  if (index >= 0) {
    projects.value.splice(index, 1)
    saveProjects()
    ElMessage.success('项目经验删除成功！')
  }
}

const updateProject = (id: string, field: keyof Project, value: any) => {
  const project = projects.value.find(project => project.id === id)
  if (project) {
    project[field] = value
    saveProjects()
  }
}

const addTechnology = (id: string, tech: string) => {
  const project = projects.value.find(project => project.id === id)
  if (project && tech.trim() && !project.technologies.includes(tech.trim())) {
    project.technologies.push(tech.trim())
    saveProjects()
  }
}

const removeTechnology = (id: string, tech: string) => {
  const project = projects.value.find(project => project.id === id)
  if (project) {
    const index = project.technologies.indexOf(tech)
    if (index >= 0) {
      project.technologies.splice(index, 1)
      saveProjects()
    }
  }
}

onMounted(() => {
  syncProjects()
})

watch(() => resumeStore.currentResume, () => {
  syncProjects()
}, { deep: true })
</script>

<template>
  <el-card class="project-form">
    <template #header>
      <div class="card-header">
        <span class="title">项目经验</span>
        <el-button type="primary" size="small" @click="addProject">
          <el-icon><Plus /></el-icon>
          添加
        </el-button>
      </div>
    </template>
    
    <div v-if="projects.length === 0" class="empty-state">
      <el-empty description="暂无项目经验" :image-size="80" />
      <el-button type="primary" style="margin-top: 20px" @click="addProject">
        <el-icon><Plus /></el-icon>
        添加项目经验
      </el-button>
    </div>
    
    <div v-else class="projects-list">
      <el-card
        v-for="project in projects"
        :key="project.id"
        class="project-item"
        :body-style="{ padding: '20px' }"
      >
        <div class="project-header">
          <span class="item-title">项目经验 {{ projects.indexOf(project) + 1 }}</span>
          <el-button
            type="danger"
            size="small"
            circle
            @click="removeProject(project.id)"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
        
        <el-form :model="project" label-width="80px" class="project-form">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12">
              <el-form-item label="项目名称" required>
                <el-input 
                  v-model="project.name" 
                  placeholder="请输入项目名称"
                  @input="updateProject(project.id, 'name', project.name)"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item label="担任角色" required>
                <el-input 
                  v-model="project.role" 
                  placeholder="请输入担任角色"
                  @input="updateProject(project.id, 'role', project.role)"
                />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12">
              <el-form-item label="开始时间" required>
                <el-date-picker 
                  v-model="project.startDate" 
                  type="month" 
                  placeholder="选择开始时间"
                  style="width: 100%"
                  @change="updateProject(project.id, 'startDate', project.startDate)"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item label="结束时间" required>
                <el-date-picker 
                  v-model="project.endDate" 
                  type="month" 
                  placeholder="选择结束时间"
                  style="width: 100%"
                  @change="updateProject(project.id, 'endDate', project.endDate)"
                />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-form-item label="项目描述" required>
            <el-input
              v-model="project.description"
              type="textarea"
              :rows="4"
              placeholder="请输入项目描述，支持多行输入&#10;• 使用 • 或 - 开头添加列表项&#10;• 支持换行分段"
              @input="updateProject(project.id, 'description', project.description)"
            />
          </el-form-item>
          
          <el-form-item label="技术栈">
            <el-tag
              v-for="tech in project.technologies"
              :key="tech"
              closable
              @close="removeTechnology(project.id, tech)"
              class="tech-tag"
            >
              {{ tech }}
            </el-tag>
            <el-input
              v-model="project.newTechnology"
              placeholder="输入技术栈并按回车添加"
              @keyup.enter="addTechnology(project.id, project.newTechnology); project.newTechnology = ''"
              style="margin-top: 10px"
            />
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </el-card>
</template>

<style scoped>
.project-form {
  margin-bottom: 20px;
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

.empty-state {
  text-align: center;
  padding: 40px 0;
}

.projects-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.project-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f2f5;
}

.item-title {
  font-size: 14px;
  font-weight: 600;
  color: #409eff;
}

.tech-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}

@media (max-width: 768px) {
  .project-form {
    margin: 0 10px 20px 10px;
  }
  
  .project-item {
    margin: 0;
  }
}
</style>
