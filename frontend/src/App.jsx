import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// --- Component Imports ---
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// --- Page Imports ---
import MarketingHomePage from './pages/MarketingHomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';                 // The logged-in home/lobby page
import DashboardPage from './pages/DashboardPage';       // The metrics/stats page
import ResultsHistoryPage from './pages/ResultsHistoryPage'; // The page listing all past sessions
import ResultPage from './pages/ResultPage';             // The page for one detailed report
import TutorPage from './pages/TutorPage';            // You would create and import this page
import InterviewSession from './pages/InterviewSession.jsx';
import CustomInterviewSetup from './pages/CustomInterviewSetup.jsx';
// ... other imports
import CuratedInterviewSetup from './pages/CuratedInterviewSetup.jsx';
import VerifyOtpPage from './pages/VerifyOtpPage.jsx';
import ContactPage from './pages/ContactPage'; 
import FaqPage from './pages/FaqPage'; 
import AboutPage from './pages/AboutPage';
import JdChatSetupPage from './pages/JdChatSetupPage'; // <-- NEW
import JdChatInterface from './pages/JdChatInterface';

// This small helper component is the cleanest way to direct users
// to the correct "home" page based on their login status.
const HomeRouter = () => {
    const token = localStorage.getItem('token');
    // If logged in, show the main application HomePage.
    // If not, show the public MarketingHomePage.
    return token ? <HomePage /> : <MarketingHomePage />;
};

function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <main> {/* Added a main tag for semantic HTML */}
                <Routes>
                    {/* --- Public Routes --- */}
                    <Route path="/" element={<HomeRouter />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/verify-otp" element={<VerifyOtpPage />} /> 

                    {/* --- Protected Routes (User must be logged in) --- */}
                    <Route
                        path="/dashboard"
                        element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
                    />
                    <Route
                        path="/results"
                        element={<ProtectedRoute><ResultsHistoryPage /></ProtectedRoute>}
                    />
                    <Route
                        path="/results/:id"
                        element={<ProtectedRoute><ResultPage /></ProtectedRoute>}
                    />

                    <Route
                        path="/tutor"
                        element={<ProtectedRoute><TutorPage /></ProtectedRoute>}
                    />
                    <Route
                        path="/interview-session"
                        element={<ProtectedRoute><InterviewSession /></ProtectedRoute>}
                    />
                    <Route
                        path="/custom-interview"
                        element={<ProtectedRoute><CustomInterviewSetup /></ProtectedRoute>}
                    />
                    <Route
                        path="/curated-interview-setup"
                        element={<ProtectedRoute><CuratedInterviewSetup /></ProtectedRoute>}
                    />
                    
                    <Route path="/jd-chat-setup" element={<ProtectedRoute><JdChatSetupPage /></ProtectedRoute>} />
                    <Route path="/ai-chat" element={<ProtectedRoute><JdChatInterface /></ProtectedRoute>} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/faq" element={<FaqPage />} />
                    <Route path="/about" element={<AboutPage />} /> 

                </Routes>
            </main>
            <Footer />
        </BrowserRouter>
    );
}

export default App;