import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config();

// Turso 数据库配置
const tursoConfig = {
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_DB_AUTH_TOKEN
};

// 创建 Turso 客户端
const client = createClient(tursoConfig);

// 测试数据库连接
const testConnection = async () => {
  try {
    await client.execute('SELECT 1');
    console.log('Turso 数据库连接成功');
  } catch (error) {
    console.error('Turso 数据库连接失败:', error);
  }
};

// 执行SQL查询
const executeQuery = async (sql, params = []) => {
  try {
    const result = await client.execute({ sql, args: params });
    return result;
  } catch (error) {
    console.error('SQL执行错误:', error);
    throw error;
  }
};

// 执行批量操作（模拟事务）
const executeBatch = async (queries) => {
  try {
    const results = [];
    for (const { sql, params } of queries) {
      const result = await client.execute({ sql, args: params });
      results.push(result);
    }
    return results;
  } catch (error) {
    console.error('批量执行错误:', error);
    throw error;
  }
};

export {
  client,
  testConnection,
  executeQuery,
  executeBatch
};
