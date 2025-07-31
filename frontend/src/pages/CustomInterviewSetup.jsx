import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import './CustomInterviewSetup.css'; // This will be our new, beautiful CSS
import { FiEdit, FiVideo, FiMic, FiArrowRight } from 'react-icons/fi'; // Import beautiful icons

const CustomInterviewSetup = () => {
    const [prompt, setPrompt] = useState('');
    const [interviewType, setInterviewType] = useState('virtual');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Please provide a prompt or job description to generate your interview.');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const response = await api.post('/interview/generate-questions', { prompt });
            if (!response.data || response.data.length === 0) {
                setError("The AI couldn't generate questions. Please try a different or more specific prompt.");
                setIsLoading(false);
                return;
            }
            navigate('/interview-session', { 
                state: { 
                    questions: response.data,
                    interviewType: interviewType,
                    topic: prompt.substring(0, 70) + (prompt.length > 70 ? '...' : '')
                } 
            });
        } catch (err) {
            setError(err.response?.data?.error || 'An unexpected error occurred. The AI service may be down.');
            setIsLoading(false);
        }
    };

    return (
        <div className="page-container">
            <header className="page-header">
                <h2>Create Your Custom Interview</h2>
                <p>Design a practice session perfectly tailored to your needs.</p>
            </header>

            <div className="setup-card-v2">
                {/* --- Step 1: The Prompt --- */}
                <div className="setup-step-v2">
                    <div className="step-header">
                        <div className="step-icon-wrapper"><FiEdit /></div>
                        <h4>Step 1: Write Your Prompt</h4>
                    </div>
                    <p className="step-description-v2">Describe your target role, paste a job description, or list topics you want to cover.</p>
                    <textarea
                        className="prompt-textarea-v2"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., 'An interview for a Python Developer intern at a large MNC, focusing on data structures and object-oriented programming.'"
                    />
                </div>

                {/* --- Step 2: The Format --- */}
                <div className="setup-step-v2">
                    <div className="step-header">
                        <div className="step-icon-wrapper"><FiVideo /></div>
                        <h4>Step 2: Choose Your Format</h4>
                    </div>
                    <div className="radio-group-v2">
                        <label className={`radio-card ${interviewType === 'virtual' ? 'active' : ''}`}>
                            <input type="radio" value="virtual" name="interviewType" checked={interviewType === 'virtual'} onChange={(e) => setInterviewType(e.target.value)} />
                            <FiVideo className="radio-icon" />
                            <span>Virtual Session</span>
                            <small>(Video + Audio)</small>
                        </label>
                        <label className={`radio-card ${interviewType === 'voice' ? 'active' : ''}`}>
                            <input type="radio" value="voice" name="interviewType" checked={interviewType === 'voice'} onChange={(e) => setInterviewType(e.target.value)} />
                            <FiMic className="radio-icon" />
                            <span>Voice Only</span>
                            <small>(Audio Only)</small>
                        </label>
                    </div>
                </div>

                {/* --- Step 3: Generate Button --- */}
                <div className="setup-step-v2">
                    <button className="generate-button-v2" onClick={handleGenerate} disabled={isLoading}>
                        {isLoading ? 'Generating...' : <>Start My Interview <FiArrowRight /></>}
                    </button>
                </div>

                {error && <div className="error-message-v2">{error}</div>}
            </div>
        </div>
    );
};

export default CustomInterviewSetup;