import jwt from 'jsonwebtoken';

// JWT 密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 验证 token 中间件
const verifyToken = (req, res, next) => {
  try {
    // 从请求头获取 token
    const authHeader = req.headers.authorization;
    console.log('Authorization header:', authHeader);
    
    if (!authHeader) {
      return res.status(401).json({ code: 401, msg: '缺少认证token', data: null });
    }
    
    // 提取 token（Bearer token格式）
    const parts = authHeader.split(' ');
    console.log('Header parts:', parts);
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ code: 401, msg: '无效的token格式', data: null });
    }
    
    const token = parts[1];
    console.log('Extracted token:', token);
    
    if (!token) {
      return res.status(401).json({ code: 401, msg: '无效的token格式', data: null });
    }
    
    // 验证 token
    console.log('Verifying token...');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token verified:', decoded);
    
    // 将用户信息添加到请求对象中
    req.userId = decoded.userId;
    req.username = decoded.username;
    
    next();
  } catch (error) {
    console.error('token验证失败:', error);
    return res.status(401).json({ code: 401, msg: '无效或过期的token', data: null });
  }
};

export {
  verifyToken
};
