import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { createClient } from "redis";
import compression from "compression";
import rateLimit from "express-rate-limit";

// 加载环境变量
dotenv.config();

// Redis 配置
const REDIS_ENABLED = process.env.REDIS_ENABLED === "true";
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// Redis 客户端配置
let redisClient = null;

if (REDIS_ENABLED) {
  redisClient = createClient({
    url: REDIS_URL,
  });

  // 连接 Redis
  redisClient.connect().catch((err) => {
    console.error("Redis 连接失败:", err);
    console.log("将降级为直接调用 AI API");
  });
} else {
  console.log("Redis 已禁用，将直接调用 AI API");
}

// 缓存过期时间（3600秒）
const CACHE_EXPIRY = 3600;

const app = express();
const PORT = process.env.PORT || 3001;

// 字节火山方舟 API 配置
const AI_API_KEY = process.env.AI_API_KEY || "";
const AI_BASE_URL =
  process.env.AI_BASE_URL ||
  "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
const AI_MODEL = process.env.AI_MODEL || "doubao-seed-2-0-mini-260215";

// 中间件
// 启用响应压缩
app.use(
  compression({
    level: 6, // 压缩级别 (0-9)
    threshold: 1024, // 最小压缩大小 (1KB)
    filter: (req, res) => {
      // 只压缩 JSON 和文本响应
      if (res.getHeader("Content-Type")) {
        return /json|text|javascript|css/.test(res.getHeader("Content-Type"));
      }
      return true;
    },
  }),
);

// 配置 CORS，设置预检请求缓存
app.use(
  cors({
    origin: "*", // 在生产环境中应该设置具体的域名
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 3600, // 预检请求缓存 1 小时
    credentials: true,
  }),
);

// 解析 JSON 请求体（增加大小限制为 10MB）
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 限流配置
const aiRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 分钟
  max: 60, // 最多 60 次请求
  message: {
    code: 429,
    msg: "请求过于频繁，请 10 分钟后再试",
    data: null,
  },
  standardHeaders: true,
  legacyHeaders: false,
  // 只对 AI 接口限流
  skip: (req) => {
    return !req.path.includes("/api/ai/");
  },
});

// 应用限流中间件
app.use("/api/ai/", aiRateLimit);

// 导入数据库配置和路由
import { testConnection } from "./config/turso.js";
import resumeRoutes from "./routes/resume.js";
import userRoutes from "./routes/user.js";
import { verifyToken } from "./middleware/auth.js";

// 测试数据库连接
testConnection();

// 运行数据库迁移
import { runMigrations } from "./config/migrations.js";
runMigrations();

// 健康检查接口
app.get("/api/health", (req, res) => {
  res.status(200).json({
    code: 200,
    data: { status: "ok" },
    msg: "AI 简历助手后端服务运行正常",
  });
});

// 用户相关路由
app.use("/api/users", userRoutes);

// 简历相关路由（需要认证的接口）
app.use("/api/resumes", verifyToken, resumeRoutes);

// 过滤敏感信息
const filterSensitiveInfo = (data) => {
  if (!data) return data;

  const sensitiveFields = ["password", "token", "creditCard", "ssn"];
  const filteredData = { ...data };

  sensitiveFields.forEach((field) => {
    if (filteredData[field]) {
      filteredData[field] = "***";
    }
  });

  return filteredData;
};

// 生成缓存键
const generateCacheKey = (prefix, data) => {
  const filteredData = filterSensitiveInfo(data);
  return `${prefix}:${JSON.stringify(filteredData)}`;
};

// 从缓存获取数据
const getFromCache = async (key) => {
  // 如果 Redis 未启用或客户端未连接，跳过缓存
  if (!REDIS_ENABLED || !redisClient || !redisClient.isReady) {
    return null;
  }

  try {
    const cachedData = await redisClient.get(key);
    return cachedData ? JSON.parse(cachedData) : null;
  } catch (error) {
    console.error("从缓存获取数据失败:", error);
    return null;
  }
};

// 写入缓存
const setToCache = async (key, data) => {
  // 如果 Redis 未启用或客户端未连接，跳过缓存
  if (!REDIS_ENABLED || !redisClient || !redisClient.isReady) {
    return;
  }

  try {
    await redisClient.set(key, JSON.stringify(data), {
      EX: CACHE_EXPIRY,
    });
  } catch (error) {
    console.error("写入缓存失败:", error);
  }
};

