const buildChatRequest = (messages, overrides = {}) => ({
  model: 'qwen/qwen2.5-7b-instruct',
  messages,
  temperature: 0.7,
  max_tokens: 1000,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
  ...overrides
});

const extractChatContent = (response) => {
  if (response?.choices?.length > 0) {
    return response.choices[0].message.content;
  }

  throw new Error('Invalid API response');
};

const getMockAIResponse = () => `# Resume Draft

## Profile
- Name: Zhang San
- Target Role: Frontend Engineer

## Skills
- Vue.js / React / TypeScript
- HTML / CSS / JavaScript

## Experience
- Built frontend pages and improved performance

## Projects
- Worked on admin and business platforms
`;

const buildGenerateMessages = ({ basicInfo, jobDescription }) => [
  {
    role: 'system',
    content: 'You are a professional resume writing assistant. Produce reference-quality resume draft content.'
  },
  {
    role: 'user',
    content: `Generate resume sample content for this target role: ${jobDescription || 'unknown'}. Basic info: ${JSON.stringify(basicInfo || {})}`
  }
];

const buildOptimizeMessages = ({ resumeData, section, content }) => [
  {
    role: 'system',
    content: 'You are a professional resume optimization assistant. Return stronger, concise, persuasive resume content.'
  },
  {
    role: 'user',
    content: `Optimize this resume section: ${section}\nCurrent content: ${content}\nContext: ${JSON.stringify(resumeData || {})}`
  }
];

const buildParseResumeMessages = (text) => [
  {
    role: 'system',
    content: 'You are a professional resume parsing assistant. Return strict JSON only.'
  },
  {
    role: 'user',
    content: `Extract structured resume data from this text and return JSON only:\n${text}`
  }
];

const buildStructuredParseMessages = (resumeText) => [
  {
    role: 'system',
    content: 'You are a professional resume parsing assistant. Return valid JSON only.'
  },
  {
    role: 'user',
    content: `Parse this resume text into strict JSON:\n${resumeText}`
  }
];

const buildWeatherProfileMessages = (payload) => [
  {
    role: 'system',
    content: 'You are a weather lifestyle assistant. Return JSON only.'
  },
  {
    role: 'user',
    content: `Generate a weather profile from this payload and return JSON only: ${JSON.stringify(payload)}`
  }
];

export {
  buildChatRequest,
  extractChatContent,
  getMockAIResponse,
  buildGenerateMessages,
  buildOptimizeMessages,
  buildParseResumeMessages,
  buildStructuredParseMessages,
  buildWeatherProfileMessages
};
