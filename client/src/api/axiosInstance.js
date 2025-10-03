// src/api/axiosInstance.js
import axios from 'axios';

const api = axios.create({
    // 💡 IMPORTANT: Set this to your backend server URL
    // e.g., 'http://localhost:5000' or whatever port your server runs on.
    baseURL: 'http://localhost:9000', 
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;