// 带重试机制的请求函数
const requestWithRetry = async (url, options, retryCount = 1) => {
  try {
    const controller = new AbortController();
    const timeoutMs = 55000; // 55秒超时，兼容前端60秒默认超时
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await axios({
      ...options,
      url,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.data;
  } catch (error) {
    if (retryCount > 0) {
      console.log(`请求失败，正在重试... (剩余 ${retryCount} 次)`);
      return requestWithRetry(url, options, retryCount - 1);
    }
    throw error;
  }
};

// 构建字节火山方舟 API 请求
const buildByteArkRequest = (messages, temperature = 0.7, maxTokens = 1000) => {
  return {
    model: AI_MODEL,
    messages: messages,
    temperature: temperature,
    max_tokens: maxTokens,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stream: false, // 强制关闭流式输出，提升响应速度
  };
};

// 处理字节火山方舟 API 响应
const handleByteArkResponse = (response) => {
  if (response.choices && response.choices.length > 0) {
    return response.choices[0].message.content;
  }
  throw new Error("Invalid API response");
};

// AI 解析简历接口
app.post("/api/ai/parse-resume", async (req, res) => {
  try {
    const { text } = req.body;

    // 验证请求参数
    if (!text) {
      return res
        .status(400)
        .json({ code: 400, data: null, msg: "缺少简历文本" });
    }

    // 验证 API Key 是否配置
    if (!AI_API_KEY) {
      console.error("API Key 未配置");
      return res.status(500).json({
        code: 500,
        data: null,
        msg: "API Key 未配置，请在 .env 文件中设置 AI_API_KEY",
      });
    }

    // 生成缓存键
    const cacheKey = generateCacheKey("parse-resume", { text });

    // 尝试从缓存获取数据
    const cachedResult = await getFromCache(cacheKey);
    if (cachedResult) {
      console.log("从缓存获取解析结果");
      return res.status(200).json({
        code: 200,
        data: cachedResult,
        msg: "从缓存获取解析结果成功",
      });
    }

    // 构建系统提示
    const systemPrompt = `你是专业的简历解析助手，请从以下完整简历文本中，提取预览页需要的结构化信息，严格输出 JSON 格式，不要额外说明。
找不到的字段请留空字符串，不要编造内容。`;

    // 构建用户提示
    const userPrompt = `你是专业的简历解析助手，请从以下完整简历文本中，提取预览页需要的结构化信息，严格输出 JSON 格式，不要额外说明。
找不到的字段请留空字符串，不要编造内容。
简历文本：
${text}

输出格式：
{
  "name": "姓名",
  "phone": "手机号",
  "email": "邮箱",
  "jobIntent": "求职意向",
  "selfIntro": "个人简介",
  "education": [{"time": "时间段", "school": "学校", "major": "专业", "gpa": "绩点/排名", "courses": "核心课程"}],
  "projects": [{"time": "时间段", "name": "项目名", "role": "角色", "desc": "描述", "tech": "技术栈"}],
  "skills": ["技能1", "技能2"],
  "campusExperience": [{"time": "时间段", "org": "组织", "role": "角色", "desc": "描述"}],
  "awards": [{"time": "时间段", "name": "奖项名", "desc": "描述"}],
  "workExperience": [{"time": "时间段", "company": "公司", "role": "角色", "desc": "描述"}]
}`;

    // 构建请求消息
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    // 构建请求配置
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      data: buildByteArkRequest(messages, 0.1, 1500), // temperature: 0.1 保证JSON格式稳定
    };

    // 调用字节火山方舟 API
    console.log("调用字节火山方舟 API 进行简历解析");
    const aiResponse = await requestWithRetry(AI_BASE_URL, requestOptions);

    // 处理响应
    const generatedContent = handleByteArkResponse(aiResponse);
    console.log("AI 原始响应:", generatedContent);

    // 尝试多种方式提取和解析 JSON
    let result = null;

    // 尝试1: 完整匹配 JSON
    try {
      const jsonMatch = generatedContent.match(/^\{[\s\S]*\}$/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.log("完整匹配 JSON 失败:", e.message);
    }

    // 尝试2: 提取第一个{和最后一个}之间的内容
    if (!result) {
      try {
        const startIdx = generatedContent.indexOf("{");
        const endIdx = generatedContent.lastIndexOf("}");
        if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
          const jsonStr = generatedContent.substring(startIdx, endIdx + 1);
          console.log("尝试提取的 JSON:", jsonStr);
          result = JSON.parse(jsonStr);
        }
      } catch (e) {
        console.log("提取 JSON 片段失败:", e.message);
      }
    }

    // 尝试3: 使用 JSON5 风格的解析（更宽松）
    if (!result) {
      try {
        // 尝试修复常见的 JSON 格式问题
        let jsonStr = generatedContent;
        // 移除末尾的逗号
        jsonStr = jsonStr.replace(/,\s*([}\]])/g, "$1");
        // 尝试解析
        result = JSON.parse(jsonStr);
      } catch (e) {
        console.log("宽松解析 JSON 失败:", e.message);
      }
    }

    // 如果成功解析 JSON
    if (result) {
      // 缓存结果
      await setToCache(cacheKey, result);

      // 返回统一格式
      res.status(200).json({
        code: 200,
        data: result,
        msg: "解析成功",
      });
      return;
    }

    // 如果所有尝试都失败，返回错误
    console.error("JSON 解析失败，无法提取有效的结构化数据");
    res.status(500).json({
      code: 500,
      data: null,
      msg: "AI 返回格式错误，无法解析结果",
    });
  } catch (error) {
    console.error("AI 解析简历失败:", error);
    res.status(500).json({
      code: 500,
      data: null,
      msg: "AI 解析简历失败: " + error.message,
    });
  }
});

