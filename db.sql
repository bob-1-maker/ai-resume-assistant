-- 创建数据库
CREATE DATABASE IF NOT EXISTS resume_parser_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE resume_parser_db;

-- 创建简历记录表
CREATE TABLE IF NOT EXISTS resume_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    resume_id VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(50),
    phone VARCHAR(20),
    email VARCHAR(100),
    education TEXT,
    projects JSON,
    skills JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建索引
CREATE UNIQUE INDEX idx_resume_id ON resume_records(resume_id);
CREATE INDEX idx_created_at ON resume_records(created_at);

-- 插入测试数据
INSERT INTO resume_records (resume_id, name, phone, email, education, projects, skills) VALUES
('test-1', '张三', '13800138000', 'zhangsan@example.com', '北京大学计算机科学与技术专业', '[{"name": "项目1", "description": "测试项目"}]', '["Java", "Python", "SQL"]'),
('test-2', '李四', '13900139000', 'lisi@example.com', '清华大学软件工程专业', '[{"name": "项目2", "description": "测试项目2"}]', '["JavaScript", "React", "Node.js"]');
