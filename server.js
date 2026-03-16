const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// AI API 配置
const AI_API_KEY = process.env.AI_API_KEY || '';
const AI_API_URL = process.env.AI_API_URL || '';

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
    
    // 构建请求参数
    const requestData = {
      basicInfo: filteredData.basicInfo,
      jobDescription: filteredData.jobDescription
    };
    
    // 构建请求配置
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`
      },
      data: requestData
    };
    
    // 调用 AI 官方生成接口
    const aiResponse = await requestWithRetry(
      `${AI_API_URL}/generate`,
      requestOptions
    );
    
    // 返回统一格式
    res.status(200).json({
      code: 200,
      data: aiResponse,
      msg: '生成成功'
    });
  } catch (error) {
    console.error('生成简历失败:', error);
    res.status(500).json({
      code: 500,
      data: null,
      msg: '生成简历失败，请稍后重试'
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
    
    // 构建请求参数
    const requestData = {
      resumeData: filteredData.resumeData,
      section: filteredData.section,
      content: filteredData.content
    };
    
    // 构建请求配置
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`
      },
      data: requestData
    };
    
    // 调用 AI 官方优化接口
    const aiResponse = await requestWithRetry(
      `${AI_API_URL}/optimize`,
      requestOptions
    );
    
    // 返回统一格式
    res.status(200).json({
      code: 200,
      data: aiResponse,
      msg: '优化成功'
    });
  } catch (error) {
    console.error('优化简历失败:', error);
    res.status(500).json({
      code: 500,
      data: null,
      msg: '优化简历失败，请稍后重试'
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
});