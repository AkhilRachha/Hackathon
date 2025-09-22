import axiosInstance from '@/lib/axiosInstance'

// Admin management API endpoints
export const adminApi = {
  // Verify user accounts
  verifyUser: async (userId, verificationData) => {
    try {
      const response = await axiosInstance.post(`/admin/verify-user/${userId}`, {
        status: verificationData.status,
        reason: verificationData.reason
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to verify user')
    }
  },

  // Get all users for admin management
  getAllUsers: async (filters = {}) => {
    try {
      const params = new URLSearchParams()
      if (filters.role) params.append('role', filters.role)
      if (filters.status) params.append('status', filters.status)
      if (filters.search) params.append('search', filters.search)
      if (filters.page) params.append('page', filters.page)
      if (filters.limit) params.append('limit', filters.limit)

      const response = await axiosInstance.get(`/admin/users?${params}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users')
    }
  },

  // Get admin dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await axiosInstance.get('/admin/dashboard/stats')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard statistics')
    }
  },

  // Update user role
  updateUserRole: async (userId, newRole) => {
    try {
      const response = await axiosInstance.put(`/admin/users/${userId}/role`, {
        role: newRole
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update user role')
    }
  },

  // Suspend/Unsuspend user
  toggleUserSuspension: async (userId, suspend = true) => {
    try {
      const response = await axiosInstance.put(`/admin/users/${userId}/suspension`, {
        suspended: suspend
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update user suspension status')
    }
  },

  // Delete user account
  deleteUser: async (userId) => {
    try {
      const response = await axiosInstance.delete(`/admin/users/${userId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete user')
    }
  },

  // Get system logs
  getSystemLogs: async (filters = {}) => {
    try {
      const params = new URLSearchParams()
      if (filters.level) params.append('level', filters.level)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      if (filters.page) params.append('page', filters.page)
      if (filters.limit) params.append('limit', filters.limit)

      const response = await axiosInstance.get(`/admin/logs?${params}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch system logs')
    }
  },

  // Export data
  exportData: async (dataType, format = 'csv') => {
    try {
      const response = await axiosInstance.get(`/admin/export/${dataType}?format=${format}`, {
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to export data')
    }
  },

  // Get platform analytics
  getAnalytics: async (timeRange = '30d') => {
    try {
      const response = await axiosInstance.get(`/admin/analytics?range=${timeRange}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch analytics')
    }
  }
}