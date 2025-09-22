import axiosInstance from '@/lib/axiosInstance'

// Authentication API endpoints
export const authApi = {
  // User registration
  register: async (userData) => {
    try {
      const response = await axiosInstance.post('/auth/register', {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        university: userData.university,
        skills: userData.skills
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed')
    }
  },

  // User login
  login: async (credentials) => {
    try {
      const response = await axiosInstance.post('/auth/login', {
        email: credentials.email,
        password: credentials.password
      })
      
      // Store token in localStorage
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token)
        localStorage.setItem('userRole', response.data.user.role)
        localStorage.setItem('userId', response.data.user.id)
      }
      
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed')
    }
  },

  // User logout
  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout')
      
      // Clear stored data
      localStorage.removeItem('authToken')
      localStorage.removeItem('userRole')
      localStorage.removeItem('userId')
      
      return { success: true }
    } catch (error) {
      // Clear stored data even if API call fails
      localStorage.removeItem('authToken')
      localStorage.removeItem('userRole')
      localStorage.removeItem('userId')
      throw new Error(error.response?.data?.message || 'Logout failed')
    }
  },

  // Verify token and get user info
  verifyToken: async () => {
    try {
      const response = await axiosInstance.get('/auth/verify')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Token verification failed')
    }
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const response = await axiosInstance.post('/auth/refresh')
      
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token)
      }
      
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Token refresh failed')
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await axiosInstance.post('/auth/forgot-password', { email })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send reset email')
    }
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    try {
      const response = await axiosInstance.post('/auth/reset-password', {
        token,
        password: newPassword
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Password reset failed')
    }
  }
}