// AI 生成简历接口
app.post("/api/ai/generate", async (req, res) => {
  try {
    const { basicInfo, jobDescription } = req.body;

    // 验证请求参数
    if (!basicInfo) {
      return res
        .status(400)
        .json({ code: 400, data: null, msg: "缺少基本信息" });
    }

    // 验证 API Key 是否配置
    if (!AI_API_KEY) {
      console.error("API Key 未配置");
      return res.status(500).json({
        code: 500,
        data: null,
        msg: "API Key 未配置，请在 .env 文件中设置 AI_API_KEY",
      });
    }

    // 生成缓存键
    const cacheKey = generateCacheKey("generate", {
      basicInfo,
      jobDescription,
    });

    // 尝试从缓存获取数据
    const cachedResult = await getFromCache(cacheKey);
    if (cachedResult) {
      console.log("从缓存获取生成结果");
      return res.status(200).json({
        code: 200,
        data: cachedResult,
        msg: "从缓存获取生成结果成功",
      });
    }

    // 过滤敏感信息
    const filteredData = filterSensitiveInfo({ basicInfo, jobDescription });

    // 构建系统提示
    const systemPrompt = `你是专业简历生成助手，根据求职岗位和用户信息，生成专业、精简、有竞争力的简历内容，严格匹配前端开发岗位要求。`;

    // 构建用户提示
    const userPrompt = `请为以下求职岗位生成简历各个模块的示例内容：\n\n求职岗位：${filteredData.jobDescription || "无"}\n\n请生成以下模块的示例内容（每个模块提供2-3个示例）：\n1. 工作经历（描述该岗位的典型工作内容和职责）\n2. 项目经验（描述该岗位的典型项目类型和成果）\n3. 技能证书（列出该岗位常用的技能和证书）\n\n注意：\n- 生成的内容应该简洁、专业\n- 每个示例应该具体且实用\n- 不要生成具体的个人信息（姓名、电话等），只生成示例内容\n- 使用清晰的格式，方便用户参考和修改`;

    // 构建请求消息
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    // 构建请求配置
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      data: buildByteArkRequest(messages),
    };

    // 调用字节火山方舟 API
    const aiResponse = await requestWithRetry(AI_BASE_URL, requestOptions);

    // 处理响应
    const generatedContent = handleByteArkResponse(aiResponse);
    const result = { content: generatedContent };

    // 缓存结果
    await setToCache(cacheKey, result);

    // 返回统一格式
    res.status(200).json({
      code: 200,
      data: result,
      msg: "生成成功",
    });
  } catch (error) {
    console.error("生成简历失败:", error);
    res.status(500).json({
      code: 500,
      data: null,
      msg: "生成简历失败: " + error.message,
    });
  }
});

