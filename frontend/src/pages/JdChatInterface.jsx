import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { LuSend } from 'react-icons/lu'; // Example icon for send button
import './JdChatInterface.css'; // Import its dedicated CSS file
import './JdChatSetupPage.css'; // Import JdChatSetupPage.css for shared loading styles

// Ensure you install react-icons: npm install react-icons

const JdChatInterface = () => {
    const location = useLocation();
    const navigate = useNavigate();
    // Destructure state, provide default empty object to prevent errors if state is null
    const { sessionId, initialAiMessage, jobDescription } = location.state || {};

    const [chatHistory, setChatHistory] = useState([]);
    const [userMessage, setUserMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const chatEndRef = useRef(null); // Ref for auto-scrolling

    // Effect to initialize chat history and handle session redirection
    useEffect(() => {
        if (!sessionId) {
            // If no session ID, redirect back to the setup page
            navigate('/ai-study-plan', { replace: true });
            return;
        }
        // Initialize chat history with the initial AI message from the backend
        setChatHistory([
            { type: 'ai', text: initialAiMessage }
        ]);
    }, [sessionId, initialAiMessage, navigate]); // Dependencies to re-run effect if these change

    // Effect for auto-scrolling to the latest message
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]); // Re-run when chatHistory updates

    // Function to handle sending a message
    const handleSendMessage = async () => {
        if (!userMessage.trim() || isLoading) return; // Prevent sending empty messages or multiple messages while loading

        const newUserMessage = userMessage;
        // Add user's message to chat history immediately
        setChatHistory(prev => [...prev, { type: 'user', text: newUserMessage }]);
        setUserMessage(''); // Clear input field
        setIsLoading(true); // Set loading state
        setError(''); // Clear any previous errors

        try {
            // Make API call to the backend chat endpoint
            const response = await axios.post('http://localhost:5001/jd-chat', {
                session_id: sessionId,
                user_message: newUserMessage
            });

            // Add AI's response to chat history
            setChatHistory(prev => [...prev, { type: 'ai', text: response.data.ai_message }]);
        } catch (err) {
            console.error('Error in JD chat:', err.response ? err.response.data : err.message);
            const errorMessage = err.response?.data?.error || "Failed to get AI response. Please try again.";
            setError(errorMessage);
            // Optionally, mark the last user message as errored for visual feedback
            setChatHistory(prev => {
                const updated = [...prev];
                // Find the last user message and add an error flag
                const lastUserMsgIndex = updated.map(msg => msg.type).lastIndexOf('user');
                if (lastUserMsgIndex !== -1) {
                    updated[lastUserMsgIndex] = { ...updated[lastUserMsgIndex], error: true, errorMessage: errorMessage };
                }
                return updated;
            });
        } finally {
            setIsLoading(false); // Reset loading state
        }
    };

    // Render a loading state or redirect message if session ID is not available yet
    if (!sessionId) {
        return (
            <div className="jd-setup-page"> {/* Reusing some setup page styles for centering */}
                <p className="jd-setup-subtitle">Loading chat session or redirecting...</p>
            </div>
        );
    }

    return (
        <div className="chat-interface-page">
            {/* Header and New Chat Button */}
            <div className="chat-header">
                <h1 className="chat-title">AI Study Plan Chat</h1>
                <button
                    onClick={() => navigate('/jd-chat-setup')}
                    className="new-chat-button"
                >
                    Start New Chat / Change JD
                </button>
            </div>

            {/* Job Description Context Display */}
            {jobDescription && (
                <div className="jd-context-display">
                    <strong className="jd-context-title">Job Description Context:</strong>
                    <p className="jd-context-text">{jobDescription}</p>
                </div>
            )}

            {/* Chat History Display Area */}
            <div className="chat-history-area">
                {chatHistory.map((msg, index) => (
                    <div
                        key={index}
                        className={`message-container ${msg.type === 'user' ? 'message-user' : 'message-ai'}`}
                    >
                        <div
                            className={`message-bubble ${msg.type === 'user' ? 'message-user-bubble' : 'message-ai-bubble'} ${msg.error ? 'error' : ''}`}
                        >
                            {msg.text}
                            {msg.error && (
                                <span className="message-error-text">
                                    Error: {msg.errorMessage}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
                {/* AI Typing Indicator */}
                {isLoading && (
                    <div className="ai-typing-indicator">
                        <div className="ai-typing-bubble">
                            AI is typing...
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} /> {/* Element to scroll into view */}
            </div>

            {/* General Error Message */}
            {error && (
                <div className="general-error-message" role="alert">
                    {error}
                </div>
            )}

            {/* Message Input Area */}
            <div className="message-input-area">
                <input
                    type="text"
                    placeholder="Ask about the job description..."
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    onKeyPress={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                    disabled={isLoading}
                    className="message-input"
                />
                <button
                    onClick={handleSendMessage}
                    disabled={isLoading || !userMessage.trim()}
                    className="send-button"
                    aria-label="Send message"
                >
                    <LuSend className="send-button-icon" /> {/* Send icon */}
                </button>
            </div>
        </div>
    );
};

export default JdChatInterface;
