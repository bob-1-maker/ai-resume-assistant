const parseResumeFromText = (text) => {
  let name = '未填写';
  let phone = '未填写';
  let email = '未填写';
  let jobIntent = '未填写';
  let selfIntro = '未填写';

  const education = [];
  const projects = [];
  const skills = [];
  const workExperience = [];
  const campusExperience = [];
  const awards = [];

  const lines = String(text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const nameMatch = String(text || '').match(/^([\u4e00-\u9fa5]{2,4})/);
  if (nameMatch) {
    name = nameMatch[1];
  }

  const phoneMatch = String(text || '').match(/1[3-9]\d{9}/);
  if (phoneMatch) {
    phone = phoneMatch[0];
  }

  const emailMatch = String(text || '').match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    email = emailMatch[0];
  }

  const jobIntentMatch = String(text || '').match(/求职意向[：:\s]*(.*?)(?:\n|$)/);
  if (jobIntentMatch) {
    jobIntent = jobIntentMatch[1].trim();
  }

  const sectionTitles = {
    education: ['教育经历', '教育背景'],
    skills: ['专业技能', '技能', '技术栈'],
    projects: ['项目经验', '项目经历'],
    workExperience: ['工作经历', '工作经验', '实习经历'],
    campusExperience: ['在校经历', '校园经历'],
    awards: ['荣誉奖项', '获奖经历', '奖项荣誉'],
    selfIntro: ['自我评价', '个人简介', '自我介绍']
  };

  let currentSection = 'basic';
  const sections = {
    basic: [],
    education: [],
    skills: [],
    projects: [],
    workExperience: [],
    campusExperience: [],
    awards: [],
    selfIntro: []
  };

  lines.forEach((line) => {
    const matchedSection = Object.entries(sectionTitles).find(([, titles]) =>
      titles.some((title) => line.includes(title))
    );

    if (matchedSection) {
      currentSection = matchedSection[0];
      return;
    }

    sections[currentSection].push(line);
  });

  sections.education.forEach((line) => {
    education.push({ time: '', school: line, major: '', gpa: '', courses: '' });
  });
  sections.projects.forEach((line) => {
    projects.push({ time: '', name: line, role: '', desc: '', tech: '' });
  });
  sections.workExperience.forEach((line) => {
    workExperience.push({ time: '', company: line, role: '', desc: '' });
  });
  sections.campusExperience.forEach((line) => {
    campusExperience.push({ time: '', org: line, role: '', desc: '' });
  });
  sections.awards.forEach((line) => {
    awards.push({ time: '', name: line, desc: '' });
  });
  sections.skills
    .join(' ')
    .split(/[,，、/\s]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .forEach((item) => skills.push(item));

  if (sections.selfIntro.length > 0) {
    selfIntro = sections.selfIntro.join('\n');
  }

  return {
    name,
    phone,
    email,
    jobIntent,
    education,
    projects,
    skills,
    workExperience,
    campusExperience,
    awards,
    selfIntro
  };
};

const fallbackParse = (text) => {
  const result = {
    name: null,
    phone: null,
    email: null,
    position: null,
    location: null,
    summary: null,
    education: [],
    workExperience: [],
    projectExperience: [],
    skills: []
  };

  if (!text) {
    return result;
  }

  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);

  if (lines[0] && /^[\u4e00-\u9fa5]{2,4}$/.test(lines[0])) {
    result.name = lines[0];
  }

  const phoneMatch = text.match(/1[3-9]\d{9}/);
  if (phoneMatch) {
    result.phone = phoneMatch[0];
  }

  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    result.email = emailMatch[0];
  }

  const positionMatch = text.match(/(?:求职意向|期望职位|应聘职位)[：:\s]*([^\n]+)/);
  if (positionMatch) {
    result.position = positionMatch[1].trim();
  }

  const skillsMatch = text.match(/(?:技能|专业技能|技术栈)[：:\s]*([^\n]+)/);
  if (skillsMatch) {
    result.skills = skillsMatch[1]
      .split(/[,，、/\s]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return result;
};

const validateAndCompleteResult = (result) => {
  const validated = {
    name: null,
    phone: null,
    email: null,
    position: null,
    location: null,
    summary: null,
    education: [],
    workExperience: [],
    projectExperience: [],
    skills: [],
    ...result
  };

  if (!Array.isArray(validated.education)) validated.education = [];
  if (!Array.isArray(validated.workExperience)) validated.workExperience = [];
  if (!Array.isArray(validated.projectExperience)) validated.projectExperience = [];
  if (!Array.isArray(validated.skills)) validated.skills = [];

  return validated;
};

const completeMissingFields = (text, result) => {
  const completed = { ...result };

  if (!completed.phone) {
    const phoneMatch = text.match(/1[3-9]\d{9}/);
    if (phoneMatch) {
      completed.phone = phoneMatch[0];
    }
  }

  if (!completed.email) {
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      completed.email = emailMatch[0];
    }
  }

  if (!completed.name) {
    const nameMatch = text.match(/^([\u4e00-\u9fa5]{2,4})/m);
    if (nameMatch) {
      completed.name = nameMatch[1];
    }
  }

  return completed;
};

const buildFallbackWeatherProfile = (payload = {}) => {
  const city = payload.city || '当前城市';
  const weather = payload.weather || '天气平稳';

  return {
    coreImpact: `今天${city}的天气整体较平稳，日常出行压力不大。`,
    suggestions: ['按日常节奏安排出行并做好基础防护', '关注温度变化并灵活增减衣物'],
    summary: `今日${city}${weather}，按日常节奏安排出行即可`
  };
};

const safeParseAiJson = (content) => {
  if (!content || typeof content !== 'string') {
    return null;
  }

  try {
    return JSON.parse(content);
  } catch (error) {
    const start = content.indexOf('{');
    const end = content.lastIndexOf('}');

    if (start === -1 || end === -1 || end <= start) {
      return null;
    }

    try {
      return JSON.parse(content.slice(start, end + 1));
    } catch (parseError) {
      return null;
    }
  }
};

const normalizeWeatherProfile = (data, payload) => {
  const fallback = buildFallbackWeatherProfile(payload);

  return {
    coreImpact: typeof data?.coreImpact === 'string' && data.coreImpact.trim()
      ? data.coreImpact.trim()
      : fallback.coreImpact,
    suggestions: Array.isArray(data?.suggestions) && data.suggestions.length > 0
      ? data.suggestions.filter((item) => typeof item === 'string' && item.trim()).slice(0, 3)
      : fallback.suggestions,
    summary: typeof data?.summary === 'string' && data.summary.trim()
      ? data.summary.trim().slice(0, 50)
      : fallback.summary
  };
};

export {
  parseResumeFromText,
  fallbackParse,
  validateAndCompleteResult,
  completeMissingFields,
  buildFallbackWeatherProfile,
  safeParseAiJson,
  normalizeWeatherProfile
};
