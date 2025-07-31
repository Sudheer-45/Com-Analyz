import express from 'express';
import protect from '../middleware/auth.middleware.js';
import { generateCuratedQuestions } from '../controllers/curated.controller.js';

const router = express.Router();

// Route to generate a curated interview session. It's protected.
router.post('/generate', protect, generateCuratedQuestions);

export default router;