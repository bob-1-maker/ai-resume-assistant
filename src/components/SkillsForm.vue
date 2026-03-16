<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useResumeStore } from '@/store'
import type { Skill } from '@/types'

const resumeStore = useResumeStore()

const skills = ref<Skill[]>([])

const syncSkills = () => {
  if (resumeStore.currentResume) {
    skills.value = [...(resumeStore.currentResume.skills || [])]
  }
}

const saveSkills = () => {
  if (resumeStore.currentResume) {
    const updatedResume = {
      ...resumeStore.currentResume,
      skills: skills.value
    }
    resumeStore.saveResume(updatedResume)
  }
}

const addSkill = () => {
  const newSkill: Skill = {
    id: crypto.randomUUID(),
    name: '',
    level: 'intermediate',
    category: '技术'
  }
  skills.value.push(newSkill)
  saveSkills()
  ElMessage.success('技能添加成功！')
}

const removeSkill = (id: string) => {
  const index = skills.value.findIndex(skill => skill.id === id)
  if (index >= 0) {
    skills.value.splice(index, 1)
    saveSkills()
    ElMessage.success('技能删除成功！')
  }
}

const updateSkill = (id: string, field: keyof Skill, value: string) => {
  const skill = skills.value.find(skill => skill.id === id)
  if (skill) {
    skill[field] = value
    saveSkills()
  }
}

const skillLevels = [
  { label: '入门', value: 'beginner' },
  { label: '中级', value: 'intermediate' },
  { label: '高级', value: 'advanced' },
  { label: '专家', value: 'expert' }
]

const skillCategories = [
  { label: '技术', value: '技术' },
  { label: '语言', value: '语言' },
  { label: '软技能', value: '软技能' },
  { label: '其他', value: '其他' }
]

onMounted(() => {
  syncSkills()
})

watch(() => resumeStore.currentResume, () => {
  syncSkills()
}, { deep: true })
</script>

<template>
  <el-card class="skills-form">
    <template #header>
      <div class="card-header">
        <span class="title">技能列表</span>
        <el-button type="primary" size="small" @click="addSkill">
          <el-icon><Plus /></el-icon>
          添加
        </el-button>
      </div>
    </template>
    
    <div v-if="skills.length === 0" class="empty-state">
      <el-empty description="暂无技能" :image-size="80" />
      <el-button type="primary" style="margin-top: 20px" @click="addSkill">
        <el-icon><Plus /></el-icon>
        添加技能
      </el-button>
    </div>
    
    <div v-else class="skills-list">
      <el-card
        v-for="skill in skills"
        :key="skill.id"
        class="skill-item"
        :body-style="{ padding: '20px' }"
      >
        <div class="skill-header">
          <span class="item-title">技能 {{ skills.indexOf(skill) + 1 }}</span>
          <el-button
            type="danger"
            size="small"
            circle
            @click="removeSkill(skill.id)"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
        
        <el-form :model="skill" label-width="80px" class="skill-form">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12">
              <el-form-item label="技能名称" required>
                <el-input 
                  v-model="skill.name" 
                  placeholder="请输入技能名称"
                  @input="updateSkill(skill.id, 'name', skill.name)"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item label="技能等级" required>
                <el-select 
                  v-model="skill.level" 
                  placeholder="请选择技能等级" 
                  style="width: 100%"
                  @change="updateSkill(skill.id, 'level', skill.level)"
                >
                  <el-option 
                    v-for="level in skillLevels" 
                    :key="level.value" 
                    :label="level.label" 
                    :value="level.value" 
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12">
              <el-form-item label="技能分类" required>
                <el-select 
                  v-model="skill.category" 
                  placeholder="请选择技能分类" 
                  style="width: 100%"
                  @change="updateSkill(skill.id, 'category', skill.category)"
                >
                  <el-option 
                    v-for="category in skillCategories" 
                    :key="category.value" 
                    :label="category.label" 
                    :value="category.value" 
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
    </div>
  </el-card>
</template>

<style scoped>
.skills-form {
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

.skills-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.skill-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
}

.skill-header {
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

@media (max-width: 768px) {
  .skills-form {
    margin: 0 10px 20px 10px;
  }
  
  .skill-item {
    margin: 0;
  }
}
</style>
