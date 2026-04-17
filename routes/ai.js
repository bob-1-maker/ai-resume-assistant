import express from 'express';
import {
  parseResumeHandler,
  generateResumeHandler,
  optimizeResumeHandler,
  parseStructuredResumeHandler,
  weatherProfileHandler
} from '../controllers/aiController.js';

const router = express.Router();

router.post('/parse-resume', parseResumeHandler);
router.post('/generate', generateResumeHandler);
router.post('/optimize', optimizeResumeHandler);
router.post('/parse', parseStructuredResumeHandler);
router.post('/weather-profile', weatherProfileHandler);

export default router;
