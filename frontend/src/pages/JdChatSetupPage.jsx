import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './JdChatSetupPage.css'; // Import its dedicated CSS file

const JdChatSetupPage = () => {
    const [jobDescription, setJobDescription] = useState('');
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Handles file selection and reads content for .txt files
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setJobDescription(''); // Clear text area if file is chosen
            setError('');

            if (selectedFile.type === 'text/plain') {
                const reader = new FileReader();
                reader.onload = (event) => {
                    setJobDescription(event.target.result);
                };
                reader.readAsText(selectedFile);
            } else {
                setError("Only plain text (.txt) files are directly supported for content extraction. For PDF/DOCX, please paste the text content manually.");
                setFile(null); // Clear file selection if unsupported
            }
        }
    };

    // Handles starting the chat session
    const handleStartChat = async () => {
        if (!jobDescription.trim()) {
            setError("Please paste a Job Description or select a text file.");
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            const response = await axios.post('http://localhost:5001/start-jd-chat', {
                job_description: jobDescription
            });

            // Navigate to the chat page, passing session ID and initial message
            navigate('/ai-chat', {
                state: {
                    sessionId: response.data.session_id,
                    initialAiMessage: response.data.initial_ai_message,
                    jobDescription: jobDescription // Pass JD for display in chat
                }
            });

        } catch (err) {
            console.error('Error starting JD chat:', err.response ? err.response.data : err.message);
            setError(err.response?.data?.error || "Failed to start AI chat. Please ensure your backend is running and configured correctly.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="jd-setup-page">
            <div className="jd-setup-card">
                <h1 className="jd-setup-title">
                    AI Study Plan Chat
                </h1>
                <p className="jd-setup-subtitle">
                    Paste your Job Description below to get personalized study guidance from our AI coach.
                </p>

                {/* Textarea for Job Description Input */}
                <div className="jd-textarea-container">
                    <textarea
                        placeholder="Paste Job Description here..."
                        value={jobDescription}
                        onChange={(e) => {
                            setJobDescription(e.target.value);
                            setFile(null); // Clear file selection if typing in textarea
                            setError('');
                        }}
                        rows="15"
                        className="jd-textarea"
                    />
                </div>

                {/* File Upload Input */}
                <div className="jd-file-upload-area">
                    <label htmlFor="file-upload" className="jd-file-upload-label">
                        Or Upload a .txt File
                    </label>
                    <input
                        id="file-upload"
                        type="file"
                        accept=".txt" // Only .txt for direct reading. Extend with backend parsing for PDF/DOCX.
                        onChange={handleFileChange}
                        className="jd-file-input"
                    />
                    {file && <p className="jd-selected-file-name">Selected file: {file.name}</p>}
                </div>

                {/* Error Message Display */}
                {error && (
                    <div className="jd-error-message" role="alert">
                        {error}
                    </div>
                )}

                {/* Start Chat Button */}
                <button
                    onClick={handleStartChat}
                    disabled={isLoading || !jobDescription.trim()}
                    className="jd-start-chat-button"
                >
                    {isLoading ? 'Starting AI Chat...' : 'Start AI Chat'}
                </button>
            </div>
        </div>
    );
};

export default JdChatSetupPage;
