<template>
  <div class="resume-container">
    <!-- 个人信息部分 -->
    <div class="resume-personal">
      <div class="resume-info">
        <h1 class="resume-name">{{ resumeStore.currentResume?.basic.name || '你的名字' }}</h1>
        <p class="resume-summary" v-if="resumeStore.currentResume?.basic.summary">{{ resumeStore.currentResume.basic.summary }}</p>
        <div class="resume-contact">
          <span class="contact-item">
            <span class="contact-icon">📅</span> {{ resumeStore.currentResume?.basic.age || '年龄' }}
          </span>
          <span class="contact-item">
            <span class="contact-icon">💼</span> {{ resumeStore.currentResume?.basic.workYears || '工作年限' }}
          </span>
          <span class="contact-item">
            <span class="contact-icon">📞</span> {{ resumeStore.currentResume?.basic.phone || '联系电话' }}
          </span>
          <span class="contact-item">
            <span class="contact-icon">✉️</span> {{ resumeStore.currentResume?.basic.email || '电子邮箱' }}
          </span>
        </div>
      </div>
      <div class="resume-avatar">
        <img 
          class="avatar-img" 
          :src="resumeStore.currentResume?.basic.avatar || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20avatar%20portrait%20of%20a%20young%20Chinese%20man%2C%20clean%20background%2C%20business%20style&image_size=square'" 
          alt="头像" 
        />
      </div>
    </div>
    
    <!-- 教育背景 -->
    <div class="education-section resume-section">
      <h2 class="section-title">
        <span class="section-icon">🎓</span> 教育背景
      </h2>
      <div v-if="resumeStore.currentResume?.education && resumeStore.currentResume.education.length">
        <div v-for="edu in resumeStore.currentResume.education" :key="edu.id" class="education-item">
          <div class="education-header">
            <span class="education-time">{{ formatDate(edu.startDate || '设置时间') }} - {{ formatDate(edu.endDate || '设置时间') }}</span>
            <span class="education-school">{{ edu.school || '填写学校名称' }}</span>
            <span class="education-major">{{ edu.major || '填写专业名称' }}</span>
          </div>
          <p class="education-description">
            {{ edu.description || '尽量简洁，突出重点，成绩优异的话建议写上GPA及排名等信息，如：GPA: 3.7/4（专业前10%）GRE: 324' }}
          </p>
        </div>
      </div>
      <div v-else class="empty-section">
        <div class="education-item">
          <div class="education-header">
            <span class="education-time">设置时间</span>
            <span class="education-school">填写学校名称</span>
            <span class="education-major">填写专业名称</span>
          </div>
          <p class="education-description">
            尽量简洁，突出重点，成绩优异的话建议写上GPA及排名等信息，如：GPA: 3.7/4（专业前10%）GRE: 324
          </p>
        </div>
      </div>
    </div>
    
    <!-- 专业技能 -->
    <div class="resume-section">
      <h2 class="section-title">
        <span class="section-icon">🔧</span> 专业技能
      </h2>
      <div class="skills-container">
        <div v-if="resumeStore.currentResume?.skills.length">
          <span v-for="skill in resumeStore.currentResume.skills" :key="skill.id" style="margin-right: 10px; font-size: 11px;">
            {{ skill.name }}
          </span>
        </div>
        <div v-else>暂无技能证书</div>
      </div>
    </div>
    
    <!-- 项目经历 -->
    <div v-if="moduleOrder.includes('project')" class="resume-section">
      <h2 class="section-title">
        <span class="section-icon">📁</span> 项目经历
      </h2>
      <div v-if="resumeStore.currentResume?.project.length">
        <div v-for="project in resumeStore.currentResume.project" :key="project.id" class="project-item">
          <div class="project-header">
            <span class="project-time">{{ formatDate(project.startDate) }} - {{ formatDate(project.endDate) }}</span>
            <span class="project-name">{{ project.name }}</span>
          </div>
          <p class="project-description">{{ project.description }}</p>
          <div class="project-technologies" v-if="project.technologies && project.technologies.length">
              <span class="tech-label">技术栈：</span>
              <span v-for="tech in project.technologies" :key="tech" class="tech-tag">{{ tech.trim() }}</span>
            </div>
        </div>
      </div>
      <div v-else class="empty-section">
        <div class="project-item">
          <div class="project-header">
            <span class="project-time">设置时间</span>
            <span class="project-name">填写项目名称</span>
          </div>
          <p class="project-description">详细描述项目背景、职责、使用技术及成果，突出项目的创新性和个人贡献</p>
          <div class="project-technologies">
            <span class="tech-label">技术栈：</span>
            <span class="tech-tag">Vue 3</span>
            <span class="tech-tag">TypeScript</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 在校经历 -->
    <div class="campus-section resume-section">
      <h2 class="section-title">
        <span class="section-icon">🎓</span> 在校经历
      </h2>
      <div v-if="resumeStore.currentResume?.campus && resumeStore.currentResume.campus.length">
        <div v-for="campus in resumeStore.currentResume.campus" :key="campus.id" class="work-item">
          <div class="work-header">
            <span class="work-time">{{ formatDate(campus.startDate || '设置时间') }} - {{ formatDate(campus.endDate || '设置时间') }}</span>
            <span class="work-company">{{ campus.organization || '填写社团/组织名称' }}</span>
            <span class="work-position">{{ campus.position || '填写职位名称' }}</span>
          </div>
          <p class="work-description">
            {{ campus.description || '详细描述你在大学期间的社团活动、学生会工作、志愿者经历等，突出你的组织能力、团队协作能力和领导能力。' }}
          </p>
        </div>
      </div>
      <div v-else class="empty-section">
        <div class="work-item">
          <div class="work-header">
            <span class="work-time">设置时间</span>
            <span class="work-company">填写社团/组织名称</span>
            <span class="work-position">填写职位名称</span>
          </div>
          <p class="work-description">
            详细描述你在大学期间的社团活动、学生会工作、志愿者经历等，突出你的组织能力、团队协作能力和领导能力。
          </p>
        </div>
      </div>
    </div>
    
    <!-- 荣誉奖项 -->
    <div class="awards-section resume-section">
      <h2 class="section-title">
        <span class="section-icon">🏆</span> 荣誉奖项
      </h2>
      <div v-if="resumeStore.currentResume?.honors && resumeStore.currentResume.honors.length">
        <div v-for="award in resumeStore.currentResume.honors" :key="award.id" class="award-item">
          <div class="award-header">
            <span class="award-time">{{ award.date || '设置时间' }}</span>
            <span class="award-name">{{ award.name || '填写奖项名称' }}</span>
          </div>
          <p class="award-description" v-if="award.description">{{ award.description }}</p>
        </div>
      </div>
      <div v-else class="empty-section">
        <div class="award-item">
          <div class="award-header">
            <span class="award-time">设置时间</span>
            <span class="award-name">填写奖项名称</span>
          </div>
          <p class="award-description">详细描述你所获得的奖项荣誉，时间倒叙，与目标岗位相关性强的写在前面，只写有代表性的奖项即可，同年或同类别的奖项可进行适当合并。</p>
        </div>
      </div>
    </div>
    
    <!-- 工作经验 -->
    <div v-if="resumeStore.currentResume?.work && resumeStore.currentResume.work.length" class="resume-section">
      <h2 class="section-title">
        <span class="section-icon">💼</span> {{ currentTemplate === 'campus' ? '实习经历' : '工作经历' }}
      </h2>
      <div v-if="resumeStore.currentResume?.work && resumeStore.currentResume.work.length">
        <div v-for="work in resumeStore.currentResume.work" :key="work.id" class="work-item">
          <div class="work-header">
            <span class="work-time">{{ formatDate(work.startDate || '设置时间') }} - {{ formatDate(work.endDate || '设置时间') }}</span>
            <span class="work-company">{{ work.company || '填写公司名称' }}</span>
            <span class="work-position">{{ work.position || '填写职位名称' }}</span>
          </div>
          <p class="work-description">
            {{ work.description || '详细描述你的职责范围、工作任务及取得的成绩，工作经验的时间采取倒叙形式，最近经历写在前面，描述尽量具体简洁，工作经验的描述与目标岗位的招聘要求尽量匹配，用词精准。' }}
          </p>
        </div>
      </div>
      <div v-else class="empty-section">
        <div class="work-item">
          <div class="work-header">
            <span class="work-time">设置时间</span>
            <span class="work-company">填写公司名称</span>
            <span class="work-position">填写职位名称</span>
          </div>
          <p class="work-description">
            详细描述你的职责范围、工作任务及取得的成绩，工作经验的时间采取倒叙形式，最近经历写在前面，描述尽量具体简洁，工作经验的描述与目标岗位的招聘要求尽量匹配，用词精准。
          </p>
        </div>
      </div>
    </div>
    
    <!-- 自我评价 -->
    <div v-if="moduleOrder.includes('selfEvaluation')" class="resume-section">
      <h2 class="section-title">
        <span class="section-icon">👤</span> 自我评价
      </h2>
      <p class="self-evaluation" v-if="resumeStore.currentResume?.selfEvaluation?.content">
        {{ resumeStore.currentResume.selfEvaluation.content }}
      </p>
      <p class="self-evaluation" v-else>
        篇幅不要太长，注意结合简历整体的美观度，如果真的有很多话要说，建议以求职信的形式附上。自我评价应做到突出自身符合目标岗位要求的「卖点」，避免过多使用形容词，而应该通过数据及实例来对自身价值进行深化。
      </p>
      <div v-if="resumeStore.currentResume?.selfEvaluation?.keywords && resumeStore.currentResume.selfEvaluation.keywords.length" class="self-evaluation-keywords">
        <span v-for="keyword in resumeStore.currentResume.selfEvaluation.keywords" :key="keyword" class="keyword-tag">
          {{ keyword }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useResumeStore } from '@/store'

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

