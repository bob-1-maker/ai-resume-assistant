import {
  parseResume,
  generateResume,
  optimizeResume,
  parseStructuredResume,
  buildWeatherProfile,
  buildFallbackWeatherProfile
} from '../services/ai/aiService.js';

const parseResumeHandler = async (req, res) => {
  try {
    const { text } = req.body || {};

    if (!text) {
      return res.status(400).json({ code: 400, data: null, msg: '缺少简历文本' });
    }

    const result = await parseResume(text);
    return res.status(200).json({
      code: 200,
      data: result.data,
      msg: result.msg
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      data: null,
      msg: `AI 解析简历失败: ${error.message}`
    });
  }
};

const generateResumeHandler = async (req, res) => {
  try {
    const { basicInfo, jobDescription } = req.body || {};

    if (!basicInfo) {
      return res.status(400).json({ code: 400, data: null, msg: '缺少基本信息' });
    }

    const result = await generateResume({ basicInfo, jobDescription });
    return res.status(200).json({
      code: 200,
      data: result.data,
      msg: result.msg
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      data: null,
      msg: `生成简历失败: ${error.message}`
    });
  }
};

const optimizeResumeHandler = async (req, res) => {
  try {
    const { resumeData, section, content } = req.body || {};

    if (!resumeData || !section || !content) {
      return res.status(400).json({ code: 400, data: null, msg: '缺少必要参数' });
    }

    const result = await optimizeResume({ resumeData, section, content });
    return res.status(200).json({
      code: 200,
      data: result.data,
      msg: result.msg
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      data: null,
      msg: `优化简历失败: ${error.message}`
    });
  }
};

const parseStructuredResumeHandler = async (req, res) => {
  try {
    const { resumeText } = req.body || {};

    if (!resumeText || typeof resumeText !== 'string') {
      return res.status(400).json({
        code: 400,
        data: null,
        msg: '缺少简历文本或格式不正确'
      });
    }

    if (resumeText.length < 10) {
      return res.status(400).json({
        code: 400,
        data: null,
        msg: '简历文本内容过少，无法解析'
      });
    }

    const result = await parseStructuredResume(resumeText);
    return res.status(200).json({
      code: 200,
      data: result.data,
      msg: result.msg
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      data: null,
      msg: `解析简历失败: ${error.message}`
    });
  }
};

const weatherProfileHandler = async (req, res) => {
  try {
    const payload = req.body || {};
    const requiredFields = ['city', 'weather', 'temp', 'wind', 'humidity', 'aqi', 'rainProb', 'userTags'];
    const hasMissingField = requiredFields.some((field) => typeof payload[field] === 'undefined' || payload[field] === null || payload[field] === '');

    if (hasMissingField || !Array.isArray(payload.userTags)) {
      return res.status(400).json({
        code: 400,
        data: buildFallbackWeatherProfile(payload),
        message: '请求参数不完整'
      });
    }

    const result = await buildWeatherProfile(payload);
    return res.status(200).json({
      code: 200,
      data: result.data,
      message: result.message
    });
  } catch (error) {
    return res.status(200).json({
      code: 200,
      data: buildFallbackWeatherProfile(req.body || {}),
      message: '获取个性化天气画像成功'
    });
  }
};

export {
  parseResumeHandler,
  generateResumeHandler,
  optimizeResumeHandler,
  parseStructuredResumeHandler,
  weatherProfileHandler
};
