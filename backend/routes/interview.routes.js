import express from 'express';
import multer from 'multer';
import protect from '../middleware/auth.middleware.js';
import { recommendResources } from '../controllers/interview.controller.js'; // <-- Import new controller function
// import { startJdChat, jdChatMessage } from '../controllers/interview.controller.js'; 

import { 
    generateCustomQuestions,
    analyzeAnswer,
    getExpertReview, 
    saveFullInterview,
} from '../controllers/interview.controller.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// All routes related to the interview process
router.post('/generate-questions', protect, generateCustomQuestions);
router.post('/analyze', protect, upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'image', maxCount: 1 }]), analyzeAnswer);
router.post('/expert-review', protect, getExpertReview);
router.post('/save-session', protect, saveFullInterview);
router.post('/recommend-resources', protect, recommendResources);
// router.post('/jd-chat/start', protect, startJdChat);
// router.post('/jd-chat/message', protect, jdChatMessage);

export default router;