// AI 优化简历接口
app.post("/api/ai/optimize", async (req, res) => {
  try {
    const { resumeData, section, content } = req.body;

    // 验证请求参数
    if (!resumeData || !section || !content) {
      return res
        .status(400)
        .json({ code: 400, data: null, msg: "缺少必要参数" });
    }

    // 验证 API Key 是否配置
    if (!AI_API_KEY) {
      console.error("API Key 未配置");
      return res.status(500).json({
        code: 500,
        data: null,
        msg: "API Key 未配置，请在 .env 文件中设置 AI_API_KEY",
      });
    }

    // 生成缓存键
    const cacheKey = generateCacheKey("optimize", {
      resumeData,
      section,
      content,
    });

    // 尝试从缓存获取数据
    const cachedResult = await getFromCache(cacheKey);
    if (cachedResult) {
      console.log("从缓存获取优化结果");
      return res.status(200).json({
        code: 200,
        data: cachedResult,
        msg: "从缓存获取优化结果成功",
      });
    }

    // 过滤敏感信息
    const filteredData = filterSensitiveInfo({ resumeData, section, content });

    // 构建系统提示
    const systemPrompt = `你是专业简历优化专家，帮用户优化简历内容，提升表达专业性，突出个人优势，符合前端开发岗位求职要求，不改变核心信息。`;

    // 构建用户提示
    const userPrompt = `请优化以下简历内容：\n\n简历部分：${filteredData.section}\n\n当前内容：\n${filteredData.content}\n\n简历上下文：\n${JSON.stringify(filteredData.resumeData, null, 2)}\n\n请提供优化后的内容，保持专业、简洁、有力，突出个人优势和成就。`;

    // 构建请求消息
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    // 构建请求配置
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      data: buildByteArkRequest(messages),
    };

    // 调用字节火山方舟 API
    const aiResponse = await requestWithRetry(AI_BASE_URL, requestOptions);

    // 处理响应
    const optimizedContent = handleByteArkResponse(aiResponse);
    const result = { content: optimizedContent };

    // 缓存结果
    await setToCache(cacheKey, result);

    // 返回统一格式
    res.status(200).json({
      code: 200,
      data: result,
      msg: "优化成功",
    });
  } catch (error) {
    console.error("优化简历失败:", error);
    res.status(500).json({
      code: 500,
      data: null,
      msg: "优化简历失败: " + error.message,
    });
  }
});

// AI 结构化解析简历接口
app.post("/api/ai/parse", async (req, res) => {
  try {
    const { resumeText } = req.body;

    // 验证请求参数
    if (!resumeText || typeof resumeText !== "string") {
      return res.status(400).json({
        code: 400,
        data: null,
        msg: "缺少简历文本或格式不正确",
      });
    }

    // 检查文本长度
    if (resumeText.length < 10) {
      return res.status(400).json({
        code: 400,
        data: null,
        msg: "简历文本内容太少，无法解析",
      });
    }

    // 验证 API Key 是否配置
    if (!AI_API_KEY) {
      console.error("API Key 未配置");
      return res.status(500).json({
        code: 500,
        data: null,
        msg: "API Key 未配置，请在 .env 文件中设置 AI_API_KEY",
      });
    }

    // 生成缓存键
    const cacheKey = generateCacheKey("parse", {
      text: resumeText.substring(0, 500),
    });

    // 尝试从缓存获取数据
    const cachedResult = await getFromCache(cacheKey);
    if (cachedResult) {
      console.log("从缓存获取解析结果");
      return res.status(200).json({
        code: 200,
        data: cachedResult,
        msg: "从缓存获取解析结果成功",
      });
    }

    // 构建系统提示
    const systemPrompt = `你是专业简历解析助手，必须严格返回标准JSON格式，不要任何多余内容、解释、markdown。
请严格按照以下JSON结构解析简历内容：
{
  "basic": {
    "name": "姓名",
    "phone": "电话",
    "email": "邮箱",
    "location": "所在城市",
    "summary": "个人简介"
  },
  "education": [{"school": "学校", "major": "专业", "time": "时间", "desc": "描述"}],
  "skills": ["技能1", "技能2"],
  "projects": [{"name": "项目名", "time": "时间", "desc": "描述", "tech": "技术栈"}],
  "campusExperience": [{"org": "组织", "role": "职位", "time": "时间", "desc": "描述"}],
  "awards": [{"name": "奖项名", "time": "时间", "desc": "描述"}],
  "workExperience": [{"company": "公司", "role": "职位", "time": "时间", "desc": "描述"}]
}`;

    // 构建用户提示
    const userPrompt = `请严格按照系统提示中的JSON结构解析以下简历文本，提取所有可识别的信息：

简历文本：
${resumeText}

请只返回 JSON，不要添加任何其他文字。`;

    // 构建请求消息
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    // 构建请求配置
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      data: {
        ...buildByteArkRequest(messages),
        max_tokens: 1500, // 减少最大 token 数，加快生成速度
        temperature: 0.1, // 进一步降低温度，获得更稳定的输出
        timeout: 20000, // 增加API请求超时时间
      },
    };

    // 调用字节火山方舟 API
    const aiResponse = await requestWithRetry(AI_BASE_URL, requestOptions);

    // 处理响应
    const responseContent = handleByteArkResponse(aiResponse);

    // 尝试解析 JSON
    let parsedResult = null;
    try {
      // 提取 JSON 内容（处理可能的 markdown 代码块）
      let jsonContent = responseContent;
      const jsonMatch = responseContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1].trim();
      }

      parsedResult = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error("JSON 解析失败:", parseError);
      return res.status(500).json({
        code: 500,
        data: null,
        msg: "AI 返回格式错误，无法解析结果",
      });
    }

    // 验证并补全必要字段
    const validateAndCompleteResult = (result) => {
      const defaultResult = {
        basic: {
          name: "",
          phone: "",
          email: "",
          location: "",
          summary: "",
        },
        education: [],
        skills: [],
        projects: [],
        campusExperience: [],
        awards: [],
        workExperience: [],
      };

      return {
        ...defaultResult,
        ...result,
        basic: {
          ...defaultResult.basic,
          ...(result.basic || {}),
        },
      };
    };

    // 字段补全（模糊匹配缺失字段）
    const completeMissingFields = (text, result) => {
      // 这里可以添加一些简单的字段补全逻辑
      return result;
    };

    parsedResult = validateAndCompleteResult(parsedResult);
    parsedResult = completeMissingFields(resumeText, parsedResult);

    // 缓存结果
    await setToCache(cacheKey, parsedResult);

    // 返回统一格式
    res.status(200).json({
      code: 200,
      data: parsedResult,
      msg: "解析成功",
    });
  } catch (error) {
    console.error("解析简历失败:", error);
    res.status(500).json({
      code: 500,
      data: null,
      msg: "解析简历失败: " + error.message,
    });
  }
});

