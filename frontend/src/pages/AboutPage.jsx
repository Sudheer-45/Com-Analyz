import React from 'react';
import './AboutPage.css'; // We'll create this CSS file
import { FiTarget, FiAward, FiUsers, FiCpu, FiMessageSquare } from 'react-icons/fi';
// You might also need FaUserCircle, if you use it in this file
import { FaUserCircle } from 'react-icons/fa'; 
import { FaLightbulb } from 'react-icons/fa';
import { Link } from 'react-router-dom';
const AboutPage = () => {
    return (
        <div className="page-container about-page-container">
            <header className="page-header about-header">
                <h2>Our Story & Mission</h2>
                <p>Empowering every individual to master their interview skills and achieve their career aspirations.</p>
            </header>

            {/* --- Mission & Vision Section --- */}
            <section className="about-section mission-vision">
                <div className="about-content-card">
                    <h3>The Vision Behind Comm-Analyz</h3>
                    <p>
                        Comm-Analyz was born from a fundamental challenge: the difficulty of obtaining objective, actionable,
                        and affordable feedback on interview performance. Traditional mock interviews are valuable but
                        often inaccessible or subjective. Candidates need a safe space to practice, fail, and learn,
                        without the high stakes of a real interview.
                    </p>
                    <p>
                        Our mission is to democratize interview coaching by leveraging cutting-edge Artificial Intelligence.
                        We believe that everyone deserves the opportunity to present their best self, articulate their skills,
                        and build the confidence needed to succeed in any professional setting.
                    </p>
                </div>
            </section>

            {/* --- Core Values Section --- */}
            <section className="about-section core-values">
                <h3>Our Core Values</h3>
                <div className="values-grid">
                    <div className="value-item">
                        <FaLightbulb className="value-icon" />
                        <h4>Empowerment</h4>
                        <p>Providing tools that equip individuals with the skills and confidence to excel.</p>
                    </div>
                    <div className="value-item">
                        <FiCpu className="value-icon" />
                        <h4>Objectivity</h4>
                        <p>Delivering unbiased, data-driven feedback through advanced AI analysis.</p>
                    </div>
                    <div className="value-item">
                        <FiAward className="value-icon" />
                        <h4>Continuous Improvement</h4>
                        <p>Fostering a growth mindset by enabling users to track and act on their progress.</p>
                    </div>
                    <div className="value-item">
                        <FiMessageSquare className="value-icon" />
                        <h4>Clarity</h4>
                        <p>Translating complex AI insights into simple, actionable advice for better communication.</p>
                    </div>
                </div>
            </section>

            {/* --- Meet the Creator Section --- */}
            <section className="about-section team-section">
                <h3>Meet the Creator</h3>
                <div className="creator-card">
                    <div className="creator-avatar">
                        <FaUserCircle className="creator-avatar-icon" /> {/* Using FaUserCircle from react-icons/fa */}
                    </div>
                    <h4 className="creator-name">Manukonda Sai Sudheer</h4>
                    <p className="creator-role">Final Year Student | Computer Science & Engineering(Artificial Intelligence)</p>
                    <p className="creator-bio">
                        Comm-Analyz is developed as a final year project by me, an aspiring software engineer
                        with a passion for Artificial Intelligence and creating impactful technological solutions.
                        This platform is a culmination of studies in web development, AI/ML, and user experience design.
                    </p>
                    <div className="creator-social-links">
                        <a href="https://linkedin.com/in/yourprofile" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                        <a href="https://github.com/Sudheer-45" target="_blank" rel="noopener noreferrer">GitHub</a>
                    </div>
                </div>
            </section>

            {/* --- Final CTA --- */}
            <section className="about-section final-cta">
                <h3>Ready to Transform Your Interview Skills?</h3>
                <p>Join Comm-Analyz today and take the first step towards your dream career.</p>
                <Link to="/signup" className="about-cta-button">
                    Start Your Free Session
                </Link>
            </section>
        </div>
    );
};

export default AboutPage;