import React, { createContext, useState, useEffect } from 'react';

// 1. Create the context
export const AuthContext = createContext(null);

// 2. Create the provider component
export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

    // This function will be called from the LoginPage
    const login = (token) => {
        localStorage.setItem('token', token);
        setIsLoggedIn(true);
    };

    // This function will be called from the Navbar
    const logout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
    };

    // The value that will be available to all consuming components
    const value = {
        isLoggedIn,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};