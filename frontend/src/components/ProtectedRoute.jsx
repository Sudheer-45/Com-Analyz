import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * A wrapper component that protects routes meant only for authenticated users.
 *
 * @param {object} props - The component's props.
 * @param {React.ReactNode} props.children - The component to render if the user is authenticated (e.g., <DashboardPage />).
 * @returns {React.ReactElement} Either the protected component or a redirect to the login page.
 */
const ProtectedRoute = ({ children }) => {
    // 1. Get the authentication state directly from our global AuthContext.
    const { isLoggedIn } = useContext(AuthContext);
    const location = useLocation();

    // 2. Check the authentication status.
    if (!isLoggedIn) {
        // If the context says the user is NOT logged in, redirect them to the login page.
        return <Navigate to="/login" state={{ from: location }}  replace />;
    }

    // 3. If the user IS logged in, render the child components.
    return children;
};

export default ProtectedRoute;