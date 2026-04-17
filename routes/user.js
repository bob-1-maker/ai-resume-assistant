import express from 'express';
const router = express.Router();
import * as userController from '../controllers/userController.js';
import { verifyToken } from '../middleware/auth.js';

// 注册
router.post('/register', userController.register);

// 登录
router.post('/login', userController.login);

// 获取当前用户信息（需要验证token）
router.get('/me', verifyToken, userController.getCurrentUser);

export default router;
