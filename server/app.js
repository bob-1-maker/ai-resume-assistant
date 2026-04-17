import express from 'express';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import resumeRoutes from '../routes/resume.js';
import userRoutes from '../routes/user.js';
import adminRoutes from '../routes/admin.js';
import aiRoutes from '../routes/ai.js';
import { verifyToken } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (res.getHeader('Content-Type')) {
      return /json|text|javascript|css/.test(res.getHeader('Content-Type'));
    }

    return true;
  }
}));

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 3600,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const aiRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 60,
  message: {
    code: 429,
    msg: '请求过于频繁，请 10 分钟后再试',
    data: null
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    code: 200,
    data: { status: 'ok' },
    msg: 'AI 简历助手后端服务运行正常'
  });
});

app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/resumes', verifyToken, resumeRoutes);
app.use('/api/ai', aiRateLimit, aiRoutes);

app.get('/api/templates', (req, res) => {
  try {
    const templatesPath = path.join(__dirname, '..', 'data', 'templates.json');

    if (!fs.existsSync(templatesPath)) {
      return res.status(500).json({
        code: 500,
        data: null,
        msg: '模板数据文件不存在'
      });
    }

    const templatesData = JSON.parse(fs.readFileSync(templatesPath, 'utf8'));

    return res.status(200).json({
      code: 200,
      data: templatesData.templates || [],
      msg: '获取模板列表成功'
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      data: null,
      msg: '获取模板列表失败，请稍后重试'
    });
  }
});

export default app;
