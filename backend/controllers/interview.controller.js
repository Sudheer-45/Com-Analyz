import axios from 'axios';
import FormData from 'form-data';
import Result from '../models/result.model.js'; // Assuming this model exists and is correctly imported

// These functions in Node.js act as proxies to the Python service (http://127.0.0.1:5001)

export const generateCustomQuestions = async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: 'Prompt is required.' });
        // Calls Python backend for AI generation
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
        // Calls Python backend for media analysis
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
        // Calls Python backend for expert review
        const pythonApiUrl = 'http://127.0.0.1:5001/expert-review';
        const response = await axios.post(pythonApiUrl, req.body);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error getting expert review:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to get expert review." });
    }
};

export const saveFullInterview = async (req, res) => {
    console.log("--- Starting saveFullInterview ---"); // Debug 1
    try {
        const { interviewTopic, questionAnalyses, interviewType } = req.body;
        
        console.log("Received data for saving:", { interviewTopic, interviewType, numAnalyses: questionAnalyses.length }); // Debug 2

        if (!interviewTopic || !questionAnalyses) {
            console.error("Validation Error: Missing interviewTopic or questionAnalyses."); // Debug 2.1
            return res.status(400).json({ error: 'Missing session data.' });
        }

        // --- Step 1: Call Python service to get AI-generated summary and score ---
        const pythonApiUrl = 'http://127.0.0.1:5001/summarize-and-score';
        console.log("Calling Python for summary and score at:", pythonApiUrl); // Debug 3
        const analysisResponse = await axios.post(pythonApiUrl, { sessionData: questionAnalyses });
        
        console.log("Python summary/score response received:", analysisResponse.data); // Debug 4
        const { summary, overallScore } = analysisResponse.data;

        // --- Step 2: Create a new Result document ---
        // CRITICAL CHECK: Ensure req.user and req.user._id are available
        if (!req.user || !req.user._id) {
            console.error("Authentication Error: req.user or req.user._id is missing. User not authenticated?"); // Debug 5
            return res.status(401).json({ error: "User not authenticated. Cannot save interview results." });
        }
        console.log("User ID for saving:", req.user._id); // Debug 6

        const newResult = new Result({
            userId: req.user._id, 
            interviewTopic,
            overallScore,
            summary,
            interviewType: interviewType || 'virtual',
            questionAnalyses,
        });
        console.log("New Result object created:", newResult); // Debug 7

        // --- Step 3: Save the Result document to MongoDB ---
        console.log("Attempting to save new Result to MongoDB..."); // Debug 8
        const savedResult = await newResult.save();
        console.log("Result saved successfully to MongoDB:", savedResult._id); // Debug 9
        
        res.status(201).json(savedResult); // 201 Created status
        console.log("--- saveFullInterview finished successfully ---"); // Debug 10

    } catch (error) {
        console.error("--- Error in saveFullInterview ---"); // Debug 11
        console.error("Full error object:", error); // Debug 12: Log the entire error object
        
        // Check if it's an Axios error from Python API call
        if (error.response) {
            console.error("Error response from Python backend:", error.response.status, error.response.data); // Debug 13
            // If Python API failed, send its error message
            return res.status(error.response.status || 500).json({ 
                error: `Python AI Service Error: ${error.response.data?.error || error.response.statusText}` 
            });
        } else if (error.name === 'ValidationError') { // Mongoose validation error
            console.error("Mongoose Validation Error:", error.message); // Debug 14
            return res.status(400).json({ error: `Data validation failed: ${error.message}` });
        } else {
            console.error("Unexpected error saving full interview:", error.message); // Debug 15
            return res.status(500).json({ error: "Failed to save interview results due to an unexpected error." });
        }
    }
};

export const recommendResources = async (req, res) => {
    try {
        const { sessionData } = req.body;
        if (!sessionData) {
            return res.status(400).json({ error: "Session data is required for recommendations." });
        }

        const pythonApiUrl = 'http://127.0.0.1:5001/recommend-resources'; // Assuming Python has this endpoint
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
// export const startJdChat = async (req, res) => {
//     try {
//         const { job_description } = req.body;
//         if (!job_description) {
//             return res.status(400).json({ error: 'Job description is required to start chat.' });
//         }

//         const pythonApiUrl = 'http://127.0.0.1:5001/start-jd-chat';
//         console.log('Forwarding start JD chat request to Python...');
        
//         const response = await axios.post(pythonApiUrl, { job_description });
        
//         res.status(200).json(response.data); // Returns session_id and initial_ai_message

//     } catch (error) {
//         console.error("Error starting JD chat:", error.response?.data || error.message);
//         res.status(500).json({ error: "Failed to start JD chat session." });
//     }
// };

// --- NEW FUNCTION: Send JD Chat Message ---
// export const jdChatMessage = async (req, res) => {
//     try {
//         const { session_id, user_message } = req.body;
//         if (!session_id || !user_message) {
//             return res.status(400).json({ error: 'Session ID and user message are required.' });
//         }

//         const pythonApiUrl = 'http://127.0.0.1:5001/jd-chat';
//         console.log('Forwarding JD chat message to Python...');
        
//         const response = await axios.post(pythonApiUrl, { session_id, user_message });
        
//         res.status(200).json(response.data); // Returns ai_message

//     } catch (error) {
//         console.error("Error sending JD chat message:", error.response?.data || error.message);
//         res.status(500).json({ error: "Failed to get AI response for chat message." });
//     }
// };