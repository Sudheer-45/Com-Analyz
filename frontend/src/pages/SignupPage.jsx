import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout'; // <-- Import the layout
import './AuthForm.css';
import { FiUser, FiMail, FiLock } from 'react-icons/fi'; // <-- Import icons
import signupImage from '../assets/signup-illustration.svg'; // <-- We'll need another image

const SignupPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        setError('');
        try {
            const response = await axios.post('http://localhost:8000/api/auth/register', formData);
            setMessage(response.data.message + " Redirecting to login...");
            setTimeout(() => {
            navigate('/verify-otp', { state: { email: formData.email } });
        }, 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to register. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout imageSrc={signupImage} imageAlt="Person celebrating success">
            <div className="auth-card">
                <h2 className="auth-title">Create Your Account</h2>
                <p className="auth-subtitle">Join to start improving your interview skills today!</p>
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <FiUser className="input-icon" />
                        <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <FiMail className="input-icon" />
                        <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <FiLock className="input-icon" />
                        <input type="password" name="password" placeholder="At least 6 characters" value={formData.password} onChange={handleChange} required minLength="6" />
                    </div>
                    <button type="submit" className="auth-button" disabled={isLoading}>
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>
                {message && <p className="success-message">{message}</p>}
                {error && <p className="error-message">{error}</p>}
                <p className="auth-switch">
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </AuthLayout>
    );
};

export default SignupPage;