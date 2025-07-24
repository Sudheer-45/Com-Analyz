import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import './ResultPage.css';
// --- FIX: Import FiArrowRight for the back link ---
import { FiChevronDown, FiChevronUp, FiArrowRight } from 'react-icons/fi'; // Import icons

const ResultPage = () => {
    const { id } = useParams();
    const [result, setResult] = useState(null);
    const [recommendedResources, setRecommendedResources] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    // State to manage visibility of model answers for each question
    const [openModelAnswers, setOpenModelAnswers] = useState({}); 

    useEffect(() => {
        const fetchResult = async () => {
            if (!id) { setError("No result ID provided."); setIsLoading(false); return; }
            try {
                const response = await api.get(`/results/${id}`);
                setResult(response.data);
                // Initialize all model answers to be closed by default
                const initialOpenState = {};
                response.data.questionAnalyses.forEach((_, index) => {
                    initialOpenState[index] = false;
                });
                setOpenModelAnswers(initialOpenState);
            } catch (err) {
                setError('Could not load interview result. It may not exist or you may not have permission to view it.');
                console.error("Error fetching result:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchResult();
    }, [id]);

    const toggleModelAnswer = (index) => {
        setOpenModelAnswers(prev => ({
            ...prev,
            [index]: !prev[index] // Toggle the boolean for the specific question
        }));
    };

    const getEmotionColor = (emotion = '') => {
        const colors = {
            happy: '#28a745', sad: '#007bff', angry: '#dc3545', neutral: '#6c757d',
            surprise: '#ffc107', fear: '#6f42c1', "no_face_detected_or_emotion_analysis_failed": "#a0aec0", "analysis_error": "#a0aec0"
        };
        return colors[emotion.toLowerCase()] || '#6c757d';
    };
    
    const getSentimentLabel = (score) => {
        if (score > 0.2) return <span style={{ color: '#2f855a' }}>Positive</span>;
        if (score < -0.2) return <span style={{ color: '#c53030' }}>Negative</span>;
        return <span style={{ color: '#718096' }}>Neutral</span>;
    };


    // --- Render Logic ---
    if (isLoading) return <div className="loading-container">Loading Your Report...</div>;
    if (error) return <div className="loading-container error"><h3>Error</h3><p>{error}</p></div>;
    if (!result) return <div className="loading-container">No result data found.</div>;

    return (
        <div className="page-container">
            {/* --- FIX: Use FiArrowRight in the back link --- */}
            <Link to="/results" className="back-link">
                <FiArrowRight style={{ transform: 'rotate(180deg)' }}/> Back to My History
            </Link>
            
            <header className="result-page-header">
                <div className="report-title">
                    <h1>Report for: {result.interviewTopic}</h1>
                    <p>Session completed on {new Date(result.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="overall-score-wrapper">
                    <span className="score-label">Overall Score</span>
                    <span className="score-value">{result.overallScore}%</span>
                </div>
            </header>

            <section className="summary-section">
                <h3>AI Coach Summary</h3>
                <p>{result.summary || "No summary was generated for this session."}</p>
            </section>

            {recommendedResources.length > 0 && (
                <section className="recommendations-section">
                    <div className="recommendations-header">
                        <FiBookOpen className="recommendation-icon" />
                        <h3>Personalized Study Plan</h3>
                    </div>
                    <p className="recommendations-description">Based on your performance, we recommend focusing on these areas:</p>
                    <ul className="recommendations-list">
                        {recommendedResources.map((rec, index) => (
                            <li key={index}>
                                <Link to="/tutor" className="recommendation-item">
                                    {rec} <FiArrowRight />
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <p className="recommendations-cta">Visit the <Link to="/tutor">Tutor Page</Link> for detailed resources on these topics.</p>
                </section>
            )}

            <section className="breakdown-section">
                <h3>Question-by-Question Analysis</h3>
                <div className="questions-container">
                    {result.questionAnalyses.map((qa, index) => (
                        <div key={index} className="question-card">
                            <h4>{index + 1}. {qa.questionText}</h4>
                            
                            <div className="transcript-box user-answer">
                                <p><strong>Your Answer:</strong> "{qa.transcribedText}"</p>
                            </div>
                            
                            {qa.modelAnswer && qa.modelAnswer !== "N/A" && (
                                <button 
                                    className="model-answer-toggle-btn"
                                    onClick={() => toggleModelAnswer(index)}
                                >
                                    View AI's Model Answer 
                                    {openModelAnswers[index] ? <FiChevronUp /> : <FiChevronDown />}
                                </button>
                            )}

                            {openModelAnswers[index] && qa.modelAnswer && qa.modelAnswer !== "N/A" && (
                                <div className="model-answer-content-v2">
                                    <p>{qa.modelAnswer}</p>
                                </div>
                            )}
                            
                            <div className="key-points-section">
                                <strong>Analysis of Key Points:</strong>
                                <ul className="key-points-list">
                                    {qa.keyPoints?.map((point, i) => (
                                        <li key={i} className={
                                            qa.transcribedText?.toLowerCase().includes(point.toLowerCase().split(' ')[0]) 
                                            ? 'mentioned' 
                                            : 'missed'
                                        }>
                                            {point}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            
                            <div className="ai-feedback-section">
                                <p><strong>AI Feedback:</strong> {qa.feedback}</p>
                            </div>

                            <div className="qa-metrics">
                                <div className="qa-metric-item">
                                    <span className="metric-title">Emotion</span>
                                    <span className="metric-data" style={{ color: getEmotionColor(qa.dominantEmotion) }}>
                                        {qa.dominantEmotion || 'N/A'}
                                    </span>
                                </div>
                                <div className="qa-metric-item">
                                    <span className="metric-title">Pace</span>
                                    <span className="metric-data">{qa.wordsPerMinute || '0'} WPM</span>
                                </div>
                                <div className="qa-metric-item">
                                    <span className="metric-title">Filler Words</span>
                                    <span className="metric-data">{qa.fillerWords?.count || 0}</span>
                                </div>
                                <div className="qa-metric-item">
                                    <span className="metric-title">Answer Tone</span>
                                    <span className="metric-data">{getSentimentLabel(qa.sentimentScore)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default ResultPage;