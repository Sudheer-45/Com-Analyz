import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; // We use the generic axios here as it's a public route
import './Footer.css';
import { FiFacebook, FiTwitter, FiLinkedin, FiGithub } from 'react-icons/fi';

const Footer = () => {
    // --- State for the newsletter form ---
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        setMessage('');

        try {
            // Call the new backend endpoint
            const response = await axios.post('http://localhost:8000/api/newsletter/subscribe', { email });
            setMessage(response.data.message);
            setEmail(''); // Clear the input field on success
        } catch (error) {
            // Display the error message from the backend
            setMessage(error.response?.data?.message || 'Subscription failed. Please try again.');
        } finally {
            setIsLoading(false);
            // Make the message disappear after a few seconds
            setTimeout(() => setMessage(''), 5000);
        }
    };

    return (
        <footer className="footer-container">
            <div className="footer-content">
                {/* ... (about and links sections remain the same) ... */}
                 <div className="footer-section about">
                    <h2 className="footer-logo">Com-Analyz</h2>
                    <p>
                        Your personal AI-powered interview coach. Practice realistic sessions, 
                        get instant, data-driven feedback, and build the confidence 
                        to land your dream job.
                    </p>
                    <div className="social-icons">
                        <a href="#" aria-label="Facebook"><FiFacebook /></a>
                        <a href="#" aria-label="Twitter"><FiTwitter /></a>
                        <a href="#" aria-label="LinkedIn"><FiLinkedin /></a>
                        <a href="https://github.com/manoj-2003" aria-label="GitHub"><FiGithub /></a>
                    </div>
                </div>

                <div className="footer-section links">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/dashboard">Dashboard</Link></li>
                        <li><Link to="/results">My History</Link></li>
                        <li><Link to="/tutor">Tutor</Link></li>
                    </ul>
                </div>

                <div className="footer-section links">
                    <h4>Resources</h4>
                    <ul>
                        <li><Link to="/about">About Us</Link></li>
                        <li><Link to="/contact">Contact</Link></li>
                        <li><Link to="/faq">FAQ</Link></li>
                        <li><Link to="#">Blog</Link></li>
                    </ul>
                </div>

                {/* --- THIS IS THE UPDATED, FUNCTIONAL FORM --- */}
                <div className="footer-section contact-form">
                    <h4>Stay Updated</h4>
                    <p>Subscribe to our newsletter for the latest tips and updates.</p>
                    <form onSubmit={handleSubscribe}>
                        <input 
                            type="email" 
                            name="email" 
                            placeholder="Your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <button type="submit" disabled={isLoading}>
                            {isLoading ? 'Subscribing...' : 'Subscribe'}
                        </button>
                    </form>
                    {message && <p className="newsletter-message">{message}</p>}
                </div>
            </div>

            <div className="footer-bottom">
                <p>© {new Date().getFullYear()} Comm-Analyz. All Rights Reserved.</p>
                <div className="footer-legal-links">
                    <Link to="#">Privacy Policy</Link>
                    <span>|</span>
                    <Link to="#">Terms of Service</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;