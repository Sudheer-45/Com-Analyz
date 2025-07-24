import React, { useState, useEffect, useContext } from 'react'; // <-- Import useContext
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import './DashboardPage.css';
import { FaUserCircle, FaAward } from "react-icons/fa"; // Using FaUserCircle for avatar icon

// Import Chart.js components
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, ArcElement, Title, Tooltip, Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Import AuthContext
import { AuthContext } from '../context/AuthContext'; // <-- Import AuthContext

// Register Chart.js components
ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement, BarElement,
    ArcElement, Title, Tooltip, Legend
);

// Helper function to process all data at once (remains unchanged, as it's robust)
const processDashboardData = (results) => {
    if (!results || results.length === 0) {
        return {
            metrics: { avgScore: 0, avgPace: 0, primaryEmotion: 'N/A', sessionsDone: 0 },
            charts: {
                scoreData: { labels: [], datasets: [] },
                paceData: { labels: [], datasets: [] },
                emotionData: { labels: [], datasets: [] },
            }
        };
    }

    const sessionsDone = results.length;
    const totalScore = results.reduce((acc, r) => acc + (r.overallScore || 0), 0);
    const avgScore = sessionsDone > 0 ? Math.round(totalScore / sessionsDone) : 0;

    const emotionCounts = {};
    let totalPaceSum = 0;
    let sessionsWithPace = 0;

    results.forEach(result => {
        let sessionPaceSum = 0;
        let paceCount = 0;
        if (result.questionAnalyses?.length > 0) {
            result.questionAnalyses.forEach(qa => {
                if (qa.wordsPerMinute) {
                    sessionPaceSum += qa.wordsPerMinute;
                    paceCount++;
                }
                const emotion = qa.dominantEmotion || 'N/A';
                emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
            });
        }
        if (paceCount > 0) {
            totalPaceSum += (sessionPaceSum / paceCount);
            sessionsWithPace++;
        }
    });

    const avgPace = sessionsWithPace > 0 ? Math.round(totalPaceSum / sessionsWithPace) : 0;
    const primaryEmotion = Object.keys(emotionCounts).length > 0
        ? Object.keys(emotionCounts).reduce((a, b) => emotionCounts[a] > emotionCounts[b] ? a : b)
        : 'N/A';

    const metrics = {
        avgScore,
        avgPace,
        primaryEmotion: primaryEmotion.charAt(0).toUpperCase() + primaryEmotion.slice(1),
        sessionsDone,
    };

    const reversedResults = [...results].reverse();
    const chartLabels = reversedResults.map(r => new Date(r.createdAt).toLocaleDateString());

    const scoreData = {
        labels: chartLabels,
        datasets: [{
            label: 'Overall Score %', data: reversedResults.map(r => r.overallScore),
            borderColor: '#667eea', backgroundColor: 'rgba(102, 126, 234, 0.2)',
            fill: true, tension: 0.4,
        }],
    };

    const emotionData = {
        labels: Object.keys(emotionCounts),
        datasets: [{
            label: 'Emotion Count', data: Object.values(emotionCounts),
            backgroundColor: ['rgba(40, 167, 69, 0.8)', 'rgba(108, 117, 125, 0.8)', 'rgba(255, 193, 7, 0.8)', 'rgba(0, 123, 255, 0.8)', 'rgba(220, 53, 69, 0.8)', 'rgba(111, 66, 193, 0.8)'],
            borderColor: 'white', borderWidth: 2,
        }],
    };

    const paceData = {
        labels: chartLabels,
        datasets: [{
            label: 'Average Pace (WPM)',
            data: reversedResults.map(r => {
                const questionPaces = r.questionAnalyses.map(qa => qa.wordsPerMinute || 0);
                return questionPaces.length > 0 ? Math.round(questionPaces.reduce((a, b) => a + b) / questionPaces.length) : 0;
            }),
            backgroundColor: 'rgba(118, 75, 162, 0.7)', borderColor: '#764ba2', borderWidth: 1,
        }],
    };

    return { metrics, charts: { scoreData, paceData, emotionData } };
};


