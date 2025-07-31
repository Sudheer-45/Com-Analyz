import express from 'express';
import protect from '../middleware/auth.middleware.js'; // Import our authentication gatekeeper
import { getMyResults, getResultById } from '../controllers/result.controller.js'; // Import the controller function

const router = express.Router();

// Define the route for GET requests to '/my-results'
// When a request hits this endpoint, it will first go through the `protect` middleware.
// If the token is valid, `protect` will call `next()`, and the request will proceed
// to the `getMyResults` function. If the token is invalid, `protect` will send an error.
router.get('/my-results', protect, getMyResults);
router.get('/:id', protect, getResultById)

// You can add more routes here later. For example:
// router.get('/:id', protect, getResultById);

export default router;