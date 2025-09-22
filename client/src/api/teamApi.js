import axiosInstance from '@/lib/axiosInstance'

// Team management API endpoints
export const teamApi = {
  // Create a new team
  createTeam: async (teamData) => {
    try {
      const response = await axiosInstance.post('/team/teams', {
        team_name: teamData.name,
        description: teamData.description,
        hackathonId: teamData.hackathonId,
        max_members: teamData.maxMembers,
        user_github_url: teamData.user_github_url
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create team')
    }
  },

  // Join an existing team
  joinTeam: async (teamId, joinCode = null) => {
    try {
      const response = await axiosInstance.post(`/team/${teamId}/join`, {
        joinCode
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to join team')
    }
  },

  // Leave team
  leaveTeam: async (teamId) => {
    try {
      const response = await axiosInstance.post(`/team/${teamId}/leave`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to leave team')
    }
  },

  // Get team details
  getTeamDetails: async (teamId) => {
    try {
      const response = await axiosInstance.get(`/team/${teamId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch team details')
    }
  },

  // Get user's current team
  getCurrentTeam: async () => {
    try {
      const response = await axiosInstance.get('/team/current')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch current team')
    }
  },

  // Update team information (Team leader only)
  updateTeam: async (teamId, updateData) => {
    try {
      const response = await axiosInstance.put(`/team/${teamId}`, {
        name: updateData.name,
        description: updateData.description
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update team')
    }
  },

  // Remove team member (Team leader only)
  removeMember: async (teamId, memberId) => {
    try {
      const response = await axiosInstance.delete(`/team/${teamId}/members/${memberId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to remove team member')
    }
  },

  // Get available teams for joining
  getAvailableTeams: async (hackathonId) => {
    try {
      const response = await axiosInstance.get(`/team/available?hackathonId=${hackathonId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch available teams')
    }
  },

  // Generate team join code (Team leader only)
  generateJoinCode: async (teamId) => {
    try {
      const response = await axiosInstance.post(`/team/${teamId}/generate-code`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to generate join code')
    }
  },

  // Get team submissions
  getTeamSubmissions: async (teamId) => {
    try {
      const response = await axiosInstance.get(`/team/${teamId}/submissions`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch team submissions')
    }
  }
}