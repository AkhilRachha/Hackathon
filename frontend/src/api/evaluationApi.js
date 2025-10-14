import api from '../lib/axiosInstance';

const API_BASE_URL = '/evaluations';

export const getEvaluatorDashboardData = async () => {
  try {
    const response = await api.get(`${API_BASE_URL}/dashboard`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch evaluator dashboard data:', error);
    throw error;
  }
};

export const submitEvaluation = async (evaluationData) => {
  try {
    const response = await api.post(API_BASE_URL, evaluationData);
    return response.data;
  } catch (error) {
    console.error('Failed to submit evaluation:', error);
    throw error;
  }
};

export const updateEvaluation = async (evaluationId, evaluationData) => {
  try {
    const response = await api.put(`${API_BASE_URL}/${evaluationId}`, evaluationData);
    return response.data;
  } catch (error) {
    console.error('Failed to update evaluation:', error);
    throw error;
  }
};

export const getAllEvaluations = async () => {
  try {
    const response = await api.get(`${API_BASE_URL}/all`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch all evaluations:', error);
    throw error;
  }
};

export const getMyEvaluations = async () => {
  try {
    const response = await api.get(`${API_BASE_URL}/my-evaluations`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch my evaluations:', error);
    throw error;
  }
};

export const getEvaluationById = async (evaluationId) => {
  try {
    const response = await api.get(`${API_BASE_URL}/${evaluationId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch evaluation:', error);
    throw error;
  }
};

// Select team for evaluation (lock it for this evaluator)
export const selectTeamForEvaluation = async (teamId) => {
  try {
    const response = await api.post(`${API_BASE_URL}/select-team`, { team_id: teamId });
    return response.data;
  } catch (error) {
    console.error('Failed to select team for evaluation:', error);
    throw error;
  }
};

// Release team from evaluation (unlock it)
export const releaseTeamFromEvaluation = async (teamId) => {
  try {
    const response = await api.post(`${API_BASE_URL}/release-team`, { team_id: teamId });
    return response.data;
  } catch (error) {
    console.error('Failed to release team from evaluation:', error);
    throw error;
  }
};

// Debug function to check evaluator status
export const getEvaluatorStatus = async () => {
  try {
    const response = await api.get(`${API_BASE_URL}/status`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch evaluator status:', error);
    throw error;
  }
};





// Announce winners
export const announceWinners = async (winnersData) => {
  try {
    const response = await api.post(`${API_BASE_URL}/announce-winners`, winnersData);
    return response.data;
  } catch (error) {
    console.error('Failed to announce winners:', error);
    throw error;
  }
};