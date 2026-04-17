<template>
  <div class="resume-container">
    <div class="resume-title">RESUME</div>
    
    <!-- 个人信息 -->
    <div class="personal-info">
      <div class="name-section">
        <h1 class="resume-name">{{ resumeStore.currentResume?.basic.name || '你的名字' }}</h1>
        <p class="resume-summary" v-if="resumeStore.currentResume?.basic.summary">{{ resumeStore.currentResume.basic.summary }}</p>
        <div class="contact-info">
          <span v-if="resumeStore.currentResume?.basic.age">{{ resumeStore.currentResume.basic.age }} | </span>
          <span v-if="resumeStore.currentResume?.basic.workYears">{{ resumeStore.currentResume.basic.workYears }} | </span>
          <span v-if="resumeStore.currentResume?.basic.phone">{{ resumeStore.currentResume.basic.phone }} | </span>
          <span v-if="resumeStore.currentResume?.basic.email">{{ resumeStore.currentResume.basic.email }}</span>
        </div>
      </div>
      <div class="avatar-section">
        <img 
          class="avatar" 
          :src="resumeStore.currentResume?.basic.avatar || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20avatar%20portrait%20of%20a%20young%20Chinese%20man%2C%20clean%20background%2C%20business%20style&image_size=square'" 
          alt="头像" 
        />
      </div>
    </div>

    <!-- 教育背景 -->
    <div v-if="moduleOrder.includes('education')" class="resume-section">
      <h3 class="section-title">
        <span class="section-icon">🎓</span>
        教育背景
      </h3>
      <div class="section-content">
        <div v-if="resumeStore.currentResume?.education && resumeStore.currentResume.education.length">
          <div v-for="item in resumeStore.currentResume.education" :key="item.id" class="education-item">
            <div class="education-header">
              <div class="education-time">{{ formatDate(item.startDate || '设置时间') }} - {{ formatDate(item.endDate || '设置时间') }}</div>
              <div class="education-school">{{ item.school || '填写学校名称' }}</div>
            </div>
            <div class="education-major">{{ item.major || '填写专业名称' }} {{ item.degree || '' }}</div>
            <div class="education-description" v-if="item.description">{{ item.description }}</div>
          </div>
        </div>
        <div v-else class="empty-section">
          <div class="education-item">
            <div class="education-header">
              <div class="education-time">设置时间</div>
              <div class="education-school">填写学校名称</div>
            </div>
            <div class="education-major">填写专业名称</div>
            <div class="education-description">详细描述你的教育经历，突出重点，成绩优异的话请写上GPA及排名等信息，如：GPA：3.72/4（专业前10%） GRE：324</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 技能特长 -->
    <div v-if="moduleOrder.includes('skills')" class="resume-section">
      <h3 class="section-title">
        <span class="section-icon">⚡</span>
        专业技能
      </h3>
      <div class="section-content">
        <div class="skills-container">
          <div v-if="resumeStore.currentResume?.skills && resumeStore.currentResume.skills.length">
            <span v-for="skill in resumeStore.currentResume.skills" :key="skill.id" style="margin-right: 10px; font-size: 11px;">
              {{ skill.name }}
            </span>
          </div>
          <div v-else>暂无技能证书</div>
        </div>
      </div>
    </div>

    <!-- 项目经历 -->
    <div v-if="moduleOrder.includes('project')" class="resume-section">
      <h3 class="section-title">
        <span class="section-icon">📁</span>
        项目经历
      </h3>
      <div class="section-content">
        <div v-if="resumeStore.currentResume?.project && resumeStore.currentResume.project.length">
          <div v-for="project in resumeStore.currentResume.project" :key="project.id" class="project-item">
            <div class="project-header">
              <div class="project-time">{{ formatDate(project.startDate || '设置时间') }} - {{ formatDate(project.endDate || '设置时间') }}</div>
              <div class="project-name">{{ project.name || '填写项目名称' }}</div>
            </div>
            <div class="project-description">{{ project.description || '详细描述项目背景、职责、使用技术及成果，突出项目的创新性和个人贡献' }}</div>
            <div class="project-technologies" v-if="project.technologies && project.technologies.length">
              <span class="tech-label">技术栈：</span>
              <span v-for="tech in project.technologies" :key="tech" class="tech-tag">{{ tech.trim() }}</span>
            </div>
          </div>
        </div>
        <div v-else class="empty-section">
          <div class="project-item">
            <div class="project-header">
              <div class="project-time">设置时间</div>
              <div class="project-name">填写项目名称</div>
            </div>
            <div class="project-description">详细描述项目背景、职责、使用技术及成果，突出项目的创新性和个人贡献</div>
            <div class="project-technologies">
              <span class="tech-label">技术栈：</span>
              <span class="tech-tag">Vue 3</span>
              <span class="tech-tag">TypeScript</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 工作经历 / 实习经历 -->
    <div v-if="resumeStore.currentResume?.work && resumeStore.currentResume.work.length" class="resume-section">
      <h3 class="section-title">
        <span class="section-icon">💼</span>
        {{ currentTemplate === 'campus' ? '实习经历' : '工作经历' }}
      </h3>
      <div class="section-content">
        <div v-if="resumeStore.currentResume?.work && resumeStore.currentResume.work.length">
          <div v-for="item in resumeStore.currentResume.work" :key="item.id" class="work-item">
            <div class="work-header">
              <div class="work-time">{{ formatDate(item.startDate || '设置时间') }} - {{ formatDate(item.endDate || '设置时间') }}</div>
              <div class="work-company">{{ item.company || '填写公司名称' }}</div>
            </div>
            <div class="work-position">{{ item.position || '填写职位名称' }}</div>
            <div class="work-description">{{ item.description || '详细描述你的职责范围、工作任务及取得的成绩，工作经验的时间采取倒叙形式，最近经历写在前面，描述尽量具体简洁，工作经验的描述与目标岗位的招聘要求尽量匹配，用词精准。' }}</div>
          </div>
        </div>
        <div v-else class="empty-section">
          <div class="work-item">
            <div class="work-header">
              <div class="work-time">设置时间</div>
              <div class="work-company">填写公司名称</div>
            </div>
            <div class="work-position">填写职位名称</div>
            <div class="work-description">详细描述你的职责范围、工作任务及取得的成绩，工作经验的时间采取倒叙形式，最近经历写在前面，描述尽量具体简洁，工作经验的描述与目标岗位的招聘要求尽量匹配，用词精准。</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 在校经历 -->
    <div class="campus-section resume-section">
      <h3 class="section-title">
        <span class="section-icon">🎓</span>
        在校经历
      </h3>
      <div class="section-content">
        <div v-if="resumeStore.currentResume?.campus && resumeStore.currentResume.campus.length">
          <div v-for="campus in resumeStore.currentResume.campus" :key="campus.id" class="work-item">
            <div class="work-header">
              <div class="work-time">{{ formatDate(campus.startDate || '设置时间') }} - {{ formatDate(campus.endDate || '设置时间') }}</div>
              <div class="work-company">{{ campus.organization || '填写社团/组织名称' }}</div>
            </div>
            <div class="work-position">{{ campus.position || '填写职位名称' }}</div>
            <div class="work-description">{{ campus.description || '详细描述你在大学期间的社团活动、学生会工作、志愿者经历等，突出你的组织能力、团队协作能力和领导能力。' }}</div>
          </div>
        </div>
        <div v-else class="empty-section">
          <div class="work-item">
            <div class="work-header">
              <div class="work-time">设置时间</div>
              <div class="work-company">填写社团/组织名称</div>
            </div>
            <div class="work-position">填写职位名称</div>
            <div class="work-description">详细描述你在大学期间的社团活动、学生会工作、志愿者经历等，突出你的组织能力、团队协作能力和领导能力。</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 荣誉奖项 -->
    <div class="awards-section resume-section">
      <h3 class="section-title">
        <span class="section-icon">🏆</span>
        荣誉奖项
      </h3>
      <div class="section-content">
        <div v-if="resumeStore.currentResume?.honors && resumeStore.currentResume.honors.length">
          <div v-for="award in resumeStore.currentResume.honors" :key="award.id" class="award-item">
            <div class="award-header">
              <div class="award-time">{{ award.date || '设置时间' }}</div>
              <div class="award-name">{{ award.name || '填写奖项名称' }}</div>
            </div>
            <div class="award-description" v-if="award.description">{{ award.description }}</div>
          </div>
        </div>
        <div v-else class="empty-section">
          <div class="award-item">
            <div class="award-header">
              <div class="award-time">设置时间</div>
              <div class="award-name">填写奖项名称</div>
            </div>
            <div class="award-description">描述奖项的获得情况和意义</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 自我评价 -->
    <div v-if="moduleOrder.includes('selfEvaluation')" class="resume-section">
      <h3 class="section-title">
        <span class="section-icon">📝</span>
        自我评价
      </h3>
      <div class="section-content">
        <div class="self-evaluation" v-if="resumeStore.currentResume?.selfEvaluation?.content">
          {{ resumeStore.currentResume.selfEvaluation.content }}
        </div>
        <div class="self-evaluation" v-else>
          篇幅不要太长，注意结合简历整体的美观度，如果真的有很多话要说，建议以求职信的形式附上。自我评价应做到突出自身符合目标岗位要求的"卖点"，避免过多使用形容词，而应该通过数据及实例来对自身价值进行深化。
        </div>
        <div v-if="resumeStore.currentResume?.selfEvaluation?.keywords && resumeStore.currentResume.selfEvaluation.keywords.length" class="self-evaluation-keywords">
          <span v-for="keyword in resumeStore.currentResume.selfEvaluation.keywords" :key="keyword" class="keyword-tag">
            {{ keyword }}
          </span>
        </div>
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
/* 科技极客风模板样式 */
.resume-container {
  padding: 30px;
  background: #f5f5f5;
  min-height: 297mm;
}

