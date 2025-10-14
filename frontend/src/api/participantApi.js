import axiosInstance from '@/lib/axiosInstance'

// Participant Dashboard API endpoints
export const participantApi = {
  // Get participant dashboard data
  getDashboardData: async () => {
    try {
      const response = await axiosInstance.get('/participant/dashboard')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard data')
    }
  },

  // Get team information
  getTeamInfo: async () => {
    try {
      const response = await axiosInstance.get('/participant/team')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch team information')
    }
  },

  // Get available projects
  getAvailableProjects: async () => {
    try {
      const response = await axiosInstance.get('/hackathon/projects')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch available projects')
    }
  },

  // Get project details by ID
  getProjectDetails: async (projectId) => {
    try {
      const response = await axiosInstance.get(`/hackathon/projects/${projectId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch project details')
    }
  },

  // Select a project for the team
  selectProject: async (projectId) => {
    try {
      const response = await axiosInstance.post('/participant/select-project', {
        projectId
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to select project')
    }
  },

  // Submit project checkpoint
  submitCheckpoint: async (submissionData) => {
    try {
      const response = await axiosInstance.post('/participant/submit-checkpoint', {
        githubRepo: submissionData.githubRepo,
        commitId: submissionData.commitId,
        projectId: submissionData.projectId
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to submit checkpoint')
    }
  },

  // Update submission
  updateSubmission: async (submissionId, submissionData) => {
    try {
      const response = await axiosInstance.put(`/participant/submissions/${submissionId}`, {
        githubRepo: submissionData.githubRepo,
        commitId: submissionData.commitId
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update submission')
    }
  },

  // Get submission history
  getSubmissionHistory: async () => {
    try {
      const response = await axiosInstance.get('/participant/submissions')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch submission history')
    }
  },

  // Get team progress
  getTeamProgress: async () => {
    try {
      const response = await axiosInstance.get('/participant/team/progress')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch team progress')
    }
  }
}