import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import './InterviewSession.css';

const PREP_TIME = 15;
const ANSWER_TIME = 90;

const InterviewSession = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [sessionData, setSessionData] = useState({ questions: [], interviewType: 'virtual', topic: '' });
    const [sessionStatus, setSessionStatus] = useState('loading');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timer, setTimer] = useState(PREP_TIME);
    const [timerType, setTimerType] = useState(null); // "prep" | "answer" | null
    const [allAnswers, setAllAnswers] = useState([]);
    const [error, setError] = useState('');

    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const streamRef = useRef(null);

    // Prevent double advancement/processing
    const isAdvancingRef = useRef(false);

    useEffect(() => {
        console.log("SessionStatus:", sessionStatus, "Timer:", timer, "TimerType:", timerType);
    }, [sessionStatus, timer, timerType]);

    useEffect(() => {
        console.log("Current Question Index:", currentQuestionIndex);
    }, [currentQuestionIndex]);

    // On mount, load session data but DO NOT start timers here
    useEffect(() => {
        if (location.state?.questions?.length > 0) {
            setSessionData({
                questions: location.state.questions,
                interviewType: location.state.interviewType,
                topic: location.state.topic || 'Custom Session',
            });
            setCurrentQuestionIndex(0);
            setAllAnswers([]);
            setError('');
        } else {
            navigate('/custom-interview-setup');
        }
        // On unmount cleanup media stream
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        };
        // eslint-disable-next-line
    }, []);

    // Whenever current question changes or questions load, setup media then start prep timer AFTER media ready
    useEffect(() => {
        isAdvancingRef.current = false;
        if (sessionData.questions.length) {
            (async () => {
                await setupMedia(sessionData.interviewType);
                setSessionStatus('preparing');
                setTimer(PREP_TIME);
                setTimerType('prep');
            })();
        }
        // eslint-disable-next-line
    }, [currentQuestionIndex, sessionData.questions.length]);

    // Single timer effect for 'prep' or 'answer'
    useEffect(() => {
        if (!timerType) return;

        if (timer <= 0) {
            if (timerType === 'prep') {
                setTimerType(null);
                startRecording();
            } else if (timerType === 'answer') {
                setTimerType(null);
                stopAndProcess();
            }
            return;
        }
        const interval = setInterval(() => setTimer(t => t - 1), 1000);
        return () => clearInterval(interval);
    }, [timer, timerType]);

    // Media setup: stops any previous stream and acquires a fresh one
    const setupMedia = async (type) => {
        setError('');
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        try {
            const constraints = { audio: true, video: type === 'virtual' };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;
            // NOTE: DO NOT set videoRef.current.srcObject here.
            // We'll do this in a separate effect after DOM and stream are stable.
        } catch (err) {
            setError("Could not access camera/mic. Please check permissions and try again.");
            setSessionStatus('error');
        }
    };

    // *** New effect to set srcObject and play video when ready ***
    useEffect(() => {
        if (
            sessionData.interviewType === 'virtual' &&
            videoRef.current &&
            streamRef.current
        ) {
            videoRef.current.srcObject = streamRef.current;
            videoRef.current.play().catch(() => {});
        }
    }, [sessionData.interviewType, streamRef.current, currentQuestionIndex]);

    const startRecording = async () => {
        setError('');
        setSessionStatus('recording');
        setTimer(ANSWER_TIME);
        setTimerType('answer');
        if (!streamRef.current) {
            setError("No stream available for recording.");
            setSessionStatus('error');
            return;
        }
        try {
            mediaRecorderRef.current = new MediaRecorder(streamRef.current);
            audioChunksRef.current = [];
            mediaRecorderRef.current.ondataavailable = (event) => audioChunksRef.current.push(event.data);
            mediaRecorderRef.current.onstop = processAnswer;
            mediaRecorderRef.current.onstart = () => { console.log("MediaRecorder started."); };
            mediaRecorderRef.current.onerror = (event) => {
                setError("Recording encountered an error.");
                setSessionStatus('error');
                console.error("MediaRecorder error:", event.error);
            };
            mediaRecorderRef.current.start();
        } catch (err) {
            setError("A technical error occurred while starting the recording. Device might be in use.");
            setSessionStatus('error');
        }
    };

    // Stop and process, only ONCE per question
    const stopAndProcess = () => {
        if (isAdvancingRef.current) {
            console.log("Already processing/advancing. Skipping duplicate call.");
            return;
        }
        isAdvancingRef.current = true;
        setTimerType(null);
        if (mediaRecorderRef.current?.state === 'recording') {
            setSessionStatus('processing');
            mediaRecorderRef.current.stop();
        }
    };

    const captureFrame = async () => {
        if (sessionData.interviewType !== 'virtual' || !videoRef.current) return new Blob();
        if (!(videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0)) return new Blob();
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d').drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        return new Promise(resolve => canvas.toBlob(blob => resolve(blob || new Blob()), 'image/png'));
    };

    const processAnswer = async () => {
        if (audioChunksRef.current.length === 0) {
            setError("No audio detected. Please repeat your answer.");
            setSessionStatus('ready');
            isAdvancingRef.current = false;
            return;
        }
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = [];
        const imageBlob = await captureFrame();

        const formData = new FormData();
        formData.append('audio', audioBlob, 'audio.webm');
        formData.append('image', imageBlob, 'image.png');

        const currentQuestionObject = sessionData.questions[currentQuestionIndex];
        try {
            const initialResponse = await api.post('/interview/analyze', formData);
            const expertResponse = await api.post('/interview/expert-review', {
                questionText: currentQuestionObject.question,
                transcribedText: initialResponse.data.transcribedText,
                keyPoints: currentQuestionObject.keyPoints || [],
            });
            const fullAnswerAnalysis = {
                ...initialResponse.data,
                ...expertResponse.data,
                questionText: currentQuestionObject.question,
                modelAnswer: currentQuestionObject.modelAnswer,
                keyPoints: currentQuestionObject.keyPoints
            };
            setAllAnswers(prev => [...prev, fullAnswerAnalysis]);
            advanceToNextQuestion();
        } catch (err) {
            const errorAnswer = {
                questionText: currentQuestionObject.question,
                transcribedText: "Error: Could not process this answer.",
                dominantEmotion: "N/A", wordsPerMinute: 0, fillerWords: { count: 0, words: [] },
                relevance: "N/A", clarity: "N/A", feedback: "A technical error occurred during analysis.",
                answerScore: 0, sentimentScore: 0,
                modelAnswer: currentQuestionObject.modelAnswer || 'N/A',
                keyPoints: currentQuestionObject.keyPoints || [],
            };
            setAllAnswers(prev => [...prev, errorAnswer]);
            advanceToNextQuestion();
        }
    };

    const advanceToNextQuestion = () => {
        isAdvancingRef.current = false;
        setTimerType(null);
        if (currentQuestionIndex < sessionData.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSessionStatus('preparing');
            setTimer(PREP_TIME);
            setTimerType('prep');
        } else {
            finishInterview();
        }
    };

    const finishInterview = async () => {
        setSessionStatus('finished');
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        try {
            const response = await api.post('/interview/save-session', {
                interviewTopic: sessionData.topic,
                questionAnalyses: allAnswers,
                interviewType: sessionData.interviewType,
            });
            navigate(`/results/${response.data._id}`);
        } catch (error) {
            alert("Error saving session. Redirecting to your history page.");
            navigate('/results');
        }
    };

    const handleFinishEarly = () => {
        if (window.confirm("Are you sure you want to end the interview early? Your progress will be saved.")) {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
            finishInterview();
        }
    };

    const handleSkipQuestion = () => {
        if (isAdvancingRef.current) return;
        isAdvancingRef.current = true;
        setTimerType(null);
        if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
        const currentQuestionObject = sessionData.questions[currentQuestionIndex];
        const skippedAnswer = {
            questionText: currentQuestionObject.question,
            transcribedText: "[SKIPPED]",
            dominantEmotion: "N/A", wordsPerMinute: 0, fillerWords: { count: 0, words: [] },
            relevance: "Skipped", clarity: "Skipped", feedback: "Question was skipped by the user.",
            answerScore: 0, sentimentScore: 0,
            modelAnswer: currentQuestionObject.modelAnswer || 'N/A',
            keyPoints: currentQuestionObject.keyPoints || [],
        };
        setAllAnswers(prev => [...prev, skippedAnswer]);
        advanceToNextQuestion();
    };

    const currentQuestionObject = sessionData.questions[currentQuestionIndex];
    const progressPercentage = sessionData.questions.length > 0 ? ((currentQuestionIndex + 1) / sessionData.questions.length) * 100 : 0;

    const renderStatusPill = () => {
        switch (sessionStatus) {
            case 'preparing': return <div className="status-pill prepare">GET READY: {timer}s</div>;
            case 'ready': return <div className="status-pill ready">Ready to Record</div>;
            case 'recording': return <div className="status-pill recording">🔴 RECORDING {sessionData.interviewType === 'virtual' && `: ${timer}s`}</div>;
            case 'processing': return <div className="status-pill processing">ANALYZING...</div>;
            default: return null;
        }
    };

    const renderActionButton = () => {
        switch (sessionStatus) {
            case 'recording':
                return <button onClick={stopAndProcess} className="main-control-btn stop">Stop & Submit Answer</button>;
            case 'processing':
                return <button disabled className="main-control-btn">Processing...</button>;
            case 'ready':
                return <button onClick={startRecording} className="main-control-btn start">Start Recording</button>;
            default:
                return <div className="main-control-placeholder"></div>;
        }
    };

    if (sessionStatus === 'loading') return <div className="loading-container">Setting up interview...</div>;
    if (sessionStatus === 'error') return <div className="loading-container error"><h3>Error</h3><p>{error}</p></div>;
    if (sessionStatus === 'finished') return <div className="loading-container"><h2>Interview Complete!</h2><p>Generating your final report...</p></div>;

    return (
        <div className="session-container-v2">
            <div className="video-preview-container">
                {sessionData.interviewType === 'virtual' ? (
                    <video ref={videoRef} className="video-feed-v2" muted autoPlay playsInline></video>
                ) : (
                    <div className="voice-only-visualizer">
                        <div className={`mic-icon ${sessionStatus === 'recording' ? 'pulsing' : ''}`}>🎤</div>
                        <p>Voice Only Mode</p>
                    </div>
                )}
                <div className="video-overlay">{renderStatusPill()}</div>
            </div>

            <div className="interview-panel">
                <div className="panel-header">
                    <span className="panel-question-counter">Question {currentQuestionIndex + 1} / {sessionData.questions.length}</span>
                    <div className="header-buttons-group">
                        {sessionStatus !== 'loading' && sessionStatus !== 'error' && sessionStatus !== 'finished' && (
                            <button
                                onClick={handleSkipQuestion}
                                className="skip-question-btn"
                                disabled={sessionStatus === 'processing'}>
                                Skip Question
                            </button>
                        )}
                        <button onClick={handleFinishEarly} className="finish-early-btn-v2" disabled={sessionStatus === 'processing'}>
                            Finish Session
                        </button>
                    </div>
                </div>
                <div className="panel-progress-bar">
                    <div className="panel-progress-fill" style={{ width: `${progressPercentage}%` }}></div>
                </div>

                <div className="panel-question-area">
                    <h3>Current Question:</h3>
                    <p>{currentQuestionObject?.question}</p>
                </div>

                <div className="panel-controls">
                    {renderActionButton()}
                </div>
            </div>
        </div>
    );
};

export default InterviewSession;
