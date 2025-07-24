import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

// A simple CSS for styling our component
const styles = {
    container: {
        maxWidth: '600px',
        margin: '2rem auto',
        padding: '2rem',
        border: '1px solid #ddd',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        textAlign: 'center',
        fontFamily: 'sans-serif',
    },
    video: {
        width: '100%',
        border: '1px solid #ccc',
        borderRadius: '8px',
        backgroundColor: '#000',
    },
    controls: {
        margin: '1rem 0',
    },
    button: {
        padding: '0.8rem 1.5rem',
        fontSize: '1rem',
        cursor: 'pointer',
        border: 'none',
        borderRadius: '5px',
        margin: '0 0.5rem',
    },
    startButton: {
        backgroundColor: '#28a745',
        color: 'white',
    },
    stopButton: {
        backgroundColor: '#dc3545',
        color: 'white',
    },
    status: {
        margin: '1rem 0',
        fontSize: '1.1rem',
        fontWeight: 'bold',
    },
    resultsCard: {
        marginTop: '2rem',
        padding: '1.5rem',
        border: '1px solid #eee',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
        textAlign: 'left',
    },
};

function InterviewComponent() {
    // State variables to manage the component's state
    const [isRecording, setIsRecording] = useState(false);
    const [statusMessage, setStatusMessage] = useState('Ready to answer the question.');
    const [analysisResult, setAnalysisResult] = useState(null);
    const [stream, setStream] = useState(null);

    // Refs to hold references to DOM elements and other objects
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    // Set up video stream when component mounts
    useEffect(() => {
        // This function will be called when the component is unmounted
        return () => {
            // Clean up: stop media tracks if they are active
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    // Function to start the recording process
    const startRecording = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setStream(mediaStream);
            videoRef.current.srcObject = mediaStream;
            videoRef.current.play();

            // NEW, MORE COMPATIBLE LINE
            mediaRecorderRef.current = new MediaRecorder(mediaStream);
            
            // Event listener for when audio data is available
            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };
            
            // Event listener for when recording stops
            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                captureFrameAndSend(audioBlob);
                audioChunksRef.current = [];
            };
            
            mediaRecorderRef.current.start();
            setIsRecording(true);
            setAnalysisResult(null); // Clear previous results
            setStatusMessage('Recording... Click "Stop" when you are done.');
        } catch (error) {
            console.error("Error starting recording:", error);
            setStatusMessage('Error: Could not access camera or microphone.');
        }
    };
    
    // Function to stop the recording
    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            // Stop all media tracks to turn off the camera light
            stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
            setStatusMessage('Processing your answer... please wait.');
        }
    };

    // Function to capture a video frame and send data to the backend
    const captureFrameAndSend = (audioBlob) => {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d').drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(async (imageBlob) => {
            const formData = new FormData();
            // NEW, MORE GENERIC FILENAME
            formData.append('audio', audioBlob, 'interview_audio');
            formData.append('image', imageBlob, 'capture.png');

            try {
                // The URL of our Node.js backend endpoint
                const backendUrl = 'http://localhost:8000/api/interview/analyze';
                const response = await axios.post(backendUrl, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                
                setStatusMessage('Analysis complete!');
                setAnalysisResult(response.data);

            } catch (error) {
                console.error('Error uploading files:', error);
                setStatusMessage('Error: Could not process the analysis.');
            }
        }, 'image/png');
    };

    return (
        <div style={styles.container}>
            <h2>Question 1: Tell us about your strengths.</h2>
            
            <video ref={videoRef} style={styles.video} muted></video>
            
            <div style={styles.controls}>
                {!isRecording ? (
                    <button onClick={startRecording} style={{...styles.button, ...styles.startButton}} disabled={isRecording}>
                        Start Recording
                    </button>
                ) : (
                    <button onClick={stopRecording} style={{...styles.button, ...styles.stopButton}} disabled={!isRecording}>
                        Stop Recording
                    </button>
                )}
            </div>

            <p style={styles.status}>Status: {statusMessage}</p>

            {analysisResult && (
                <div style={styles.resultsCard}>
                    <h3>Analysis Results</h3>
                    <p><strong>Detected Emotion:</strong> {analysisResult.dominantEmotion}</p>
                    <p><strong>What we heard:</strong> {analysisResult.transcribedText}</p>
                </div>
            )}
        </div>
    );
}

export default InterviewComponent;