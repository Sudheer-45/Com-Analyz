import React from 'react';
import { Link } from 'react-router-dom';
import './MarketingHomePage.css';
// Importing beautiful icons for each section
import { FiTarget, FiMic, FiBarChart2, FiZap, FiClock, FiShield } from 'react-icons/fi';

const MarketingHomePage = () => {
    return (
        <div className="home-container-marketing">
            {/* --- Hero Section --- */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">Master Your Interviews with AI</h1>
                    <p className="hero-subtitle">
                        Comm-Analyz is your personal interview coach. Practice realistic sessions, get instant, data-driven feedback, and build the confidence to land your dream job.
                    </p>
                    <Link to="/signup" className="hero-cta-button">
                        Start Practicing for Free
                    </Link>
                </div>
                {/* Decorative background shapes */}
                <div className="hero-shape shape-1"></div>
                <div className="hero-shape shape-2"></div>
                <div className="hero-shape shape-3"></div>
            </section>

            {/* --- How It Works Section --- */}
            <section className="features-section">
                <h2 className="section-title">A Simple Path to Success</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon"><FiTarget /></div>
                        <h3>1. Define Your Goal</h3>
                        <p>Choose a curated interview path for your domain or generate a custom session tailored to a specific job description.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon"><FiMic /></div>
                        <h3>2. Practice Your Response</h3>
                        <p>Engage in a voice-only or full virtual interview. Our AI listens, watches, and analyzes your performance in real-time.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon"><FiBarChart2 /></div>
                        <h3>3. Receive In-Depth Analysis</h3>
                        <p>Get an instant, detailed report on your clarity, tone, filler words, and even your non-verbal cues.</p>
                    </div>
                </div>
            </section>

            {/* --- "Why Choose Us?" Section --- */}
            <section className="why-us-section">
                <h2 className="section-title">Why Comm-Analyz?</h2>
                <div className="why-us-grid">
                    <div className="why-us-item">
                        <FiZap className="why-us-icon" />
                        <h4>Instant, Objective Feedback</h4>
                        <p>No more waiting or subjective opinions. Get immediate, data-driven insights on your performance.</p>
                    </div>
                    <div className="why-us-item">
                        <FiClock className="why-us-icon" />
                        <h4>Practice Anytime, Anywhere</h4>
                        <p>Our AI coach is available 24/7, allowing you to practice whenever and wherever you feel most comfortable.</p>
                    </div>
                    <div className="why-us-item">
                        <FiShield className="why-us-icon" />
                        <h4>Private & Confidential</h4>
                        <p>Your practice sessions are completely private, creating a safe space to build confidence without pressure.</p>
                    </div>
                </div>
            </section>

            {/* --- Final CTA Section --- */}
            <section className="final-cta-section">
                <h2>Ready to Ace Your Next Interview?</h2>
                <p>Your journey to interview mastery starts now.</p>
                <Link to="/signup" className="hero-cta-button">
                    Get Started - It's Free
                </Link>
            </section>
        </div>
    );
};

export default MarketingHomePage;