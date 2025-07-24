import React from 'react';
import './AuthLayout.css'; // We'll create this CSS file

// This component provides the beautiful two-column layout for our auth pages
const AuthLayout = ({ children, imageSrc, imageAlt }) => {
    return (
        <div className="auth-page-container">
            <div className="auth-form-panel">
                {children}
            </div>
            <div className="auth-image-panel">
                <img src={imageSrc} alt={imageAlt} />
            </div>
        </div>
    );
};

export default AuthLayout;