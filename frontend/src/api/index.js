// Central API exports for easy importing
export { authApi } from './authApi'
export { participantApi } from './participantApi'
export { hackathonApi } from './hackathonApi'
export { teamApi } from './teamApi'
export { adminApi } from './adminApi'

// API error handler utility
export const handleApiError = (error) => {
  console.error('API Error:', error)
  
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data?.message || 'Server error occurred',
      status: error.response.status,
      data: error.response.data
    }
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'Network error - please check your connection',
      status: 0,
      data: null
    }
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      status: -1,
      data: null
    }
  }
}

// API response wrapper utility
export const apiWrapper = async (apiCall) => {
  try {
    const response = await apiCall()
    return {
      success: true,
      data: response,
      error: null
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      error: handleApiError(error)
    }
  }
}