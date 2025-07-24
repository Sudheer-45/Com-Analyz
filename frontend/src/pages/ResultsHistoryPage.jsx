import React, { useState, useEffect, useRef } from 'react'; // <-- Import useRef
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import './ResultsHistoryPage.css';
import { FiSearch, FiMic, FiVideo, FiFilter } from 'react-icons/fi'; // <-- Added FiFilter icon

// --- Reusable Custom Dropdown Component (copied from CuratedInterviewSetup.jsx) ---
// This is essential for custom dropdown styling
const CustomDropdown = ({ label, name, value, onChange, options, icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        onChange({ target: { name, value: optionValue } });
        setIsOpen(false);
    };

    return (
        <div className="custom-history-dropdown" ref={dropdownRef}>
            <label className="sr-only">{label}</label> {/* Hidden label for accessibility */}
            <div className="dropdown-selected-history" onClick={() => setIsOpen(!isOpen)}>
                <span className="dropdown-icon-history">{icon}</span>
                {options.find(opt => opt.value === value)?.label || value} {/* Display label not just value */}
                <span className={`dropdown-caret-history ${isOpen ? 'open' : ''}`}>▼</span>
            </div>
            {isOpen && (
                <ul className="dropdown-options-history">
                    {options.map((option) => (
                        <li key={option.value} onClick={() => handleSelect(option.value)}>
                            {option.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};


const ResultsHistoryPage = () => {
    const [allResults, setAllResults] = useState([]);
    const [filteredResults, setFilteredResults] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchResultsHistory = async () => {
            setIsLoading(true);
            try {
                const response = await api.get('/results/my-results');
                setAllResults(response.data);
                setFilteredResults(response.data);
            } catch (err) {
                console.error("Failed to fetch results history:", err);
                navigate('/login');
            } finally {
                setIsLoading(false);
            }
        };
        fetchResultsHistory();
    }, [navigate]);

    useEffect(() => {
        let currentResults = [...allResults];
        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            currentResults = currentResults.filter(result =>
                result.interviewTopic.toLowerCase().includes(lowerCaseSearchTerm) ||
                (result.questionAnalyses && result.questionAnalyses.some(qa => 
                    qa.questionText.toLowerCase().includes(lowerCaseSearchTerm) ||
                    (qa.transcribedText && qa.transcribedText.toLowerCase().includes(lowerCaseSearchTerm))
                ))
            );
        }
        if (filterType !== 'All') {
            currentResults = currentResults.filter(result => result.interviewType === filterType);
        }
        setFilteredResults(currentResults);
    }, [searchTerm, filterType, allResults]);

    const getInterviewTypeIcon = (type) => {
        return type === 'virtual' ? <FiVideo /> : <FiMic />;
    };

    const filterOptions = [
        { value: 'All', label: 'All Formats' },
        { value: 'virtual', label: 'Virtual' },
        { value: 'voice', label: 'Voice Only' },
    ];

    if (isLoading) {
        return <div className="loading-container">Loading Your Session History...</div>;
    }

    return (
        <div className="page-container">
            <header className="page-header">
                <h2>My Interview History</h2>
                <p>Review each of your past practice sessions to see detailed feedback.</p>
            </header>

            {/* --- NEW: Search and Filter Control Card (Glassmorphism) --- */}
            <div className="history-controls-card">
                <div className="search-group">
                    <FiSearch className="search-icon-v2" />
                    <input
                        type="text"
                        placeholder="Search by topic, question, or answer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input-v2"
                    />
                </div>
                {/* Visual divider */}
                <div className="controls-divider"></div>
                <CustomDropdown
                    label="Filter by Type"
                    name="filterType"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    options={filterOptions}
                    icon={<FiFilter />}
                />
            </div>

            <div className="results-list-container">
                {filteredResults.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Interview Topic</th>
                                <th>Format</th>
                                <th>Overall Score</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredResults.map((result) => (
                                <tr key={result._id}>
                                    <td data-label="Date">{new Date(result.createdAt).toLocaleDateString()}</td>
                                    <td data-label="Topic">{result.interviewTopic}</td>
                                    <td data-label="Format">
                                        <span className="format-cell">
                                            {getInterviewTypeIcon(result.interviewType)}
                                            {result.interviewType.charAt(0).toUpperCase() + result.interviewType.slice(1)}
                                        </span>
                                    </td>
                                    <td data-label="Score">
                                        <span className={`score-badge ${result.overallScore > 85 ? 'excellent' : (result.overallScore > 60 ? 'good' : 'average')}`}>
                                            {result.overallScore}%
                                        </span>
                                    </td>
                                    <td data-label="Action">
                                        <Link to={`/results/${result._id}`} className="view-report-btn">View Detailed Report</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="no-results-message">
                        <h3>No Matching History</h3>
                        <p>No sessions found matching your search and filter criteria.</p>
                        <Link to="/" className="start-practice-btn">
                            Start a New Practice Session
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResultsHistoryPage;