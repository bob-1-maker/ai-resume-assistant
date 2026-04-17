import { executeQuery } from '../config/turso.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// JWT 密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 注册用户
const register = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 验证请求参数
    if (!username || !password) {
      return res.status(400).json({ code: 400, msg: '用户名和密码不能为空', data: null });
    }
    
    // 检查用户名是否已存在
    const existingUser = await executeQuery(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ code: 400, msg: '用户名已存在', data: null });
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 插入新用户
    await executeQuery(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    );
    
    res.status(200).json({ code: 200, msg: '注册成功', data: null });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ code: 500, msg: '服务器内部错误', data: null });
  }
};

// 登录用户
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 验证请求参数
    if (!username || !password) {
      return res.status(400).json({ code: 400, msg: '用户名和密码不能为空', data: null });
    }
    
    // 查找用户
    const userResult = await executeQuery(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ code: 401, msg: '用户名或密码错误', data: null });
    }
    
    const user = userResult.rows[0];
    
    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ code: 401, msg: '用户名或密码错误', data: null });
    }
    
    // 生成 JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(200).json({
      code: 200,
      msg: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username
        }
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ code: 500, msg: '服务器内部错误', data: null });
  }
};

// 获取当前用户信息
const getCurrentUser = async (req, res) => {
  try {
    const { userId } = req;
    
    const userResult = await executeQuery(
      'SELECT id, username, created_at FROM users WHERE id = ?',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ code: 404, msg: '用户不存在', data: null });
    }
    
    const user = userResult.rows[0];
    
    res.status(200).json({
      code: 200,
      msg: '获取用户信息成功',
      data: user
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({ code: 500, msg: '服务器内部错误', data: null });
  }
};

export {
  register,
  login,
  getCurrentUser
};
