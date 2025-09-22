import axiosInstance from '@/lib/axiosInstance'

// Hackathon management API endpoints
export const hackathonApi = {
  // Create new hackathon (Admin only)
  createHackathon: async (hackathonData) => {
    try {
      const response = await axiosInstance.post('/hackathon/create', {
        title: hackathonData.title,
        description: hackathonData.description,
        startDate: hackathonData.startDate,
        endDate: hackathonData.endDate,
        registrationDeadline: hackathonData.registrationDeadline,
        maxTeamSize: hackathonData.maxTeamSize,
        rules: hackathonData.rules,
        prizes: hackathonData.prizes
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create hackathon')
    }
  },

  // Get list of hackathons
  getHackathons: async (filters = {}) => {
    try {
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.search) params.append('search', filters.search)
      if (filters.page) params.append('page', filters.page)
      if (filters.limit) params.append('limit', filters.limit)

      const response = await axiosInstance.get(`/hackathon/list?${params}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch hackathons')
    }
  },

  // Get hackathon details by ID
  getHackathonDetails: async (hackathonId) => {
    try {
      const response = await axiosInstance.get(`/hackathon/${hackathonId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch hackathon details')
    }
  },

  // Update hackathon (Admin only)
  updateHackathon: async (hackathonId, updateData) => {
    try {
      const response = await axiosInstance.put(`/hackathon/${hackathonId}`, updateData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update hackathon')
    }
  },

  // Delete hackathon (Admin only)
  deleteHackathon: async (hackathonId) => {
    try {
      const response = await axiosInstance.delete(`/hackathon/${hackathonId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete hackathon')
    }
  },

  // Register for hackathon
  registerForHackathon: async (hackathonId) => {
    try {
      const response = await axiosInstance.post(`/hackathon/${hackathonId}/register`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to register for hackathon')
    }
  },

  // Get hackathon statistics (Admin/Coordinator)
  getHackathonStats: async (hackathonId) => {
    try {
      const response = await axiosInstance.get(`/hackathon/${hackathonId}/stats`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch hackathon statistics')
    }
  }
}