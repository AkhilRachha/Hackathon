import axios from 'axios';

const api = axios.create({
  // Set the full base URL for your backend API
  baseURL: 'http://localhost:9000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// This part automatically adds your login token to every API request
api.interceptors.request.use(
  (config) => {
    // Make sure 'authToken' is the key you use to save the token in localStorage
    const token = localStorage.getItem('authToken'); 
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