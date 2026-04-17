import jwt from 'jsonwebtoken';
import { executeQuery } from '../config/turso.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '123456';

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        code: 400,
        msg: '管理员用户名和密码不能为空',
        data: null
      });
    }

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(401).json({
        code: 401,
        msg: '管理员用户名或密码错误',
        data: null
      });
    }

    const token = jwt.sign(
      { username: ADMIN_USERNAME, isAdmin: true },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      code: 200,
      msg: '管理员登录成功',
      data: {
        token,
        user: {
          username: ADMIN_USERNAME,
          isAdmin: true
        }
      }
    });
  } catch (error) {
    console.error('管理员登录失败:', error);
    return res.status(500).json({
      code: 500,
      msg: '服务器内部错误',
      data: null
    });
  }
};

const getAllResumes = async (req, res) => {
  try {
    const parsedPage = parseInt(req.query.page, 10);
    const parsedPageSize = parseInt(req.query.pageSize, 10);
    const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    const pageSize = Number.isInteger(parsedPageSize) && parsedPageSize > 0 ? parsedPageSize : 10;
    const offset = (page - 1) * pageSize;

    const totalResult = await executeQuery(
      'SELECT COUNT(*) as total FROM resume_records',
      []
    );
    const total = totalResult.rows[0]?.total || 0;

    const resumesResult = await executeQuery(
      `
        SELECT * FROM resume_records
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `,
      [pageSize, offset]
    );

    const processedResumes = resumesResult.rows.map((resume) => ({
      ...resume,
      projects: JSON.parse(resume.projects || '[]'),
      skills: JSON.parse(resume.skills || '[]'),
      created_at: resume.created_at
        ? new Date(resume.created_at).toLocaleString('zh-CN', {
            timeZone: 'Asia/Shanghai'
          })
        : null
    }));

    return res.status(200).json({
      code: 200,
      msg: '查询成功',
      data: {
        list: processedResumes,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: total === 0 ? 0 : Math.ceil(total / pageSize)
        }
      }
    });
  } catch (error) {
    console.error('查询管理员简历列表失败:', error);
    return res.status(500).json({
      code: 500,
      msg: '服务器内部错误',
      data: null
    });
  }
};

const deleteResume = async (req, res) => {
  try {
    const { resume_id } = req.params;

    if (!resume_id) {
      return res.status(400).json({
        code: 400,
        msg: '简历记录ID不能为空',
        data: null
      });
    }

    const result = await executeQuery(
      'DELETE FROM resume_records WHERE resume_id = ?',
      [resume_id]
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        code: 404,
        msg: '简历记录不存在',
        data: null
      });
    }

    return res.status(200).json({
      code: 200,
      msg: '删除成功',
      data: null
    });
  } catch (error) {
    console.error('管理员删除简历失败:', error);
    return res.status(500).json({
      code: 500,
      msg: '服务器内部错误',
      data: null
    });
  }
};

export {
  login,
  getAllResumes,
  deleteResume
};
