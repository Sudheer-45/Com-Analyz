import express from 'express';
import { subscribeToNewsletter } from '../controllers/subscriber.controller.js';

const router = express.Router();

// This is a public route, no 'protect' middleware needed
router.post('/subscribe', subscribeToNewsletter);

export default router;