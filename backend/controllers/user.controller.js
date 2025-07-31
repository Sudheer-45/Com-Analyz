// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
import Result from '../models/result.model.js';

export const getUserProfile = async (req, res) => {
    // The 'protect' middleware has already fetched the user and attached it to req.user
    if (req.user) {
        res.json({
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
        });
    } else {
        res.status(404).json({ error: 'User not found' });
    }
};

// This function would be called after all questions are answered.
// It receives all the session data from the frontend.
export const saveFullInterview = async (req, res) => {
    try {
        const { interviewTopic, overallScore, summary, questionAnalyses } = req.body;
        
        // The 'protect' middleware gives us req.user
        const userId = req.user._id;

        const newResult = new Result({
            userId,
            interviewTopic,
            overallScore,
            summary,
            questionAnalyses,
        });

        const savedResult = await newResult.save();
        res.status(201).json(savedResult);

    } catch (error) {
        console.error("Error saving full interview:", error.message);
        res.status(500).json({ error: "Failed to save interview results." });
    }
};