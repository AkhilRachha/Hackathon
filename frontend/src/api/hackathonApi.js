import api from '../lib/axiosInstance';

// The '/hackathons' part of the URL, which gets added to the base URL
const API_URL = '/hackathons';

// FOR PARTICIPANTS
export const getAllHackathons = async () => {
  try {
    const response = await api.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch available hackathons:', error);
    throw error;
  }
};



// FOR ADMINS
export const getAllHackathonsForAdmin = async () => {
  try {
    const response = await api.get(`${API_URL}/all`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch all hackathons for admin:', error);
    throw error;
  }
};


// --- Other API functions ---
export const getHackathonById = async (id) => {
    try {
        const response = await api.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) { throw error; }
};
export const createHackathon = async (hackathonData) => {
    try {
        const response = await api.post(API_URL, hackathonData);
        return response.data;
    } catch (error) { throw error; }
};
export const joinHackathon = async (hackathonId) => {
    try {
        const response = await api.post(`${API_URL}/join/${hackathonId}`);
        return response.data;
    } catch (error) { throw error; }
};

export const updateHackathon = async (id, hackathonData) => {
  try {
    const response = await api.put(`${API_URL}/${id}`, hackathonData);
    return response.data;
  } catch (error) {
    console.error(`Failed to update hackathon with id ${id}:`, error);
    throw error;
  }
};

export const getHackathonWinners = async () => {
  try {
    const response = await api.get(`${API_URL}/winners`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch hackathon winners:', error);
    throw error;
  }
};

export const leaveHackathon = async () => {
  try {
    const response = await api.post(`${API_URL}/leave`);
    return response.data;
  } catch (error) {
    console.error('Failed to leave hackathon:', error);
    throw error;
  }
};



export const updateHackathonQuestions = async (hackathonId, questionIds) => {
  try {
    const response = await api.put(`${API_URL}/${hackathonId}/questions`, { questionIds });
    return response.data;
  } catch (error) {
    console.error('Failed to update hackathon questions:', error);
    throw error;
  }
};

export const updateHackathonStatus = async (hackathonId, status) => {
  try {
    const response = await api.put(`${API_URL}/${hackathonId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Failed to update hackathon status:', error);
    throw error;
  }
};

export const getRecentWinners = async () => {
  try {
    const response = await api.get(`${API_URL}/recent-winners`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch recent winners:', error);
    throw error;
  }
};

export const markHackathonAsCompleted = async (hackathonId) => {
  try {
    const response = await api.post(`${API_URL}/${hackathonId}/mark-completed`);
    return response.data;
  } catch (error) {
    console.error('Failed to mark hackathon as completed:', error);
    throw error;
  }
};