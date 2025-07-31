import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import './CuratedInterviewSetup.css';
import { FiGrid, FiBarChart2, FiVideo, FiMic } from 'react-icons/fi'; // Icons for visual flair

// --- Reusable Custom Dropdown Component ---
const CustomDropdown = ({ label, name, value, onChange, options, icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // This effect handles closing the dropdown when clicking outside
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
        <div className="custom-dropdown" ref={dropdownRef}>
            <label>{label}</label>
            <div className="dropdown-selected" onClick={() => setIsOpen(!isOpen)}>
                <span className="dropdown-icon">{icon}</span>
                {value}
                <span className={`dropdown-caret ${isOpen ? 'open' : ''}`}>▼</span>
            </div>
            {isOpen && (
                <ul className="dropdown-options">
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

// --- Main Setup Component ---
const CuratedInterviewSetup = () => {
    const [formData, setFormData] = useState({
        domain: 'Python',
        difficulty: 'Medium',
        interviewType: 'virtual',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGenerate = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await api.post('/curated/generate', formData);
            if (!response.data || response.data.length === 0) {
                setError("The AI couldn't generate questions for this selection. Please try again.");
                setIsLoading(false);
                return;
            }
            navigate('/interview-session', {
                state: {
                    questions: response.data,
                    interviewType: formData.interviewType,
                    topic: `${formData.difficulty} ${formData.domain} Interview`,
                },
            });
        } catch (err) {
            setError(err.response?.data?.error || 'An unexpected error occurred.');
            setIsLoading(false);
        }
    };

    const domainOptions = [
        { value: 'Python', label: 'Python' }, { value: 'Java', label: 'Java' },
        { value: 'MERN Stack', label: 'MERN Stack' }, { value: 'React', label: 'React' },
        { value: 'Data Structures & Algorithms', label: 'Data Structures & Algorithms' },
        { value: 'Behavioral', label: 'Behavioral Questions' }, { value: 'SQL', label: 'SQL' },
        { value: 'C', label: 'C' }, { value: 'C++', label: 'C++' }, { value: 'C#', label: 'C#' },
        { value: 'Linux', label: 'Linux' }, { value: 'HTML', label: 'HTML' },
        { value: 'CSS', label: 'CSS' }, { value: 'JavaScript', label: 'JavaScript' }
    ];

    const difficultyOptions = [
        { value: 'Easy', label: 'Easy' }, { value: 'Medium', label: 'Medium' }, { value: 'Hard', label: 'Hard' }
    ];

    return (
        <div className="page-container">
            <header className="page-header">
                <h2>Curated Interview Paths</h2>
                <p>Select a topic and difficulty to start a standard practice session.</p>
            </header>

            <div className="curated-setup-card">
                <CustomDropdown
                    label="Choose a Domain"
                    name="domain"
                    value={formData.domain}
                    onChange={handleChange}
                    options={domainOptions}
                    icon={<FiGrid />}
                />

                <CustomDropdown
                    label="Select Difficulty"
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    options={difficultyOptions}
                    icon={<FiBarChart2 />}
                />
                
                <div className="form-group">
                    <label>Choose Your Format</label>
                    <div className="radio-group-curated">
                         <label className={`radio-label ${formData.interviewType === 'virtual' ? 'active' : ''}`}>
                            <input type="radio" value="virtual" name="interviewType" checked={formData.interviewType === 'virtual'} onChange={handleChange} />
                            <FiVideo /> Virtual
                        </label>
                        <label className={`radio-label ${formData.interviewType === 'voice' ? 'active' : ''}`}>
                            <input type="radio" value="voice" name="interviewType" checked={formData.interviewType === 'voice'} onChange={handleChange} />
                            <FiMic /> Voice Only
                        </label>
                    </div>
                </div>

                <button className="generate-button-curated" onClick={handleGenerate} disabled={isLoading}>
                    {isLoading ? 'Generating...' : 'Start Interview'}
                </button>
                
                {error && <div className="error-message-curated">{error}</div>}
            </div>
        </div>
    );
};

export default CuratedInterviewSetup;