import dotenv from 'dotenv';
import app from './app.js';
import { testConnection } from '../config/turso.js';
import { runMigrations } from '../config/migrations.js';

dotenv.config();

const PORT = process.env.PORT || 3001;

const initializeServer = async () => {
  await testConnection();
  await runMigrations();
};

const startServer = async () => {
  await initializeServer();

  app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`健康检查: http://localhost:${PORT}/api/health`);
    console.log(`AI 生成接口: POST http://localhost:${PORT}/api/ai/generate`);
    console.log(`AI 优化接口: POST http://localhost:${PORT}/api/ai/optimize`);
    console.log(`模板列表接口: GET http://localhost:${PORT}/api/templates`);
  });
};

export {
  app,
  initializeServer,
  startServer
};
