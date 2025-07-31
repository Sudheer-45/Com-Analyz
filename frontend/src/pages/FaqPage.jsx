import React, { useState } from 'react';
import './FaqPage.css'; // We'll create this CSS file
import { FiPlusCircle, FiMinusCircle } from 'react-icons/fi'; // Icons for accordion toggle

// Helper component for each FAQ item
const FaqItem = ({ question, answer, isOpen, onToggle }) => (
    <div className={`faq-item ${isOpen ? 'open' : ''}`}>
        <button className="faq-question-button" onClick={onToggle}>
            {question}
            <span className="faq-toggle-icon">
                {isOpen ? <FiMinusCircle /> : <FiPlusCircle />}
            </span>
        </button>
        {isOpen && (
            <div className="faq-answer-content">
                <p>{answer}</p>
            </div>
        )}
    </div>
);


const FaqPage = () => {
    // State to manage which FAQ item is open
    // Stores the index of the open item, or null if none are open
    const [openItem, setOpenItem] = useState(null);

    const faqData = [
        {
            question: "What is Comm-Analyz?",
            answer: "Comm-Analyz is an AI-powered interview coaching platform that helps you practice interview questions, receive instant feedback on your communication and presentation skills, and track your progress to improve for your next job interview."
        },
        {
            question: "How does the AI provide feedback?",
            answer: "Our AI uses advanced models for Speech-to-Text transcription, Facial Emotion Recognition, sentiment analysis, and filler word detection. It analyzes your answers and provides a detailed report, including an overall score, feedback on clarity and relevance, and specific suggestions."
        },
        {
            question: "What's the difference between 'Customized Interview' and 'Curated Interview'?",
            answer: "In a 'Customized Interview', you provide a prompt (like a job description or role), and our AI generates unique questions tailored to your input. A 'Curated Interview' allows you to choose from expert-designed paths based on domain (e.g., Python, MERN Stack) and difficulty (Easy, Medium, Hard)."
        },
        {
            question: "Can I practice in voice-only mode?",
            answer: "Yes, Comm-Analyz supports both 'Virtual' (video + audio) and 'Voice Only' (audio only) interview sessions. You can choose your preferred format during the setup of your practice session."
        },
        {
            question: "Is my data private and secure?",
            answer: "Absolutely. All your practice sessions are private and not shared. Your data is stored securely in our database, and we prioritize your privacy and confidentiality."
        },
        {
            question: "How often do API quotas reset?",
            answer: "The AI services we use (like Google Gemini API) have free tier quotas that typically reset every 24 hours. If you encounter an 'AI unavailable' error, you may have hit the daily limit. It will reset the next day."
        },
        {
            question: "How can I improve my score?",
            answer: "After each session, review your detailed report and look at the AI's feedback and model answers. Visit our 'Tutor' page for resources tailored to communication, technical skills, and behavioral preparation. Consistent practice is key!"
        }
    ];

    const handleToggle = (index) => {
        setOpenItem(openItem === index ? null : index); // Toggle open/close or close if already open
    };

    return (
        <div className="page-container faq-page-container">
            <header className="page-header">
                <h2>Frequently Asked Questions</h2>
                <p>Find quick answers to the most common questions about Comm-Analyz.</p>
            </header>

            <section className="faq-section">
                <div className="faq-grid">
                    {faqData.map((faq, index) => (
                        <FaqItem
                            key={index}
                            question={faq.question}
                            answer={faq.answer}
                            isOpen={openItem === index}
                            onToggle={() => handleToggle(index)}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default FaqPage;