-- Turso 数据库建表语句

-- 创建简历记录表
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
);

-- 创建索引
CREATE UNIQUE INDEX IF NOT EXISTS idx_resume_id ON resume_records(resume_id);
CREATE INDEX IF NOT EXISTS idx_created_at ON resume_records(created_at);

-- 插入测试数据
INSERT OR IGNORE INTO resume_records (resume_id, name, phone, email, education, projects, skills) VALUES
('test-1', '张三', '13800138000', 'zhangsan@example.com', '[{"school": "北京大学", "major": "计算机科学与技术", "degree": "本科", "startDate": "2018-09", "endDate": "2022-06"}]', '[{"name": "项目1", "description": "测试项目"}]', '["Java", "Python", "SQL"]'),
('test-2', '李四', '13900139000', 'lisi@example.com', '[{"school": "清华大学", "major": "软件工程", "degree": "硕士", "startDate": "2020-09", "endDate": "2023-06"}]', '[{"name": "项目2", "description": "测试项目2"}]', '["JavaScript", "React", "Node.js"]');
