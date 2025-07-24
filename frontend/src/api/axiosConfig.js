import axios from 'axios';

// Create a new instance of axios with a custom configuration
const api = axios.create({
    // Set the base URL for all API requests
    baseURL: 'http://localhost:8000/api', 
});

// Add a request interceptor
api.interceptors.request.use(
    (config) => {
        // Get the token from local storage
        const token = localStorage.getItem('token');
        
        // If the token exists, add it to the Authorization header
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Return the modified config object to be sent
        return config;
    },
    (error) => {
        // Handle request errors
        return Promise.reject(error);
    }
);

export default api;