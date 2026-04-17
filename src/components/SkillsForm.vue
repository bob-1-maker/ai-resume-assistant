<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useResumeStore } from '@/store'
import { Plus, Delete } from '@element-plus/icons-vue'
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

const updateSkill = (id: string, value: string) => {
  const skill = skills.value.find(skill => skill.id === id)
  if (skill) {
    skill.name = value
    saveSkills()
  }
}

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
            <el-col :xs="24">
              <el-form-item label="技能描述" required>
                <el-input 
                  v-model="skill.name" 
                  placeholder="请输入完整的技能描述，例如：• 熟悉 HTML/CSS，能精确还原设计稿，熟悉 Flex 布局、移动端适配及 CSS3 动画"
                  type="textarea"
                  :rows="3"
                  @input="updateSkill(skill.id, skill.name)"
                />
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