const DashboardPage = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // --- FIX: Access user from AuthContext ---
    const { user } = useContext(AuthContext); // Get the user object from context
    const userName = user ? user.name : 'Friend'; // Use user.name or a fallback


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/results/my-results');
                const processedData = processDashboardData(response.data);
                setDashboardData(processedData);
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
                navigate('/login');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [navigate, user]); // Added 'user' to dependencies to refetch if user changes (e.g., login/logout status)

    if (isLoading) {
        return <div className="loading-container">Loading Your Dashboard...</div>;
    }

    if (!dashboardData || dashboardData.metrics.sessionsDone === 0) {
        return (
            <div className="page-container dashboard-background">
                <header className="page-header">
                    <div className="dashboard-header-row">
                        <h2>Performance Dashboard</h2>
                        <div className="dashboard-avatar-shimmer">
                            <FaUserCircle className="dashboard-avatar-icon" />
                        </div>
                    </div>
                    <p>Complete an interview session to see your performance metrics here.</p>
                </header>
            </div>
        );
    }

    const { metrics, charts } = dashboardData;

    // CHART OPTIONS (colors for Emotion Distribution updated for better contrast)
    const lineChartOptions = { responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Score Progress Over Time', font: { size: 16, weight: 'bold' }, color: '#4a5568' } } };
    const barChartOptions = { responsive: true, plugins: { legend: { display: false }, title: { display: true, text: 'Average Pace per Session (WPM)', font: { size: 16, weight: 'bold' }, color: '#4a5568' } } };
    const doughnutChartOptions = { responsive: true, plugins: { legend: { position: 'right' }, title: { display: true, text: 'Overall Emotion Distribution', font: { size: 16, weight: 'bold' }, color: '#4a5568' } } };

    return (
        <div className="page-container dashboard-background">
            <header className="page-header">
                <div className="dashboard-header-row">
                    <h2>
                        Welcome back, <span className="dashboard-user-name">{userName}</span>!
                    </h2>
                    <div className="dashboard-avatar-shimmer">
                        {/* Use the actual user's avatar or default icon */}
                        <FaUserCircle className="dashboard-avatar-icon" />
                    </div>
                </div>
                <p>Your personalized interview summary and analytics:</p>
            </header>

            {/* --- METRIC CARDS --- */}
            <section className="metrics-overview">
                <div className={`metric-card`}>
                    <div className="metric-card-header">
                        <span className="metric-icon score"><FaAward /></span>
                        <h4>Average Score</h4>
                    </div>
                    <div className="metric-content">
                        <p className="metric-value">{metrics.avgScore}%</p>
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-card-header">
                        <span className="metric-icon pace">⌛</span>
                        <h4>Average Pace</h4>
                    </div>
                    <div className="metric-content">
                        <p className="metric-value">{metrics.avgPace} <span className="metric-unit">WPM</span></p>
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-card-header">
                        <span className="metric-icon emotion">💬</span>
                        <h4>Primary Emotion</h4>
                    </div>
                    <div className="metric-content">
                        <p className="metric-value">{metrics.primaryEmotion}</p>
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-card-header">
                        <span className="metric-icon sessions">🗂️</span>
                        <h4>Sessions Done</h4>
                    </div>
                    <div className="metric-content">
                        <p className="metric-value">{metrics.sessionsDone}</p>
                    </div>
                </div>
            </section>

            {/* --- CHARTS SECTION --- */}
            <section className="dashboard-grid-v2">
                <div className="chart-card-v2 main-chart">
                    <Line options={lineChartOptions} data={charts.scoreData} />
                </div>
                <div className="chart-card-v2">
                    <Doughnut options={doughnutChartOptions} data={charts.emotionData} />
                </div>
                <div className="chart-card-v2">
                    <Bar options={barChartOptions} data={charts.paceData} />
                </div>
            </section>
        </div>
    );
};

export default DashboardPage;