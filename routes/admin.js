import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { verifyAdminToken } from '../middleware/adminAuth.js';

const router = express.Router();

router.post('/login', adminController.login);
router.get('/resumes', verifyAdminToken, adminController.getAllResumes);
router.delete('/resumes/:resume_id', verifyAdminToken, adminController.deleteResume);

export default router;
