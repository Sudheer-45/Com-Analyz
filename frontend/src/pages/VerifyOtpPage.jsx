import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import './AuthForm.css';
import { FiKey } from 'react-icons/fi';
import otpImage from '../assets/otp-illustartion.svg';

const VerifyOtpPage = () => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    
    const email = location.state?.email;

    useEffect(() => {
        if (!email) navigate('/signup');
    }, [email, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const response = await axios.post('http://localhost:8000/api/auth/verify-otp', { email, otp });
            login(response.data.token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to verify OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout imageSrc={otpImage} imageAlt="Person entering a code on a secure page">
            <div className="auth-card">
                <h2 className="auth-title">Check Your Email</h2>
                <p className="auth-subtitle">We've sent a 6-digit verification code to <strong>{email}</strong>. Please enter it below.</p>
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <FiKey className="input-icon" />
                        <input
                            type="text"
                            placeholder="6-Digit Code"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength="6"
                            required
                        />
                    </div>
                    <button type="submit" className="auth-button" disabled={isLoading}>
                        {isLoading ? 'Verifying...' : 'Verify & Login'}
                    </button>
                </form>
                {error && <p className="error-message">{error}</p>}
            </div>
        </AuthLayout>
    );
};
export default VerifyOtpPage;