// AI 分析简历接口
app.post("/api/ai/analyze", async (req, res) => {
  try {
    const { resume, position } = req.body;

    if (!resume) {
      return res
        .status(400)
        .json({ code: 400, data: null, msg: "缺少简历数据" });
    }

    if (!position) {
      return res
        .status(400)
        .json({ code: 400, data: null, msg: "缺少目标岗位" });
    }

    // 验证 API Key 是否配置
    if (!AI_API_KEY) {
      console.error("API Key 未配置");
      return res.status(500).json({
        code: 500,
        data: null,
        msg: "API Key 未配置，请在 .env 文件中设置 AI_API_KEY",
      });
    }

    // 生成缓存键
    const cacheKey = generateCacheKey("analyze", { resume, position });

    // 尝试从缓存获取数据
    const cachedResult = await getFromCache(cacheKey);
    if (cachedResult) {
      console.log("从缓存获取分析结果");
      return res.status(200).json({
        code: 200,
        data: cachedResult,
        msg: "从缓存获取分析结果成功",
      });
    }

    // 构建系统提示
    const systemPrompt = `你是专业的简历分析专家，根据用户提供的简历和目标岗位，进行全面分析，给出专业的优化建议。`;

    // 构建用户提示
    const userPrompt = `请分析以下简历与目标岗位的匹配度，并提供详细的优化建议：\n\n目标岗位：${position}\n\n简历内容：\n${JSON.stringify(resume, null, 2)}\n\n请从以下几个方面进行分析：\n1. 整体匹配度评估\n2. 优势分析\n3. 不足分析\n4. 具体优化建议\n5. 简历亮点\n\n请提供详细、专业的分析报告，帮助用户提升简历质量。`;

    // 构建请求消息
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    // 构建请求配置
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      data: buildByteArkRequest(messages),
    };

    // 调用字节火山方舟 API
    const aiResponse = await requestWithRetry(AI_BASE_URL, requestOptions);

    // 处理响应
    const analysisContent = handleByteArkResponse(aiResponse);
    const result = { content: analysisContent };

    // 缓存结果
    await setToCache(cacheKey, result);

    // 返回统一格式
    res.status(200).json({
      code: 200,
      data: result,
      msg: "分析成功",
    });
  } catch (error) {
    console.error("分析简历失败:", error);
    res.status(500).json({
      code: 500,
      data: null,
      msg: "分析简历失败: " + error.message,
    });
  }
});

// 静态文件服务
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "dist")));

// 处理所有其他路由，返回前端应用
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`健康检查: http://localhost:${PORT}/api/health`);
  console.log(`API 接口: http://localhost:${PORT}/api/ai/`);
});

// 处理未捕获的异常
process.on("uncaughtException", (error) => {
  console.error("未捕获的异常:", error);
});

// 处理未处理的 Promise 拒绝
process.on("unhandledRejection", (error) => {
  console.error("未处理的 Promise 拒绝:", error);
});
