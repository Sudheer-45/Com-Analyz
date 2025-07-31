import React, { useState, useContext, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    // ... (All of your existing state and functions remain the same)
    const navigate = useNavigate();
    const location = useLocation();
    const { isLoggedIn, logout } = useContext(AuthContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        setIsMenuOpen(false);
    }, [location]);

    useEffect(() => {
        if (isMenuOpen) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
        return () => document.body.classList.remove('no-scroll');
    }, [isMenuOpen]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            <div 
                className={`menu-overlay ${isMenuOpen ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
            ></div>

            <header className="navbar-header">
                <nav className="navbar-container">
                    <NavLink to="/" className="navbar-logo">
                        Com-Analyz
                    </NavLink>

                    <button 
                        className="menu-toggle" 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle navigation menu"
                        aria-expanded={isMenuOpen}
                    >
                        <span className="bar"></span>
                        <span className="bar"></span>
                        <span className="bar"></span>
                    </button>

                    <ul className={`navbar-links ${isMenuOpen ? 'open' : ''}`}>
                        {isLoggedIn ? (
                            <>
                                <li><NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Home</NavLink></li>
                                <li><NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Dashboard</NavLink></li>
                                <li><NavLink to="/results" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>History</NavLink></li>
                                <li><NavLink to="/tutor" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Tutor</NavLink></li>
                                
                                {/* --- THIS IS THE ONLY CHANGE IN THIS FILE --- */}
                                {/* Added className="navbar-action-item" to the <li> */}
                                <li className="navbar-action-item">
                                    <button onClick={handleLogout} className="navbar-button secondary">Logout</button>
                                </li>
                            </>
                        ) : (
                            <>  
                                <li><NavLink to="/" className="nav-link">Home</NavLink></li>
                                <li><NavLink to="/login" className="nav-link">Login</NavLink></li>
                                <li className="navbar-action-item"><NavLink to="/signup" className="navbar-button primary">Sign Up</NavLink></li>
                            </>
                        )}
                    </ul>
                </nav>
            </header>
        </>
    );
};

export default Navbar;