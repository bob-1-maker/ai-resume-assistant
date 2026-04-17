<template>
  <div class="resume-container">
    <div class="resume-sidebar">
      <div class="avatar-section">
        <div class="avatar">
          <img
            :src="resumeStore.currentResume?.basic.avatar || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20avatar%20portrait%20of%20a%20young%20Chinese%20man%2C%20clean%20background%2C%20business%20style&image_size=square'"
            alt="头像"
          />
        </div>
      </div>

      <div v-if="moduleOrder.includes('basic')" class="sidebar-section">
        <h3 class="sidebar-title">
          <i class="icon">👤</i>
          个人信息
        </h3>
        <div class="sidebar-content">
          <div class="info-item" v-if="resumeStore.currentResume?.basic.age">
            <span class="info-icon">📅</span>
            <span>年龄：{{ resumeStore.currentResume.basic.age }}</span>
          </div>
          <div class="info-item" v-if="resumeStore.currentResume?.basic.workYears">
            <span class="info-icon">💼</span>
            <span>工作年限：{{ resumeStore.currentResume.basic.workYears }}</span>
          </div>
          <div class="info-item" v-if="resumeStore.currentResume?.basic.phone">
            <span class="info-icon">📱</span>
            <span>联系电话：{{ resumeStore.currentResume.basic.phone }}</span>
          </div>
          <div class="info-item" v-if="resumeStore.currentResume?.basic.email">
            <span class="info-icon">📧</span>
            <span>电子邮箱：{{ resumeStore.currentResume.basic.email }}</span>
          </div>
          <div class="info-item" v-if="resumeStore.currentResume?.basic.location">
            <span class="info-icon">📍</span>
            <span>所在城市：{{ resumeStore.currentResume.basic.location }}</span>
          </div>
        </div>
      </div>

      <div v-if="sidebarSkills.length > 0" class="sidebar-section">
        <h3 class="sidebar-title">
          <i class="icon">⚡</i>
          专业技能
        </h3>
        <div class="sidebar-content">
          <div class="skills-container">
            <span v-for="(skill, index) in sidebarSkills" :key="skill.id || index" class="skill-item">
              {{ skill.name || skill }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="resume-main">
      <div class="resume-header">
        <h1 class="resume-name">{{ resumeStore.currentResume?.basic.name || '你的名字' }}</h1>
        <p class="resume-summary" v-if="resumeStore.currentResume?.basic.summary">{{ resumeStore.currentResume.basic.summary }}</p>
      </div>

      <div
        v-if="(resumeStore.currentResume?.education && resumeStore.currentResume.education.length) || (resumeStore.currentResume?.parseResult?.education && resumeStore.currentResume.parseResult.education.length)"
        class="main-section"
      >
        <h3 class="section-title">
          <span class="section-icon">🎓</span>
          教育背景
        </h3>
        <div class="section-content">
          <div>
            <div v-for="(edu, index) in resumeStore.currentResume?.parseResult?.education || resumeStore.currentResume?.education" :key="index" class="education-item">
              <div class="item-header">
                <div class="item-period">{{ formatDate(edu.time || edu.startDate) }} - {{ formatDate(edu.endDate) }}</div>
                <div class="item-title">{{ edu.school }}</div>
              </div>
              <div class="item-meta">{{ edu.major }} {{ edu.degree }}</div>
              <div class="item-description" v-if="edu.description">{{ edu.description }}</div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="(resumeStore.currentResume?.project && resumeStore.currentResume.project.length) || (resumeStore.currentResume?.parseResult?.projects && resumeStore.currentResume.parseResult.projects.length)"
        class="main-section"
      >
        <h3 class="section-title">
          <span class="section-icon">📁</span>
          项目经历
        </h3>
        <div class="section-content">
          <div>
            <div v-for="(project, index) in resumeStore.currentResume?.parseResult?.projects || resumeStore.currentResume?.project" :key="index" class="project-item">
              <div class="item-header">
                <div class="item-period">{{ formatDate(project.time || project.startDate) }} - {{ formatDate(project.endDate) }}</div>
                <div class="item-title">{{ project.name }}</div>
              </div>
              <div class="item-description">{{ project.desc || project.description }}</div>
              <div class="item-technologies" v-if="project.tech || (project.technologies && project.technologies.length)">
                <span class="tech-label">技术栈：</span>
                <span v-for="(tech, techIndex) in (project.tech ? project.tech.split(', ').filter(Boolean) : project.technologies)" :key="techIndex" class="tech-tag">{{ tech.trim() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="(resumeStore.currentResume?.work && resumeStore.currentResume.work.length) || (resumeStore.currentResume?.parseResult?.workExperience && resumeStore.currentResume.parseResult.workExperience.length)"
        class="main-section"
      >
        <h3 class="section-title">
          <span class="section-icon">💼</span>
          {{ currentTemplate === 'campus' ? '实习经历' : '工作经历' }}
        </h3>
        <div class="section-content">
          <div>
            <div v-for="(work, index) in resumeStore.currentResume?.parseResult?.workExperience || resumeStore.currentResume?.work" :key="index" class="experience-item">
              <div class="item-header">
                <div class="item-period">{{ formatDate(work.time || work.startDate) }} - {{ formatDate(work.endDate) }}</div>
                <div class="item-title">{{ work.role || work.position }}</div>
              </div>
              <div class="item-company">{{ work.company }}</div>
              <div class="item-description">{{ work.desc || work.description }}</div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="(resumeStore.currentResume?.campus && resumeStore.currentResume.campus.length) || (resumeStore.currentResume?.parseResult?.campusExperience && resumeStore.currentResume.parseResult.campusExperience.length)"
        class="campus-section main-section"
      >
        <h3 class="section-title">
          <span class="section-icon">🎓</span>
          在校经历
        </h3>
        <div class="section-content">
          <div>
            <div v-for="(campus, index) in resumeStore.currentResume?.parseResult?.campusExperience || resumeStore.currentResume?.campus" :key="index" class="experience-item">
              <div class="item-header">
                <div class="item-period">{{ formatDate(campus.time || campus.startDate) }} - {{ formatDate(campus.endDate) }}</div>
                <div class="item-title">{{ campus.role || campus.position }}</div>
              </div>
              <div class="item-company">{{ campus.org || campus.organization }}</div>
              <div class="item-description">{{ campus.desc || campus.description }}</div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="shouldRenderAwards && mergedAwards.length > 0" class="awards-section main-section">
        <h3 class="section-title">
          <span class="section-icon">🏆</span>
          荣誉奖项
        </h3>
        <div class="section-content">
          <div>
            <div v-for="award in mergedAwards" :key="award.id" class="main-award-item">
              <div class="item-header">
                <div class="item-period">{{ award.time || award.date }}</div>
                <div class="item-title">{{ award.name }}</div>
              </div>
              <div class="item-description" v-if="award.desc || award.description">{{ award.desc || award.description }}</div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="moduleOrder.includes('selfEvaluation')" class="main-section">
        <h3 class="section-title">
          <span class="section-icon">📝</span>
          自我评价
        </h3>
        <div class="section-content">
          <div class="self-evaluation" v-if="resumeStore.currentResume?.selfEvaluation?.content">
            {{ resumeStore.currentResume.selfEvaluation.content }}
          </div>
          <div class="self-evaluation" v-else>
            篇幅不要太长，注意结合简历整体的美观度，如果真的有很多话要说，建议以求职信的形式附上。自我评价应做到突出自身符合目标岗位要求的“卖点”，避免过多使用形容词，而应该通过数据及实例来对自身价值进行深化。
          </div>
          <div v-if="resumeStore.currentResume?.selfEvaluation?.keywords && resumeStore.currentResume.selfEvaluation.keywords.length" class="self-evaluation-keywords">
            <span v-for="keyword in resumeStore.currentResume.selfEvaluation.keywords" :key="keyword" class="keyword-tag">
              {{ keyword }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useResumeStore } from '@/store'
import { computed } from 'vue'

const props = defineProps({
  moduleOrder: {
    type: Array,
    required: true
  },
  currentTemplate: {
    type: String,
    required: true
  }
})

const resumeStore = useResumeStore()

const sidebarSkills = computed(() => resumeStore.currentResume?.skills || [])

const mergedAwards = computed(() => {
  const awards = resumeStore.currentResume?.awards || []
  const honors = resumeStore.currentResume?.honors || []
  const sourceAwards = awards.length > 0 ? awards : honors

  return sourceAwards
    .map((award, index) => ({
      ...award,
      id: award.id || `award-${index}`
    }))
    .filter((award) => award.name)
})

const shouldRenderAwards = computed(() =>
  Array.isArray(props.moduleOrder) &&
  (props.moduleOrder.includes('awards') || props.moduleOrder.includes('honors'))
)

const formatDate = (date: string) => {
  if (!date || date === '至今') return date
  if (date.includes('T')) {
    const d = new Date(date)
    return `${d.getFullYear()}-${d.getMonth() + 1}`
  }
  return date
}
</script>

<style scoped>
.resume-container {
  display: flex;
  min-height: 297mm;
  background: #ffffff;
  border: none;
  box-shadow: none;
}

.resume-sidebar {
  width: 30%;
  background: #fafafa;
  padding: 32px 24px;
  border-right: 1px solid #e8e8e8;
  min-height: 100%;
}

.avatar-section {
  text-align: center;
  margin-bottom: 24px;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto;
  border: 3px solid #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sidebar-section {
  margin-bottom: 24px;
}

.sidebar-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #2A2A2A;
  display: flex;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 2px solid #e8e8e8;
}

.icon {
  margin-right: 10px;
  font-size: 16px;
}

.sidebar-content {
  font-size: 13px;
  color: #555555;
  line-height: 1.6;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  color: #555555;
}

.info-icon {
  margin-right: 10px;
  font-size: 14px;
}

.skills-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.skill-item {
  background: #ffffff;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  color: #2A2A2A;
  border: 1px solid #e8e8e8;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.hobbies-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.hobby-item {
  background: #ffffff;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  color: #2A2A2A;
  border: 1px solid #e8e8e8;
}

.add-button {
  font-size: 12px;
  color: #2A2A2A;
  cursor: pointer;
  margin-top: 8px;
}

.empty-section {
  color: #999999;
  font-style: italic;
  font-size: 13px;
}

.resume-main {
  flex: 1;
  padding: 32px 32px 32px 40px;
  min-height: 100%;
}

.resume-header {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 3px solid #2A2A2A;
}

.resume-name {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 12px 0;
  color: #2A2A2A;
  letter-spacing: 0.5px;
}

.resume-summary {
  font-size: 14px;
  color: #555555;
  margin: 0;
  line-height: 1.6;
}

.main-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 18px;
  color: #2A2A2A;
  display: flex;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 2px solid #e8e8e8;
}

.section-icon {
  margin-right: 10px;
  font-size: 18px;
}

.section-content {
  font-size: 13px;
  color: #555555;
  line-height: 1.6;
}

.job-intent {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.intent-item {
  display: flex;
  align-items: center;
}

.intent-icon {
  margin-right: 10px;
}

.education-item {
  margin-bottom: 24px;
}

.experience-item {
  margin-bottom: 24px;
}

.main-award-item {
  margin-bottom: 24px;
}

.item-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2A2A2A;
}

.item-period {
  font-size: 13px;
  color: #888888;
  font-weight: 500;
}

.item-title {
  font-size: 15px;
  color: #2A2A2A;
  font-weight: 600;
}

.item-meta {
  font-size: 13px;
  color: #666666;
  margin-bottom: 8px;
}

.item-company {
  font-size: 13px;
  color: #666666;
  margin-bottom: 8px;
}

.item-description {
  font-size: 13px;
  color: #555555;
  line-height: 1.6;
  padding-left: 20px;
  margin-bottom: 8px;
}

.self-evaluation {
  font-size: 13px;
  color: #555555;
  line-height: 1.6;
  border-left: 4px solid #2A2A2A;
  padding-left: 16px;
  margin-bottom: 12px;
  background: #fafafa;
  padding: 16px;
  border-radius: 6px;
}

.self-evaluation-keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.keyword-tag {
  background: #f0f0f0;
  color: #2A2A2A;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid #e8e8e8;
}

.project-item {
  margin-bottom: 24px;
}

.item-technologies {
  margin-top: 10px;
  font-size: 13px;
}

.tech-label {
  color: #666666;
  margin-right: 8px;
  font-weight: 500;
}

.tech-tag {
  background: #fafafa;
  color: #555555;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 6px;
  border: 1px solid #e8e8e8;
}
</style>
