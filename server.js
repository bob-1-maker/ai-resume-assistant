import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 硅基流动 API 配置
const AI_API_KEY = process.env.AI_API_KEY || '';
const AI_BASE_URL = process.env.AI_BASE_URL || 'https://api.siliconflow.cn/v1/chat/completions';

// 中间件
app.use(cors()); // 启用 CORS
app.use(express.json()); // 解析 JSON 请求体

// 健康检查接口
app.get('/api/health', (req, res) => {
  res.status(200).json({ code: 200, data: { status: 'ok' }, msg: 'AI 简历助手后端服务运行正常' });
});

// 过滤敏感信息
const filterSensitiveInfo = (data) => {
  if (!data) return data;
  
  const sensitiveFields = ['password', 'token', 'creditCard', 'ssn'];
  const filteredData = { ...data };
  
  sensitiveFields.forEach(field => {
    if (filteredData[field]) {
      filteredData[field] = '***';
    }
  });
  
  return filteredData;
};

// 带重试机制的请求函数
const requestWithRetry = async (url, options, retryCount = 2) => {
  try {
    const response = await axios({
      ...options,
      url,
      timeout: 3000, // 3秒超时
    });
    return response.data;
  } catch (error) {
    if (retryCount > 0) {
      console.log(`请求失败，正在重试... (剩余 ${retryCount} 次)`);
      return requestWithRetry(url, options, retryCount - 1);
    }
    throw error;
  }
};

// 构建硅基流动 API 请求
const buildSiliconFlowRequest = (messages) => {
  return {
    model: 'ep-20260317004521-jqxqx', // 使用硅基流动支持的模型
    messages: messages,
    temperature: 0.7,
    max_tokens: 1000,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0
  };
};

// 处理硅基流动 API 响应
const handleSiliconFlowResponse = (response) => {
  if (response.choices && response.choices.length > 0) {
    return response.choices[0].message.content;
  }
  throw new Error('Invalid API response');
};

// 模拟 AI 响应（当 API 调用失败时使用）
const getMockAIResponse = (prompt) => {
  return `# 简历生成结果\n\n根据您的需求，以下是生成的简历内容：\n\n## 个人信息\n- 姓名：张三\n- 求职岗位：前端工程师\n\n## 专业技能\n- 前端开发：HTML5、CSS3、JavaScript、Vue.js、React\n- 工具：Webpack、Git、VS Code\n- 其他：响应式设计、性能优化\n\n## 工作经历\n- 负责公司官网的前端开发和维护\n- 参与多个项目的前端架构设计\n- 优化前端性能，提升用户体验\n\n## 项目经验\n- 开发企业管理系统的前端界面\n- 构建响应式网站，适配各种设备\n- 集成第三方 API 和服务\n\n## 自我评价\n具有良好的团队合作精神，扎实的前端技术基础，能够快速学习新技术，解决复杂问题。`;
};

