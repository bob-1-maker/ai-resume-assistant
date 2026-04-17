import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config();

const tursoConfig = {
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_DB_AUTH_TOKEN
};

const client = createClient(tursoConfig);

async function setupDatabase() {
  try {
    console.log('正在连接 Turso 数据库...');
    
    // 测试连接
    await client.execute('SELECT 1');
    console.log('数据库连接成功！');
    
    // 创建表
    console.log('正在创建表结构...');
    await client.execute(`
      CREATE TABLE IF NOT EXISTS resume_records (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          resume_id TEXT UNIQUE NOT NULL,
          name TEXT,
          phone TEXT,
          email TEXT,
          education TEXT,
          projects TEXT,
          skills TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('表创建成功！');
    
    // 创建索引
    console.log('正在创建索引...');
    await client.execute('CREATE UNIQUE INDEX IF NOT EXISTS idx_resume_id ON resume_records(resume_id)');
    await client.execute('CREATE INDEX IF NOT EXISTS idx_created_at ON resume_records(created_at)');
    console.log('索引创建成功！');
    
    // 插入测试数据
    console.log('正在插入测试数据...');
    await client.execute(`
      INSERT OR IGNORE INTO resume_records (resume_id, name, phone, email, education, projects, skills) VALUES
      ('test-1', '张三', '13800138000', 'zhangsan@example.com', '[{"school": "北京大学", "major": "计算机科学与技术", "degree": "本科", "startDate": "2018-09", "endDate": "2022-06"}]', '[{"name": "项目1", "description": "测试项目"}]', '["Java", "Python", "SQL"]'),
      ('test-2', '李四', '13900139000', 'lisi@example.com', '[{"school": "清华大学", "major": "软件工程", "degree": "硕士", "startDate": "2020-09", "endDate": "2023-06"}]', '[{"name": "项目2", "description": "测试项目2"}]', '["JavaScript", "React", "Node.js"]')
    `);
    console.log('测试数据插入成功！');
    
    // 验证数据
    console.log('正在验证数据...');
    const result = await client.execute('SELECT COUNT(*) as total FROM resume_records');
    console.log(`数据库中共有 ${result.rows[0].total} 条记录`);
    
    console.log('\n🎉 Turso 数据库设置完成！');
  } catch (error) {
    console.error('数据库设置失败:', error);
  } finally {
    await client.close();
  }
}

setupDatabase();
