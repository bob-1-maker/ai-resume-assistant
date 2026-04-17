import { executeQuery, executeBatch } from '../config/turso.js';

// 批量保存简历记录
const batchSaveResumes = async (req, res) => {
  try {
    const resumes = req.body;
    const userId = req.userId;
    
    if (!Array.isArray(resumes)) {
      return res.status(400).json({ code: 400, msg: '请求体必须是数组', data: null });
    }
    
    if (resumes.length === 0) {
      return res.status(400).json({ code: 400, msg: '简历数组不能为空', data: null });
    }
    
    // 准备批量插入的SQL语句
    const queries = resumes.map(resume => ({
      sql: `
        INSERT OR REPLACE INTO resume_records (
          resume_id, name, phone, email, education, projects, skills, user_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, COALESCE((SELECT created_at FROM resume_records WHERE resume_id = ?), CURRENT_TIMESTAMP))
      `,
      params: [
        resume.resume_id,
        resume.name || null,
        resume.phone || null,
        resume.email || null,
        resume.education || null,
        JSON.stringify(resume.projects || []),
        JSON.stringify(resume.skills || []),
        userId,
        resume.resume_id
      ]
    }));
    
    // 执行批量操作
    await executeBatch(queries);
    
    res.status(200).json({ 
      code: 200, 
      msg: `成功保存 ${resumes.length} 条简历记录`, 
      data: { count: resumes.length } 
    });
  } catch (error) {
    console.error('批量保存失败:', error);
    res.status(500).json({ code: 500, msg: '服务器内部错误', data: null });
  }
};

// 分页查询简历记录
const getResumes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;
    const userId = req.userId;
    
    // 查询总数
    const totalResult = await executeQuery(
      'SELECT COUNT(*) as total FROM resume_records WHERE user_id = ?',
      [userId]
    );
    const total = totalResult.rows[0].total;
    
    // 查询数据
    const resumesResult = await executeQuery(
      'SELECT * FROM resume_records WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [userId, pageSize, offset]
    );
    
    // 处理JSON字段和时区转换
    const processedResumes = resumesResult.rows.map(resume => ({
      ...resume,
      projects: JSON.parse(resume.projects || '[]'),
      skills: JSON.parse(resume.skills || '[]'),
      created_at: new Date(resume.created_at).toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai'
      })
    }));
    
    res.status(200).json({ 
      code: 200, 
      msg: '查询成功', 
      data: {
        list: processedResumes,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      } 
    });
  } catch (error) {
    console.error('查询简历失败:', error);
    res.status(500).json({ code: 500, msg: '服务器内部错误', data: null });
  }
};

// 单条查询简历记录
const getResumeById = async (req, res) => {
  try {
    const { resume_id } = req.params;
    const userId = req.userId;
    
    const resumesResult = await executeQuery(
      'SELECT * FROM resume_records WHERE resume_id = ? AND user_id = ?',
      [resume_id, userId]
    );
    
    if (resumesResult.rows.length === 0) {
      return res.status(404).json({ code: 404, msg: '简历记录不存在', data: null });
    }
    
    const resume = resumesResult.rows[0];
    // 处理JSON字段
    const processedResume = {
      ...resume,
      projects: JSON.parse(resume.projects || '[]'),
      skills: JSON.parse(resume.skills || '[]')
    };
    
    res.status(200).json({ 
      code: 200, 
      msg: '查询成功', 
      data: processedResume 
    });
  } catch (error) {
    console.error('查询简历失败:', error);
    res.status(500).json({ code: 500, msg: '服务器内部错误', data: null });
  }
};

// 更新简历记录
const updateResume = async (req, res) => {
  try {
    const { resume_id } = req.params;
    const resumeData = req.body;
    const userId = req.userId;
    
    const result = await executeQuery(
      `
        UPDATE resume_records SET
          name = ?,
          phone = ?,
          email = ?,
          education = ?,
          projects = ?,
          skills = ?
        WHERE resume_id = ? AND user_id = ?
      `,
      [
        resumeData.name || null,
        resumeData.phone || null,
        resumeData.email || null,
        resumeData.education || null,
        JSON.stringify(resumeData.projects || []),
        JSON.stringify(resumeData.skills || []),
        resume_id,
        userId
      ]
    );
    
    // Turso 返回的是修改的行数，检查是否有修改
    if (result.rowsAffected === 0) {
      return res.status(404).json({ code: 404, msg: '简历记录不存在', data: null });
    }
    
    res.status(200).json({ 
      code: 200, 
      msg: '更新成功', 
      data: null 
    });
  } catch (error) {
    console.error('更新简历失败:', error);
    res.status(500).json({ code: 500, msg: '服务器内部错误', data: null });
  }
};

// 删除简历记录
const deleteResume = async (req, res) => {
  try {
    const { resume_id } = req.params;
    const userId = req.userId;
    
    const result = await executeQuery(
      'DELETE FROM resume_records WHERE resume_id = ? AND user_id = ?',
      [resume_id, userId]
    );
    
    if (result.rowsAffected === 0) {
      return res.status(404).json({ code: 404, msg: '简历记录不存在', data: null });
    }
    
    res.status(200).json({ 
      code: 200, 
      msg: '删除成功', 
      data: null 
    });
  } catch (error) {
    console.error('删除简历失败:', error);
    res.status(500).json({ code: 500, msg: '服务器内部错误', data: null });
  }
};

export {
  batchSaveResumes,
  getResumes,
  getResumeById,
  updateResume,
  deleteResume
};
