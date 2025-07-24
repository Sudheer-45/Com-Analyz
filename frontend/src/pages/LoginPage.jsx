import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout'; // <-- Import the layout
import './AuthForm.css'; // <-- The shared form styles
import { FiMail, FiLock } from 'react-icons/fi'; // <-- Import icons
import loginImage from '../assets/login-illustration.svg'; // <-- We'll need an image

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useContext(AuthContext); 
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const response = await axios.post('http://localhost:8000/api/auth/login', { email, password });
            login(response.data.token);
            navigate('/'); 
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to login.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout imageSrc={loginImage} imageAlt="Person working on a laptop">
            <div className="auth-card">
                <h2 className="auth-title">Welcome Back!</h2>
                <p className="auth-subtitle">Log in to continue your journey to interview mastery.</p>
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <FiMail className="input-icon" />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <FiLock className="input-icon" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="auth-button" disabled={isLoading}>
                        {isLoading ? 'Logging In...' : 'Login'}
                    </button>
                </form>
                {error && <p className="error-message">{error}</p>}
                <p className="auth-switch">
                    Don't have an account? <Link to="/signup">Sign Up</Link>
                </p>
            </div>
        </AuthLayout>
    );
};

export default LoginPage;   