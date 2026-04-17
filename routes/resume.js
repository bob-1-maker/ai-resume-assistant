import express from 'express';
const router = express.Router();
import * as resumeController from '../controllers/resumeController.js';

// 批量保存简历记录
router.post('/batch-save', resumeController.batchSaveResumes);

// 分页查询简历记录
router.get('/', resumeController.getResumes);

// 单条查询简历记录
router.get('/:resume_id', resumeController.getResumeById);

// 更新简历记录
router.put('/:resume_id', resumeController.updateResume);

// 删除简历记录
router.delete('/:resume_id', resumeController.deleteResume);

export default router;
