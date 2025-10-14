import axiosInstance from '@/lib/axiosInstance';

// Authentication API endpoints
export const authApi = {
  // User registration
  register: async (userData) => {
    try {
      const response = await axiosInstance.post('/register', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  // User login
  login: async (credentials) => {
    try {
      // ✅ Use the correct endpoint and field names
      const response = await axiosInstance.post('/login', {
        user_email: credentials.email,
        user_password: credentials.password
      });

      // ✅ Store token and user data in localStorage upon success
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userRole', response.data.user.role_name);
        localStorage.setItem('userId', response.data.user._id);
        localStorage.setItem('userName', response.data.user.user_name);
        if (response.data.user.current_hackathon) {
          localStorage.setItem('currentHackathonId', response.data.user.current_hackathon);
        }
      }

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  // User logout
  logout: async () => {
    try {
      // It's good practice to notify the backend of logout
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      console.error("Logout API call failed, but clearing local data anyway.", error);
    } finally {
      // Always clear local data on logout
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName'); // ✅ Corrected
      localStorage.removeItem('currentHackathonId');
    }
  },

  // Other functions from your file...
  verifyToken: async () => {
    try {
      const response = await axiosInstance.get('/auth/verify');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Token verification failed');
    }
  },
};