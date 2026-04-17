import { executeQuery } from './turso.js';

// 运行数据库迁移
const runMigrations = async () => {
  try {
    console.log('开始数据库迁移...');
    
    // 创建 users 表
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('创建 users 表成功');
    
    // 为 resume_records 表添加 user_id 字段
    try {
      await executeQuery(
        'ALTER TABLE resume_records ADD COLUMN user_id INTEGER NOT NULL DEFAULT 0'
      );
      console.log('为 resume_records 表添加 user_id 字段成功');
    } catch (error) {
      // 如果字段已存在，忽略错误
      if (error.message.includes('duplicate column name')) {
        console.log('user_id 字段已存在，跳过添加');
      } else {
        throw error;
      }
    }
    
    // 添加外键约束（如果支持）
    try {
      await executeQuery(
        'CREATE INDEX IF NOT EXISTS idx_resume_records_user_id ON resume_records(user_id)'
      );
      console.log('为 resume_records 表添加 user_id 索引成功');
    } catch (error) {
      console.error('添加索引失败:', error);
      // 忽略错误，继续执行
    }
    
    console.log('数据库迁移完成');
  } catch (error) {
    console.error('数据库迁移失败:', error);
  }
};

// 运行迁移
export { runMigrations };
