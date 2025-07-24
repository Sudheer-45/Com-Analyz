import React from 'react';
import './TutorPage.css';
// Importing ALL necessary icons from react-icons/fi
// --- FIX: Ensure FiArrowRight is imported ---
import { FiMessageSquare, FiCode, FiUsers, FiBriefcase, FiBookOpen, FiYoutube, FiLink, FiArrowRight } from 'react-icons/fi';

// --- Helper component for Video Resource Cards ---
const VideoResourceCard = ({ videoId, title, author, description }) => (
    <div className="resource-card video-card">
        <div className="video-container">
            <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}`}
                title={title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            ></iframe>
        </div>
        <div className="card-content">
            <h3 className="card-title">{title}</h3>
            <p className="card-author">by {author}</p>
            <p className="card-description">{description}</p>
            <span className="watch-video-link"><FiYoutube /> Watch Video</span>
        </div>
    </div>
);

// --- Helper component for Article Resource Cards ---
const ArticleResourceCard = ({ url, title, source, description }) => (
    <a href={url} target="_blank" rel="noopener noreferrer" className="resource-card article-card">
        <div className="card-icon-wrapper"><FiLink className="card-icon" /></div>
        <div className="card-content">
            <h3 className="card-title">{title}</h3>
            <p className="card-author">Source: {source}</p>
            <p className="card-description">{description}</p>
        </div>
        {/* --- FIX: Changed FiArrowRightSmall to FiArrowRight --- */}
        <span className="read-more">Read More <FiArrowRight /></span>
    </a>
);

// --- Helper component for Book/Course Resource Cards ---
const BookCourseResourceCard = ({ url, title, author, description }) => (
    <a href={url} target="_blank" rel="noopener noreferrer" className="resource-card book-card">
        <div className="card-icon-wrapper"><FiBookOpen className="card-icon" /></div>
        <div className="card-content">
            <h3 className="card-title">{title}</h3>
            <p className="card-author">Author/Platform: {author}</p>
            <p className="card-description">{description}</p>
        </div>
        {/* --- FIX: Changed FiArrowRightSmall to FiArrowRight --- */}
        <span className="view-resource">View Resource <FiArrowRight /></span>
    </a>
);


const TutorPage = () => {
    return (
        <div className="page-container">
            <header className="tutor-hero-header">
                <div className="header-content">
                    <h2 className="hero-title">Your Path to Interview Mastery.</h2>
                    <p className="hero-subtitle">Access expert-curated resources to sharpen your communication, technical, and behavioral skills.</p>
                </div>
            </header>

            {/* --- Section 1: Communication Skills --- */}
            <section className="tutor-category-section">
                <div className="category-header">
                    <div className="category-icon-wrapper"><FiMessageSquare /></div>
                    <h3>Communication & Presentation Skills</h3>
                </div>
                <p className="category-description">Conveying your thoughts clearly and confidently is key. Learn to articulate your answers and project professionalism.</p>
                
                <h4>Video Guides</h4>
                <div className="resource-grid">
                    <VideoResourceCard
                        videoId="ZWRSFWsNW98"
                        title="How to Speak Confidently and Clearly"
                        author="TED"
                        description="Learn techniques for public speaking, clear articulation, and projecting an authoritative voice."
                    />
                    <VideoResourceCard
                        videoId="t3ILREyQRh4"
                        title="Mastering Interview Body Language"
                        author="The Charisma Matrix"
                        description="Understand the non-verbal cues that impact your interview performance, from posture to eye contact."
                    />
                </div>

                <h4>In-Depth Articles</h4>
                <div className="resource-grid article-grid">
                    <ArticleResourceCard 
                        url="https://www.themuse.com/advice/star-interview-method"
                        title="How to Ace Behavioral Questions with the STAR Method"
                        source="The Muse"
                        description="A step-by-step guide to structuring your answers for impactful behavioral responses."
                    />
                     <ArticleResourceCard 
                        url="https://hbr.org/2023/05/how-to-answer-what-are-your-strengths-and-weaknesses"
                        title="How to Describe Your Strengths and Weaknesses"
                        source="Harvard Business Review"
                        description="Craft compelling answers about your attributes and areas for development."
                    />
                </div>
            </section>

            {/* --- Section 2: Technical Skills (General/MERN Example) --- */}
            <section className="tutor-category-section">
                <div className="category-header">
                    <div className="category-icon-wrapper"><FiCode /></div>
                    <h3>Technical Skills Deep Dive</h3>
                </div>
                <p className="category-description">Solidify your technical foundations across various domains. (Example: MERN Stack)</p>

                <h4>Video Guides</h4>
                <div className="resource-grid">
                    <VideoResourceCard
                        videoId="RVFAyFWO4go"
                        title="React JS Full Course for Beginners"
                        author="Dave Gray"
                        description="A comprehensive introduction to the fundamentals of React, from components to hooks."
                    />
                    <VideoResourceCard
                        videoId="Oe421EPjeBE"
                        title="Node.js and Express.js - Full Course"
                        author="freeCodeCamp.org"
                        description="Everything you need to build robust backend APIs with Node.js and Express."
                    />
                </div>
                
                <h4>Recommended Books & Courses</h4>
                <div className="resource-grid article-grid">
                    <BookCourseResourceCard
                        url="https://react.dev/learn"
                        title="The Official React Documentation"
                        author="react.dev"
                        description="The best and most up-to-date resource for learning and mastering React."
                    />
                    <BookCourseResourceCard
                        url="https://www.mongodb.com/docs/atlas/getting-started/"
                        title="MongoDB Official Documentation"
                        author="MongoDB"
                        description="The comprehensive guide to NoSQL databases, Mongoose, and MongoDB Atlas."
                    />
                </div>
            </section>
            
            {/* --- Section 3: Behavioral & Career Prep --- */}
            <section className="tutor-category-section">
                <div className="category-header">
                    <div className="category-icon-wrapper"><FiBriefcase /></div>
                    <h3>Behavioral & Career Preparation</h3>
                </div>
                <p className="category-description">Navigate tough behavioral questions and prepare for your career journey. (Example: Job Search Strategies)</p>

                <h4>Video Guides</h4>
                <div className="resource-grid">
                    <VideoResourceCard
                        videoId="wehID1I-674"
                        title="How to Answer 'Tell Me About Yourself'"
                        author="Leadership Geek"
                        description="Craft a compelling and concise answer to this common interview opener."
                    />
                </div>

                <h4>In-Depth Articles</h4>
                <div className="resource-grid article-grid">
                    <ArticleResourceCard 
                        url="https://in.indeed.com/career-advice/interviewing/list-of-example-weaknesses-for-interviewing"
                        title="Addressing Your Weaknesses In An Interview"
                        source="Indeed Career Guide"
                        description="Turn a challenging question into an opportunity to highlight self-awareness and growth."
                    />
                </div>
            </section>
        </div>
    );
};

export default TutorPage;