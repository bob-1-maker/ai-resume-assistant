import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const verifyAdminToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        code: 401,
        msg: '缺少管理员认证 token',
        data: null
      });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        code: 401,
        msg: '无效的 token 格式',
        data: null
      });
    }

    const token = parts[1]?.trim();

    if (!token) {
      return res.status(401).json({
        code: 401,
        msg: '无效的 token 格式',
        data: null
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded?.isAdmin) {
      return res.status(403).json({
        code: 403,
        msg: '无管理员权限',
        data: null
      });
    }

    req.admin = {
      username: decoded.username,
      isAdmin: true
    };

    next();
  } catch (error) {
    return res.status(401).json({
      code: 401,
      msg: '无效或过期的管理员 token',
      data: null
    });
  }
};

export {
  verifyAdminToken
};