// 格式化日期，只显示YYYY-M格式
const formatDate = (date: string) => {
  if (!date || date === '至今') return date
  // 检查是否是完整的日期时间字符串
  if (date.includes('T')) {
    // 解析ISO日期字符串
    const d = new Date(date)
    return `${d.getFullYear()}-${d.getMonth() + 1}`
  }
  return date
}
</script>

<style scoped>
/* 应届生清新风模板样式 */
.resume-container {
  padding: 30px;
  background: #ffffff;
  min-height: 297mm;
  border: 1px solid #e0e0e0;
}

.resume-personal {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.resume-info {
  flex: 1;
}

.resume-name {
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 10px 0;
  color: #333;
}

.resume-summary {
  font-size: 14px;
  color: #666;
  margin: 0 0 15px 0;
}

.resume-contact {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  font-size: 12px;
  color: #999;
}

.contact-item {
  display: flex;
  align-items: center;
}

.contact-icon {
  margin-right: 5px;
}

.resume-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.resume-section {
  margin-bottom: 25px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
  display: flex;
  align-items: center;
  padding-bottom: 5px;
  border-bottom: 1px solid #e0e0e0;
}

.section-icon {
  margin-right: 8px;
}

.job-intent {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.intent-item {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #666;
}

.intent-icon {
  margin-right: 8px;
}

.education-item {
  margin-bottom: 15px;
}

.education-header {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 10px;
  font-size: 14px;
}

.education-time {
  color: #999;
}

.education-school {
  font-weight: bold;
  color: #333;
}

.education-major {
  color: #666;
}

.education-description {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
  padding-left: 20px;
}

.work-item {
  margin-bottom: 15px;
}

.work-header {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 10px;
  font-size: 14px;
}

.work-time {
  color: #999;
}

.work-company {
  font-weight: bold;
  color: #333;
}

.work-position {
  color: #666;
}

.work-description {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
  padding-left: 20px;
}

.skills-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 13px;
  color: #666;
}

.add-skills {
  font-size: 12px;
  color: #409eff;
  cursor: pointer;
  margin-top: 5px;
}

.self-evaluation {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
  padding-left: 20px;
  border-left: 3px solid #e0e0e0;
  margin-bottom: 10px;
}

.self-evaluation-keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.keyword-tag {
  background: #f0f9ff;
  color: #409eff;
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 11px;
  border: 1px solid #d6ecff;
}

.award-item {
  margin-bottom: 15px;
}

.award-header {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 10px;
  font-size: 14px;
}

.award-time {
  color: #999;
}

.award-name {
  font-weight: bold;
  color: #333;
}

.award-description {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
  padding-left: 20px;
}

.empty-section {
  color: #999;
  font-style: italic;
}

.project-item {
  margin-bottom: 15px;
}

.project-header {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 10px;
  font-size: 14px;
}

.project-time {
  color: #999;
}

.project-name {
  font-weight: bold;
  color: #333;
}

.project-description {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
  padding-left: 20px;
  margin-bottom: 10px;
}

.project-technologies {
  margin-top: 8px;
  font-size: 12px;
  padding-left: 20px;
}

.tech-label {
  color: #999;
  margin-right: 8px;
}

.tech-tag {
  background: #f5f5f5;
  color: #666;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 11px;
  margin-right: 6px;
  border: 1px solid #e0e0e0;
}
</style>