// AI 生成简历接口
app.post('/api/ai/generate', async (req, res) => {
  try {
    const { basicInfo, jobDescription } = req.body;
    
    // 验证请求参数
    if (!basicInfo) {
      return res.status(400).json({ code: 400, data: null, msg: '缺少基本信息' });
    }
    
    // 过滤敏感信息
    const filteredData = filterSensitiveInfo({ basicInfo, jobDescription });
    
    // 构建系统提示
    const systemPrompt = `你是一个专业的简历生成助手，根据用户提供的基本信息和职位描述，生成一份专业、详细的简历内容。`;
    
    // 构建用户提示
    const userPrompt = `请根据以下信息生成一份简历：\n\n基本信息：\n${JSON.stringify(filteredData.basicInfo, null, 2)}\n\n职位描述：\n${filteredData.jobDescription || '无'}\n\n请生成包括个人信息、教育背景、工作经历、项目经验、技能证书等完整的简历内容。`;
    
    // 构建请求消息
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];
    
    // 构建请求配置
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`
      },
      data: buildSiliconFlowRequest(messages)
    };
    
    try {
      // 调用硅基流动 API
      const aiResponse = await requestWithRetry(
        AI_BASE_URL,
        requestOptions
      );
      
      // 处理响应
      const generatedContent = handleSiliconFlowResponse(aiResponse);
      
      // 返回统一格式
      res.status(200).json({
        code: 200,
        data: { content: generatedContent },
        msg: '生成成功'
      });
    } catch (apiError) {
      console.error('API 调用失败，使用模拟响应:', apiError);
      // 使用模拟响应
      const mockContent = getMockAIResponse(userPrompt);
      res.status(200).json({
        code: 200,
        data: { content: mockContent },
        msg: '使用模拟数据生成成功'
      });
    }
  } catch (error) {
    console.error('生成简历失败:', error);
    // 使用模拟响应
    const mockContent = getMockAIResponse('前端工程师简历');
    res.status(200).json({
      code: 200,
      data: { content: mockContent },
      msg: '使用模拟数据生成成功'
    });
  }
});

// AI 优化简历接口
app.post('/api/ai/optimize', async (req, res) => {
  try {
    const { resumeData, section, content } = req.body;
    
    // 验证请求参数
    if (!resumeData || !section || !content) {
      return res.status(400).json({ code: 400, data: null, msg: '缺少必要参数' });
    }
    
    // 过滤敏感信息
    const filteredData = filterSensitiveInfo({ resumeData, section, content });
    
    // 构建系统提示
    const systemPrompt = `你是一个专业的简历优化助手，根据用户提供的简历数据和需要优化的部分，提供专业、简洁、有力的优化建议。`;
    
    // 构建用户提示
    const userPrompt = `请优化以下简历内容：\n\n简历部分：${filteredData.section}\n\n当前内容：\n${filteredData.content}\n\n简历上下文：\n${JSON.stringify(filteredData.resumeData, null, 2)}\n\n请提供优化后的内容，保持专业、简洁、有力，突出个人优势和成就。`;
    
    // 构建请求消息
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];
    
    // 构建请求配置
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`
      },
      data: buildSiliconFlowRequest(messages)
    };
    
    try {
      // 调用硅基流动 API
      const aiResponse = await requestWithRetry(
        AI_BASE_URL,
        requestOptions
      );
      
      // 处理响应
      const optimizedContent = handleSiliconFlowResponse(aiResponse);
      
      // 返回统一格式
      res.status(200).json({
        code: 200,
        data: { content: optimizedContent },
        msg: '优化成功'
      });
    } catch (apiError) {
      console.error('API 调用失败，使用模拟响应:', apiError);
      // 使用模拟响应
      const mockContent = `# 优化后的内容\n\n经过优化，您的简历内容更加专业和有力：\n\n${filteredData.content.replace(/。/g, '。\n\n').replace(/；/g, '；\n\n')}\n\n## 优化建议\n- 使用更具体的数字和成果来展示您的成就\n- 强调您的核心技能和专业知识\n- 保持简历内容简洁明了，突出重点\n- 使用行动动词开始每个工作描述\n- 确保简历格式一致，易于阅读`;
      res.status(200).json({
        code: 200,
        data: { content: mockContent },
        msg: '使用模拟数据优化成功'
      });
    }
  } catch (error) {
    console.error('优化简历失败:', error);
    // 使用模拟响应
    const mockContent = `# 优化后的内容\n\n经过优化，您的简历内容更加专业和有力：\n\n请提供详细的简历内容，我将为您提供专业的优化建议。\n\n## 优化建议\n- 使用更具体的数字和成果来展示您的成就\n- 强调您的核心技能和专业知识\n- 保持简历内容简洁明了，突出重点\n- 使用行动动词开始每个工作描述\n- 确保简历格式一致，易于阅读`;
    res.status(200).json({
      code: 200,
      data: { content: mockContent },
      msg: '使用模拟数据优化成功'
    });
  }
});

// 模板管理接口
app.get('/api/templates', (req, res) => {
  try {
    // 读取模板数据文件
    const templatesPath = path.join(__dirname, 'data', 'templates.json');
    
    // 检查文件是否存在
    if (!fs.existsSync(templatesPath)) {
      return res.status(500).json({
        code: 500,
        data: null,
        msg: '模板数据文件不存在'
      });
    }
    
    // 读取并解析 JSON 文件
    const templatesData = JSON.parse(fs.readFileSync(templatesPath, 'utf8'));
    
    // 提取模板列表
    const templates = templatesData.templates || [];
    
    // 返回统一格式
    res.status(200).json({
      code: 200,
      data: templates,
      msg: '获取模板列表成功'
    });
  } catch (error) {
    console.error('获取模板列表失败:', error);
    res.status(500).json({
      code: 500,
      data: null,
      msg: '获取模板列表失败，请稍后重试'
    });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`健康检查: http://localhost:${PORT}/api/health`);
  console.log(`AI 生成接口: POST http://localhost:${PORT}/api/ai/generate`);
  console.log(`AI 优化接口: POST http://localhost:${PORT}/api/ai/optimize`);
  console.log(`模板列表接口: GET http://localhost:${PORT}/api/templates`);
  console.log(`硅基流动 API 地址: ${AI_BASE_URL}`);
});