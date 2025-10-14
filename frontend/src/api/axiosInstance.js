import axios from 'axios';

// Create a new Axios instance with a base URL
const axiosInstance = axios.create({
  baseURL: 'http://localhost:9000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Use an interceptor to automatically add the token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    // Look for the token with the key 'authToken'
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

export default axiosInstance;