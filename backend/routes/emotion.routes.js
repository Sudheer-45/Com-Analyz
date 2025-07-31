    // node_backend/routes/emotion.routes.js
    import express from 'express';
    import EmotionDescription from '../models/emotionDescription.model.js'; // Adjust path if needed

    const router = express.Router();

    // GET /api/emotions/descriptions - Get all emotion descriptions
    router.get('/descriptions', async (req, res) => {
        try {
            const emotions = await EmotionDescription.find({});
            res.status(200).json(emotions);
        } catch (error) {
            console.error("Error fetching emotion descriptions:", error);
            res.status(500).json({ error: "Failed to fetch emotion descriptions." });
        }
    });

    // POST /api/emotions - Add a new emotion description (for admin use, optional)
    router.post('/', async (req, res) => {
        try {
            const newEmotion = new EmotionDescription(req.body);
            const savedEmotion = await newEmotion.save();
            res.status(201).json(savedEmotion);
        } catch (error) {
            console.error("Error adding emotion description:", error);
            if (error.code === 11000) { // Duplicate key error
                return res.status(409).json({ error: "Emotion already exists." });
            }
            res.status(500).json({ error: "Failed to add emotion description." });
        }
    });

    export default router;
    