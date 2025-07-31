import React, { useState } from 'react';
import axios from 'axios'; // Using generic axios for public route
import './ContactPage.css'; // We'll create this CSS file
import { FiMail, FiPhone, FiMapPin, FiMessageSquare } from 'react-icons/fi'; // Icons
import { Link } from 'react-router-dom';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setFeedbackMessage('');
        setIsError(false);

        try {
            const response = await axios.post('http://localhost:8000/api/contact/submit', formData);
            setFeedbackMessage(response.data.message);
            setFormData({ name: '', email: '', subject: '', message: '' }); // Clear form
        } catch (err) {
            setFeedbackMessage(err.response?.data?.message || 'Failed to send message. Please try again.');
            setIsError(true);
        } finally {
            setIsLoading(false);
            setTimeout(() => { setFeedbackMessage(''); setIsError(false); }, 5000); // Clear message
        }
    };

    return (
        <div className="page-container contact-page-container">
            <header className="page-header">
                <h2>Get in Touch</h2>
                <p>We'd love to hear from you. Please fill out the form below or use the contact details provided.</p>
            </header>

            <div className="contact-content-grid">
                {/* --- Contact Information Section --- */}
                <div className="contact-info-card">
                    <h3>Contact Information</h3>
                    <p>Have a question or need support? Reach out to us through the following channels:</p>
                    <div className="info-item">
                        <FiMail className="info-icon" />
                        <span>saisudheermanukoda119@gmail.com</span>
                    </div>
                    <div className="info-item">
                        <FiPhone className="info-icon" />
                        <span>+91 9505813015</span>
                    </div>
                    <div className="info-item">
                        <FiMapPin className="info-icon" />
                        <span>Guntur, Andhra Pradesh, India</span>
                    </div>
                    <div className="info-item">
                        <FiMessageSquare className="info-icon" />
                        <span><Link to="/faq">Visit our FAQ page</Link></span>
                    </div>
                </div>

                {/* --- Contact Form Section --- */}
                <div className="contact-form-card">
                    <h3>Send Us a Message</h3>
                    <form onSubmit={handleSubmit} className="contact-form">
                        <div className="form-group">
                            <label htmlFor="name">Your Name</label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Your Email</label>
                            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="subject">Subject</label>
                            <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="message">Message</label>
                            <textarea id="message" name="message" value={formData.message} onChange={handleChange} rows="5" required></textarea>
                        </div>
                        <button type="submit" className="submit-contact-btn" disabled={isLoading}>
                            {isLoading ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                    {feedbackMessage && <p className={`contact-feedback-message ${isError ? 'error' : 'success'}`}>{feedbackMessage}</p>}
                </div>
            </div>
        </div>
    );
};

export default ContactPage;