.resume-title {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.personal-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #409eff;
}

.name-section {
  flex: 1;
}

.resume-name {
  font-size: 28px;
  font-weight: bold;
  margin: 0 0 10px 0;
  color: #333;
}

.resume-summary {
  font-size: 14px;
  color: #666;
  margin: 0 0 10px 0;
}

.contact-info {
  font-size: 12px;
  color: #999;
}

.avatar-section {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #409eff;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.resume-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
  display: flex;
  align-items: center;
}

.section-icon {
  margin-right: 8px;
}

.section-content {
  padding-left: 24px;
}

.job-intent {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.intent-item {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.intent-icon {
  margin-right: 8px;
}

.education-item {
  margin-bottom: 15px;
}

.education-header {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  margin-bottom: 5px;
}

.education-time {
  font-size: 12px;
  color: #999;
}

.education-school {
  font-size: 14px;
  color: #333;
}

.education-major {
  font-size: 13px;
  color: #666;
  margin-bottom: 5px;
}

.education-description {
  font-size: 12px;
  color: #999;
  line-height: 1.4;
}

.work-item {
  margin-bottom: 15px;
}

.work-header {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  margin-bottom: 5px;
}

.work-time {
  font-size: 12px;
  color: #999;
}

.work-company {
  font-size: 14px;
  color: #333;
}

.work-position {
  font-size: 13px;
  color: #666;
  margin-bottom: 5px;
}

.work-description {
  font-size: 12px;
  color: #999;
  line-height: 1.4;
}

.skills-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}

.add-skills {
  font-size: 12px;
  color: #409eff;
  cursor: pointer;
}

.self-evaluation {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
  border-left: 3px solid #409eff;
  padding-left: 10px;
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
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
}

.award-item {
  margin-bottom: 15px;
}

.award-header {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  margin-bottom: 5px;
}

.award-time {
  font-size: 12px;
  color: #999;
}

.award-name {
  font-size: 14px;
  color: #333;
}

.award-description {
  font-size: 12px;
  color: #999;
  line-height: 1.4;
}

.project-item {
  margin-bottom: 15px;
}

.project-header {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  margin-bottom: 5px;
}

.project-time {
  font-size: 12px;
  color: #999;
}

.project-name {
  font-size: 14px;
  color: #333;
}

.project-description {
  font-size: 12px;
  color: #999;
  line-height: 1.4;
  margin-bottom: 5px;
}

.project-technologies {
  margin-top: 5px;
  font-size: 10pt;
}

.tech-label {
  color: #7f8c8d;
  margin-right: 5px;
}

.tech-tag {
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 3px;
  margin-right: 5px;
  font-size: 9pt;
  color: #666;
}

.empty-section {
  color: #999;
  font-style: italic;
}
</style>