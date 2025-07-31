import express from 'express';
import { submitContactForm } from '../controllers/contact.controller.js';

const router = express.Router();

// This is a public route, no 'protect' middleware needed
router.post('/submit', submitContactForm);

export default router;