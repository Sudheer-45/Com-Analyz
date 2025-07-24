import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig'; // Use our centralized, "smart" api client
import './HomePage.css';

const HomePage = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                // The interceptor in axiosConfig.js automatically adds the auth token.
                const response = await api.get('/users/profile');
                setUser(response.data);
            } catch (err) {
                // If the token is invalid or expired, the interceptor might fail,
                // or the server will send a 401. Redirect to login.
                console.error("Failed to fetch user profile:", err);
                navigate('/login');
            }
        };
        fetchUserProfile();
    }, [navigate]);

    // Display a loading state while fetching the user's name
    if (!user) {
        return <div className="loading-container">Loading Your Space...</div>;
    }

    return (
        <div className="home-container logged-in">
            <header className="home-header">
                <h1>Hello, {user.name}!</h1>
                <p>Welcome to your personal interview training ground. Let's get started.</p>
            </header>

            <div className="launch-section">
                <h2>Choose Your Practice Mode</h2>
                <div className="options-container">
                    <div className="option-card" onClick={() => navigate('/custom-interview')}>
                        <div className="option-icon">✏️</div>
                        <h3>Customized Interview</h3>
                        <p>Create a unique session based on a job role, description, or your own prompt. Perfect for targeted practice.</p>
                    </div>


                    <div className="option-card" onClick={() => navigate('/curated-interview-setup')}>
                        <div className="option-icon">🎯</div>
                        <h3>Curated Interview</h3>
                        <p>Select from our expert-designed interview paths. Choose a domain and difficulty to test your skills.</p>
                    </div>

                     <div className="option-card study-plan-card" onClick={() => navigate('/jd-chat-setup')}> {/* <-- ADD THIS CLASS */}
                        <div className="option-icon">💬</div>
                        <h3>AI Study Plan Chat</h3>
                        <p>Upload a Job Description and chat with an AI expert to clarify requirements, ask questions, and prepare deeply.</p>
                    </div>
                </div>
            </div>

            <div className="guidance-section">
                <h2>How to Get the Best Results</h2>
                <div className="guidance-grid">
                    <div className="guidance-item">
                        <div className="guidance-number">1</div>
                        <div className="guidance-text">
                            <h4>Find a Quiet Space</h4>
                            <p>Ensure you're in a well-lit, quiet room to allow our AI to accurately analyze your voice and expressions without interference.</p>
                        </div>
                    </div>
                    <div className="guidance-item">
                        <div className="guidance-number">2</div>
                        <div className="guidance-text">
                            <h4>Speak Clearly</h4>
                            <p>Articulate your answers clearly and at a natural pace. This helps with accurate transcription and pace analysis.</p>
                        </div>
                    </div>
                    <div className="guidance-item">
                        <div className="guidance-number">3</div>
                        <div className="guidance-text">
                            <h4>Be Yourself</h4>
                            <p>The goal is to get authentic feedback. Answer as you would in a real interview. Our AI will provide insights to help you improve.</p>
                        </div>
                    </div>
                    <div className="guidance-item">
                        <div className="guidance-number">4</div>
                        <div className="guidance-text">
                            <h4>Review Your Dashboard</h4>
                            <p>After each session, visit your <Link to="/dashboard">Dashboard</Link> to see detailed metrics and track your progress over time.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;