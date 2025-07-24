// server.js

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai'; // AI imports
import { v4 as uuidv4 } from 'uuid'; // For generating unique session IDs

// --- Configure and load environment variables BEFORE any other imports that might need them.
dotenv.config();

// --- Import your existing route files ---
import authRoutes from './routes/auth.routes.js';
import interviewRoutes from './routes/interview.routes.js';
import resultRoutes from './routes/result.routes.js';
import curatedRoutes from './routes/curated.routes.js';
import subscriberRoutes from './routes/subscriber.routes.js';
import userRoutes from './routes/user.routes.js';
import contactRoutes from './routes/contact.routes.js';

// --- CONFIGURATION ---
const app = express();
const PORT = process.env.PORT || 8000; // Your main backend port

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected successfully."))
    .catch((err) => console.error("MongoDB connection error:", err));

// --- GOOGLE GEMINI AI CONFIGURATION (FOR CHAT ONLY) ---
const API_KEY = process.env.GOOGLE_API_KEY;
if (!API_KEY) {
    console.error("CRITICAL WARNING: GOOGLE_API_KEY not found in .env file. AI chat generation will be disabled.");
    // In a production app, you might want to exit or disable AI features gracefully
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Define model to use for AI chat
const CHAT_GEMINI_MODEL = 'gemini-1.5-flash-latest'; // For conversational AI (JD chat)

// Safety settings (similar to your Python app)
const SAFETY_SETTINGS = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
];

// In-memory storage for active chat sessions
// Maps session_id to a GenerativeModel.startChat() object
const activeChatSessions = new Map();

// --- Helper Function to check AI configuration for CHAT MODEL ONLY ---
async function checkChatAiConfiguration() {
    if (!API_KEY) {
        console.warn("AI chat functions disabled: GOOGLE_API_KEY is not set.");
        return false;
    }
    try {
        // Test only the chat model to ensure accessibility
        await genAI.getGenerativeModel({ model: CHAT_GEMINI_MODEL }).generateContent("test chat connectivity");
        console.log(`Google Gemini AI chat model ('${CHAT_GEMINI_MODEL}') is accessible.`);
        return true;
    } catch (error) {
        console.error(`CRITICAL AI CHAT CONFIGURATION ERROR: ${error.message}. Ensure GOOGLE_API_KEY is correct and model '${CHAT_GEMINI_MODEL}' is accessible in your region.`);
        return false;
    }
}

// --- AI Chat Endpoints (New Routes, under /api/ai) ---

// Endpoint to start a new JD chat session
app.post('/api/ai/start-jd-chat', async (req, res) => {
    console.log('Received request to /api/ai/start-jd-chat'); // Debugging log
    // Check if AI chat is configured before proceeding
    if (!(await checkChatAiConfiguration())) {
        return res.status(503).json({ error: "AI chat service is not configured correctly. Check API key or model availability." });
    }

    const { job_description } = req.body;
    if (!job_description) {
        return res.status(400).json({ error: 'Job description is required to start chat.' });
    }

    const sessionId = uuidv4(); // Generate a unique session ID

    // Define the system instruction for the AI's persona and context
    const systemInstructionContent = {
        parts: [{
            text: `You are an expert Interview Coach specializing in Job Description analysis.
            Your role is to act as an intelligent conversational partner,
            answering questions related to the provided Job Description.
            If asked, help the user identify key skills, responsibilities, or potential interview questions directly from the JD.
            If the user asks for practice, you can ask a question from the JD.
            Always stay strictly within the context of the Job Description.
            HERE IS THE JOB DESCRIPTION FOR YOUR CONTEXT:\n\n${job_description}`
        }]
    };

    try {
        const model = genAI.getGenerativeModel({
            model: CHAT_GEMINI_MODEL,
            safetySettings: SAFETY_SETTINGS, // Apply safety settings
            systemInstruction: systemInstructionContent // Set the persona and initial context
        });

        console.log('Attempting to start chat session with Gemini...'); // Debugging log
        // Start a new chat session with an empty history
        const chat = model.startChat({ history: [] });

        // Send an initial message to the AI to get its first response based on the system instruction
        console.log('Sending initial message to AI...'); // Debugging log
        const result = await chat.sendMessage("I have reviewed the Job Description and am ready to assist you. What would you like to discuss about it, or would you like to practice some questions related to it?");
        const initialAiMessage = result.response.text();

        console.log('AI initial message generated:', initialAiMessage); // Debugging log: CHECK THIS OUTPUT
        
        // Store the chat object in our in-memory map
        activeChatSessions.set(sessionId, chat);

        res.status(200).json({
            session_id: sessionId,
            initial_ai_message: initialAiMessage
        });
        console.log('Response sent to frontend for /api/ai/start-jd-chat'); // Debugging log

    } catch (error) {
        console.error("Error starting JD chat:", error); // Debugging log: CHECK THIS ERROR
        // Check for specific error types from Google Generative AI
        if (error.message && error.message.includes('400') && error.message.includes('Content policy enforcement')) {
            return res.status(400).json({ error: "AI Content Policy Violation. Your job description may contain problematic content. Please try a different one." });
        } else if (error.message && error.message.includes('404') && error.message.includes('Model is not found')) {
            return res.status(503).json({ error: "AI model not found or accessible. Check API key and model name." });
        }
        res.status(500).json({ error: "Failed to start JD chat session. AI might be temporarily unavailable." });
    }
});

// Endpoint to continue a JD chat session
app.post('/api/ai/jd-chat', async (req, res) => {
    console.log('Received request to /api/ai/jd-chat'); // Debugging log
    // Check if AI chat is configured before proceeding
    if (!(await checkChatAiConfiguration())) {
        return res.status(503).json({ error: "AI chat service is not configured correctly. Check API key or model availability." });
    }

    const { session_id, user_message } = req.body;
    if (!session_id || !user_message) {
        return res.status(400).json({ error: 'Session ID and user message are required.' });
    }

    const chat = activeChatSessions.get(session_id);
    if (!chat) {
        return res.status(404).json({ error: "Chat session not found or expired. Please start a new session." });
    }

    try {
        console.log('Sending user message to AI:', user_message); // Debugging log
        const result = await chat.sendMessage(user_message);
        const aiMessage = result.response.text();

        console.log('AI response generated:', aiMessage); // Debugging log: CHECK THIS OUTPUT
        res.status(200).json({ ai_message: aiMessage });
        console.log('Response sent to frontend for /api/ai/jd-chat'); // Debugging log

    } catch (error) {
        console.error("Error sending JD chat message:", error); // Debugging log: CHECK THIS ERROR
        // Check for specific error types from Google Generative AI
        if (error.message && error.message.includes('400') && error.message.includes('Content policy enforcement')) {
            return res.status(400).json({ error: "AI Content Policy Violation. Your message may contain problematic content. Please rephrase." });
        } else if (error.message && error.message.includes('404') && error.message.includes('Model is not found')) {
            return res.status(503).json({ error: "AI model not found or accessible. Check API key and model name." });
        }
        res.status(500).json({ error: "Failed to get AI response for chat message. AI might be temporarily unavailable." });
    }
});


// --- API ROUTES (Existing Routes) ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/curated', curatedRoutes);
app.use('/api/newsletter', subscriberRoutes);
app.use('/api/contact', contactRoutes); 

// --- SERVER START ---
app.listen(PORT, async () => {
    console.log(`Node.js backend server is running on http://localhost:${PORT}`);
    console.log('Performing initial AI chat configuration check...');
    await checkChatAiConfiguration(); // Perform AI chat config check on startup
});
