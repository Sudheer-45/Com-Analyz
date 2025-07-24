import axios from 'axios';
import FormData from 'form-data';
import Result from '../models/result.model.js';

export const generateCustomQuestions = async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: 'Prompt is required.' });
        const pythonApiUrl = 'http://127.0.0.1:5001/generate-questions';
        const response = await axios.post(pythonApiUrl, { prompt });
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error generating questions:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to generate interview questions." });
    }
};

export const analyzeAnswer = async (req, res) => {
    try {
        if (!req.files?.audio?.[0] || !req.files?.image?.[0]) {
            return res.status(400).json({ error: 'Audio and image files are required.' });
        }
        const form = new FormData();
        form.append('audio', req.files.audio[0].buffer, { filename: 'audio.webm' });
        form.append('image', req.files.image[0].buffer, { filename: 'image.png' });
        const pythonApiUrl = 'http://127.0.0.1:5001/analyze';
        const response = await axios.post(pythonApiUrl, form, { headers: form.getHeaders() });
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error analyzing answer:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to analyze answer." });
    }
};

export const getExpertReview = async (req, res) => {
    try {
        const pythonApiUrl = 'http://127.0.0.1:5001/expert-review';
        const response = await axios.post(pythonApiUrl, req.body);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error getting expert review:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to get expert review." });
    }
};

export const saveFullInterview = async (req, res) => {
    try {
        const { interviewTopic, questionAnalyses, interviewType } = req.body;
        if (!interviewTopic || !questionAnalyses) return res.status(400).json({ error: 'Missing session data.' });

        // Call Python service to get AI-generated summary and score
        const pythonApiUrl = 'http://127.0.0.1:5001/summarize-and-score';
        const analysisResponse = await axios.post(pythonApiUrl, { sessionData: questionAnalyses });
        const { summary, overallScore } = analysisResponse.data;

        const newResult = new Result({
            userId: req.user._id,
            interviewTopic,
            overallScore,
            summary,
            interviewType: interviewType || 'virtual',
            questionAnalyses,
        });

        const savedResult = await newResult.save();
        res.status(201).json(savedResult);
    } catch (error) {
        console.error("Error saving full interview:", error.message);
        res.status(500).json({ error: "Failed to save interview results." });
    }
};

// ... (imports)
// ... (all existing functions) ...

// --- NEW FUNCTION ---
export const recommendResources = async (req, res) => {
    try {
        const { sessionData } = req.body; // This will be the allAnswers array from the frontend
        if (!sessionData) {
            return res.status(400).json({ error: "Session data is required for recommendations." });
        }

        const pythonApiUrl = 'http://127.0.0.1:5001/recommend-resources';
        console.log('Forwarding resource recommendation request to Python service...');
        
        const response = await axios.post(pythonApiUrl, { sessionData });
        
        res.status(200).json(response.data);

    } catch (error) {
        console.error("Error generating recommendations:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to generate study recommendations." });
    }
};

// ... (rest of the file)   
// ... (all existing imports and functions) ...

// --- NEW FUNCTION: Start JD Chat ---
export const startJdChat = async (req, res) => {
    try {
        const { job_description } = req.body;
        if (!job_description) {
            return res.status(400).json({ error: 'Job description is required to start chat.' });
        }

        const pythonApiUrl = 'http://127.0.0.1:5001/start-jd-chat';
        console.log('Forwarding start JD chat request to Python...');
        
        const response = await axios.post(pythonApiUrl, { job_description });
        
        res.status(200).json(response.data); // Returns session_id and initial_ai_message

    } catch (error) {
        console.error("Error starting JD chat:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to start JD chat session." });
    }
};

// --- NEW FUNCTION: Send JD Chat Message ---
export const jdChatMessage = async (req, res) => {
    try {
        const { session_id, user_message } = req.body;
        if (!session_id || !user_message) {
            return res.status(400).json({ error: 'Session ID and user message are required.' });
        }

        const pythonApiUrl = 'http://127.0.0.1:5001/jd-chat';
        console.log('Forwarding JD chat message to Python...');
        
        const response = await axios.post(pythonApiUrl, { session_id, user_message });
        
        res.status(200).json(response.data); // Returns ai_message

    } catch (error) {
        console.error("Error sending JD chat message:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to get AI response for chat message." });
    }
};