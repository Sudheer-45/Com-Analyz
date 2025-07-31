import express from 'express';
import protect from '../middleware/auth.middleware.js'; // Import our new middleware
import { getUserProfile } from '../controllers/user.controller.js'; // We will create this next

const router = express.Router();

// This route is protected. The 'protect' middleware will run first.
// If the token is valid, it will call 'getUserProfile'. Otherwise, it will send an error.
router.get('/profile', protect, getUserProfile);

export default router;