<template>
  <div class="resume-container">
    <div class="resume-layout">
      <!-- 侧边栏 -->
      <div class="resume-sidebar">
        <!-- 头像 -->
        <div class="avatar-section">
          <div class="avatar">
            <img :src="resumeData.avatar" alt="头像" />
          </div>
        </div>

        <!-- 个人信息 -->
        <div class="sidebar-section">
          <h3 class="sidebar-title">个人信息</h3>
          <div class="sidebar-content">
            <div class="contact-item">
              <span class="contact-icon">📧</span>
              <span>{{ resumeData.contact.email }}</span>
            </div>
            <div class="contact-item">
              <span class="contact-icon">📱</span>
              <span>{{ resumeData.contact.phone }}</span>
            </div>
            <div class="contact-item">
              <span class="contact-icon">📍</span>
              <span>{{ resumeData.contact.location }}</span>
            </div>
            <div v-if="resumeData.contact.github" class="contact-item">
              <span class="contact-icon">🔗</span>
              <span>{{ resumeData.contact.github }}</span>
            </div>
          </div>
        </div>

        <!-- 个人简介 -->
        <div class="sidebar-section">
          <h3 class="sidebar-title">个人简介</h3>
          <div class="sidebar-content">
            <div class="summary-text">
              {{ resumeData.summary }}
            </div>
          </div>
        </div>

        <!-- 技能特长 -->
        <div class="sidebar-section">
          <h3 class="sidebar-title">技能特长</h3>
          <div class="sidebar-content">
            <div class="skills-container">
              <span v-for="(skill, index) in resumeData.skills" :key="index" class="skill-item">
                {{ skill }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 主内容区 -->
      <div class="resume-main">
        <!-- 顶部信息 -->
        <div class="resume-header">
          <h1 class="resume-name">{{ resumeData.name }}</h1>
          <h2 class="resume-position">{{ resumeData.position }}</h2>
        </div>

        <!-- 求职意向 -->
        <div class="main-section">
          <h3 class="section-title">
            <span class="section-icon">🎯</span>
            求职意向
          </h3>
          <div class="section-content">
            <p>{{ resumeData.objective }}</p>
          </div>
        </div>

        <!-- 教育背景 -->
        <div class="main-section">
          <h3 class="section-title">
            <span class="section-icon">🎓</span>
            教育背景
          </h3>
          <div class="section-content">
            <div v-for="(edu, index) in resumeData.education" :key="index" class="education-item">
              <div class="item-header">
                <div class="item-title">{{ edu.school }}</div>
                <div class="item-period">{{ edu.period }}</div>
              </div>
              <div class="item-meta">{{ edu.major }} {{ edu.degree }}</div>
            </div>
          </div>
        </div>

        <!-- 工作经历 -->
        <div class="main-section">
          <h3 class="section-title">
            <span class="section-icon">💼</span>
            工作经历
          </h3>
          <div class="section-content">
            <div v-for="(exp, index) in resumeData.experience" :key="index" class="experience-item">
              <div class="item-header">
                <div class="item-title">{{ exp.title }}</div>
                <div class="item-period">{{ exp.period }}</div>
              </div>
              <div class="item-company">{{ exp.company }}</div>
              <div class="item-description">
                <ul class="description-list">
                  <li v-for="(desc, descIndex) in exp.description" :key="descIndex">
                    {{ desc }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- 项目经验 -->
        <div class="main-section">
          <h3 class="section-title">
            <span class="section-icon">📁</span>
            项目经验
          </h3>
          <div class="section-content">
            <div v-for="(project, index) in resumeData.projects" :key="index" class="project-item">
              <div class="item-header">
                <div class="item-title">{{ project.name }}</div>
                <div class="item-period">{{ project.period }}</div>
              </div>
              <div class="item-role">{{ project.role }}</div>
              <div class="item-description">
                <ul class="description-list">
                  <li v-for="(desc, descIndex) in project.description" :key="descIndex">
                    {{ desc }}
                  </li>
                </ul>
              </div>
              <div class="item-technologies">
                <span class="tech-label">技术栈：</span>
                <span v-for="(tech, techIndex) in project.technologies" :key="techIndex" class="tech-tag">
                  {{ tech }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 获奖情况 -->
        <div class="main-section">
          <h3 class="section-title">
            <span class="section-icon">🏆</span>
            获奖情况
          </h3>
          <div class="section-content">
            <div v-for="(award, index) in resumeData.awards" :key="index" class="award-item">
              <div class="item-header">
                <div class="item-title">{{ award.title }}</div>
                <div class="item-period">{{ award.period }}</div>
              </div>
              <div class="item-meta">{{ award.issuer }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 简历数据
const resumeData = ref({
  name: '张三',
  position: '前端开发工程师',
  avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20avatar%20portrait%20of%20a%20young%20Chinese%20man%2C%20clean%20background%2C%20business%20style&image_size=square',
  objective: '寻求前端开发工程师职位，希望在大型互联网公司或科技企业工作，发挥自己的技术优势，为公司产品的用户体验做出贡献。',
  summary: '具有5年前端开发经验，熟悉现代前端技术栈，包括Vue、React、TypeScript等。擅长响应式设计和性能优化，有丰富的项目开发和团队协作经验。',
  contact: {
    email: 'example@email.com',
    phone: '138-0013-8000',
    location: '北京市',
    github: 'github.com/example'
  },
  education: [
    {
      school: '北京大学',
      major: '计算机科学与技术',
      degree: '本科',
      period: '2014.09 - 2018.06'
    }
  ],
  skills: ['Vue.js', 'React', 'TypeScript', 'HTML5', 'CSS3', 'JavaScript', 'Webpack', 'Git', 'Node.js', '响应式设计', '性能优化', '用户体验设计'],
  experience: [
    {
      title: '前端开发工程师',
      company: '某某科技有限公司',
      period: '2020.03 - 至今',
      description: [
        '负责公司核心产品的前端开发，使用Vue3 + TypeScript技术栈',
        '参与产品需求分析和技术方案设计，优化用户体验',
        '实现响应式布局，确保在不同设备上的良好显示效果',
        '优化前端性能，提高页面加载速度和交互流畅度',
        '与后端团队协作，完成API对接和数据交互'
      ]
    },
    {
      title: '初级前端开发工程师',
      company: '某某互联网公司',
      period: '2018.07 - 2020.02',
      description: [
        '参与公司官网和内部系统的前端开发',
        '使用HTML5、CSS3和JavaScript实现页面功能',
        '学习并应用React框架进行开发',
        '协助团队完成项目上线和维护工作'
      ]
    }
  ],
  projects: [
    {
      name: '企业管理系统',
      period: '2021.05 - 2021.12',
      role: '前端负责人',
      description: [
        '负责系统前端架构设计和技术选型',
        '使用Vue3 + Element Plus实现界面开发',
        '实现权限管理、数据可视化等核心功能',
        '优化系统性能，提高用户体验'
      ],
      technologies: ['Vue3', 'TypeScript', 'Element Plus', 'ECharts', 'Vuex']
    },
    {
      name: '电商网站重构',
      period: '2020.06 - 2020.11',
      role: '前端开发',
      description: [
        '参与网站前端重构，提高页面加载速度',
        '实现响应式布局，适配不同设备',
        '优化购物流程，提高用户转化率',
        '与设计团队协作，实现UI设计稿'
      ],
      technologies: ['React', 'Redux', 'Ant Design', 'Webpack']
    }
  ],
  awards: [
    {
      title: '优秀员工奖',
      issuer: '某某科技有限公司',
      period: '2021年'
    },
    {
      title: '前端技术竞赛三等奖',
      issuer: '行业协会',
      period: '2020年'
    }
  ]
});
</script>

<style scoped>
/* 简历容器 */
.resume-container {
  width: 210mm;
  min-height: 297mm;
  padding: 20mm;
  font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: #333;
  background: white;
  position: relative;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border-radius: 8px;
}

/* 主布局 - 左右分栏 */
.resume-layout {
  display: flex;
  gap: 30px;
  height: 100%;
}

/* 侧边栏 - 35% 宽度 */
.resume-sidebar {
  width: 35%;
  background: #2c3e50;
  color: white;
  padding: 30px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 主内容区 - 65% 宽度 */
.resume-main {
  width: 65%;
}

/* 头像部分 */
.avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid rgba(255, 255, 255, 0.2);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 顶部信息 */
.resume-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.resume-name {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 10px;
  letter-spacing: 0.5px;
}

.resume-position {
  font-size: 14px;
  color: #3498db;
  margin-bottom: 15px;
  letter-spacing: 0.5px;
}

.resume-contact {
  font-size: 11px;
  color: #777;
  line-height: 1.6;
  letter-spacing: 0.5px;
}

.contact-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.contact-icon {
  margin-right: 8px;
  color: #3498db;
}

/* 侧边栏个人信息 */
.sidebar-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-section:last-child {
  border-bottom: none;
}

.sidebar-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  letter-spacing: 0.5px;
}

.sidebar-content {
  font-size: 11px;
  line-height: 1.6;
  letter-spacing: 0.5px;
}

/* 个人简介 */
.summary-text {
  line-height: 1.6;
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 8px;
}

/* 教育经历 */
.education-item {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.education-item:last-child {
  border-bottom: none;
}

.item-title {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 5px;
}

.item-meta {
  font-size: 11px;
  opacity: 0.8;
  margin-bottom: 3px;
  color: #777;
}

.item-period {
  font-size: 10px;
  opacity: 0.7;
  margin-top: 3px;
  color: #999;
}

/* 技能部分 */
.skills-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.skill-item {
  font-size: 10px;
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  letter-spacing: 0.5px;
}

/* 主内容区部分 */
.main-section {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  border-left: 4px solid #3498db;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e0e0e0;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
}

.section-icon {
  margin-right: 10px;
  font-size: 18px;
  color: #3498db;
}

.section-content {
  font-size: 11px;
  line-height: 1.6;
  color: #555;
  letter-spacing: 0.5px;
}

/* 工作经历 */
.experience-item {
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.experience-item:last-child {
  border-bottom: none;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.item-company {
  font-size: 12px;
  color: #777;
  margin-bottom: 8px;
}

.item-description {
  margin-top: 10px;
  line-height: 1.6;
}

.description-list {
  list-style-type: disc;
  padding-left: 20px;
  color: #555;
}

.description-list li {
  margin-bottom: 5px;
}

/* 项目经验 */
.project-item {
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.project-item:last-child {
  border-bottom: none;
}

.item-role {
  font-size: 12px;
  color: #777;
  margin-bottom: 8px;
  font-style: italic;
}

/* 技术栈 */
.item-technologies {
  margin-top: 12px;
  font-size: 10px;
  background: rgba(52, 152, 219, 0.1);
  padding: 10px;
  border-radius: 8px;
}

.tech-label {
  color: #2c3e50;
  font-weight: 600;
  margin-right: 8px;
}

.tech-tag {
  background: #3498db;
  color: white;
  padding: 3px 8px;
  border-radius: 12px;
  margin-right: 6px;
  font-size: 9px;
  letter-spacing: 0.5px;
}

/* 获奖情况 */
.award-item {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.award-item:last-child {
  border-bottom: none;
}

/* 响应式调整 */
@media print {
  .resume-container {
    width: 100%;
    height: 100%;
    padding: 20mm;
    box-shadow: none;
    border-radius: 0;
  }
  
  .resume-sidebar {
    box-shadow: none;
  }
  
  .main-section {
    box-shadow: none;
    background: white;
    border: 1px solid #e0e0e0;
  }
}
</style>
