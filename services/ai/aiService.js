import {
  generateCacheKey,
  getFromCache,
  setToCache
} from '../cache/cacheService.js';
import { requestWithRetry } from '../http/requestWithRetry.js';
import {
  buildChatRequest,
  extractChatContent,
  getMockAIResponse,
  buildGenerateMessages,
  buildOptimizeMessages,
  buildParseResumeMessages,
  buildStructuredParseMessages,
  buildWeatherProfileMessages
} from './promptBuilders.js';
import {
  parseResumeFromText,
  fallbackParse,
  validateAndCompleteResult,
  completeMissingFields,
  buildFallbackWeatherProfile,
  safeParseAiJson,
  normalizeWeatherProfile
} from './parsers.js';

const getAiConfig = () => ({
  apiKey: process.env.AI_API_KEY || '',
  baseUrl: process.env.AI_BASE_URL || 'https://api.siliconflow.cn/v1/chat/completions'
});

const getWeatherConfig = () => ({
  apiKey: process.env.DOUBAN_API_KEY || '99c12489-90e1-4053-9271-115c742bce2b',
  baseUrl: process.env.DOUBAN_API_URL || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
  model: process.env.DOUBAN_MODEL || 'Doubao-Seed-2.0-mini'
});

const postChat = async (messages, overrides = {}) => {
  const { apiKey, baseUrl } = getAiConfig();
  const response = await requestWithRetry(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    data: buildChatRequest(messages, overrides)
  });

  return extractChatContent(response);
};

const generateResume = async ({ basicInfo, jobDescription }) => {
  const cacheKey = generateCacheKey('generate', { basicInfo, jobDescription });
  const cachedResult = await getFromCache(cacheKey);

  if (cachedResult) {
    return {
      data: cachedResult,
      msg: '从缓存获取生成结果成功'
    };
  }

  const messages = buildGenerateMessages({ basicInfo, jobDescription });

  try {
    if (!getAiConfig().apiKey) {
      const result = { content: getMockAIResponse() };
      await setToCache(cacheKey, result);
      return {
        data: result,
        msg: '使用模拟数据生成成功'
      };
    }

    const content = await postChat(messages);
    const result = { content };
    await setToCache(cacheKey, result);

    return {
      data: result,
      msg: '生成成功'
    };
  } catch (error) {
    const result = { content: getMockAIResponse() };
    await setToCache(cacheKey, result);

    return {
      data: result,
      msg: '使用模拟数据生成成功'
    };
  }
};

const optimizeResume = async ({ resumeData, section, content }) => {
  const cacheKey = generateCacheKey('optimize', { resumeData, section, content });
  const cachedResult = await getFromCache(cacheKey);

  if (cachedResult) {
    return {
      data: cachedResult,
      msg: '从缓存获取优化结果成功'
    };
  }

  const messages = buildOptimizeMessages({ resumeData, section, content });

  try {
    if (!getAiConfig().apiKey) {
      const result = {
        content: `# 优化后的内容\n\n${content}\n\n## 优化建议\n- 使用更具体的结果描述\n- 强调核心技能与成果`
      };
      await setToCache(cacheKey, result);
      return {
        data: result,
        msg: '使用模拟数据优化成功'
      };
    }

    const optimizedContent = await postChat(messages);
    const result = { content: optimizedContent };
    await setToCache(cacheKey, result);

    return {
      data: result,
      msg: '优化成功'
    };
  } catch (error) {
    const result = {
      content: `# 优化后的内容\n\n${content}\n\n## 优化建议\n- 使用更具体的结果描述\n- 强调核心技能与成果`
    };
    await setToCache(cacheKey, result);
    return {
      data: result,
      msg: '使用模拟数据优化成功'
    };
  }
};

const parseResume = async (text) => {
  const cacheKey = generateCacheKey('parse-resume', { text });

  try {
    if (!getAiConfig().apiKey) {
      const result = parseResumeFromText(text);
      await setToCache(cacheKey, result);
      return {
        data: result,
        msg: '使用增强解析成功'
      };
    }

    const messages = buildParseResumeMessages(text);
    const content = await postChat(messages);

    let result = null;

    try {
      result = JSON.parse(content);
    } catch (error) {
      result = safeParseAiJson(content) || parseResumeFromText(text);
    }

    await setToCache(cacheKey, result);

    return {
      data: result,
      msg: '解析成功'
    };
  } catch (error) {
    const result = parseResumeFromText(text);
    await setToCache(cacheKey, result);
    return {
      data: result,
      msg: '使用增强模拟数据解析成功'
    };
  }
};

const parseStructuredResume = async (resumeText) => {
  const cacheKey = generateCacheKey('parse', { text: resumeText.substring(0, 500) });
  const cachedResult = await getFromCache(cacheKey);

  if (cachedResult) {
    return {
      data: cachedResult,
      msg: '从缓存获取解析结果成功'
    };
  }

  let parsedResult = null;

  try {
    if (!getAiConfig().apiKey) {
      parsedResult = fallbackParse(resumeText);
    } else {
      const messages = buildStructuredParseMessages(resumeText);
      const responseContent = await postChat(messages, {
        max_tokens: 1500,
        temperature: 0.1,
        timeout: 20000
      });
      const jsonContent = responseContent.match(/```(?:json)?\s*([\s\S]*?)```/)?.[1]?.trim() || responseContent;
      parsedResult = JSON.parse(jsonContent);
    }
  } catch (error) {
    parsedResult = fallbackParse(resumeText);
    parsedResult._parseWarning = 'AI 调用失败，已使用降级解析';
  }

  parsedResult = validateAndCompleteResult(parsedResult);
  parsedResult = completeMissingFields(resumeText, parsedResult);
  await setToCache(cacheKey, parsedResult);

  return {
    data: parsedResult,
    msg: parsedResult._parseWarning || '解析成功'
  };
};

const buildWeatherProfile = async (payload) => {
  const { apiKey, baseUrl, model } = getWeatherConfig();
  const messages = buildWeatherProfileMessages(payload);

  try {
    const response = await requestWithRetry(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      data: {
        model,
        messages,
        temperature: 0.7
      },
      timeout: 15000
    });

    const content = response?.choices?.[0]?.message?.content || '';
    const parsed = safeParseAiJson(content);
    const result = normalizeWeatherProfile(parsed, payload);

    return {
      data: result,
      message: '获取个性化天气画像成功'
    };
  } catch (error) {
    return {
      data: buildFallbackWeatherProfile(payload),
      message: '获取个性化天气画像成功'
    };
  }
};

export {
  parseResume,
  generateResume,
  optimizeResume,
  parseStructuredResume,
  buildWeatherProfile,
  buildFallbackWeatherProfile
};
