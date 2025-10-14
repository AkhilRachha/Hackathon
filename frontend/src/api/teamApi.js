import api from '../lib/axiosInstance';

const API_BASE_URL = '/teams'; // The base URL is already in axiosInstance

// --- ⬇️ NEW FUNCTION FOR MID-SUBMISSION ⬇️ ---
export const submitMidProject = async (submissionData) => {
    try {
        const response = await api.post(`${API_BASE_URL}/submit-mid-project`, submissionData);
        return response.data;
    } catch (error) {
        console.error('Failed to submit mid-project:', error);
        throw error;
    }
};

// Function for FINAL submission
export const submitProject = async (submissionData) => {
    try {
        const response = await api.post(`${API_BASE_URL}/submit-project`, submissionData);
        return response.data;
    } catch (error) {
        console.error('Failed to submit final project:', error);
        throw error;
    }
};

export const getAllTeams = async () => {
    try {
        // 1. Await the API call
        const response = await api.get(API_BASE_URL);
        // 2. Return only the data from the response
        return response.data;
    } catch (error) {
        console.error('Failed to fetch all teams:', error);
        throw error; // Re-throw the error for the component to handle
    }
};

export const getTeamById = async (id) => {
    try {
        const response = await api.get(`${API_BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch team with id ${id}:`, error);
        throw error;
    }
};

export const createTeam = async (teamData) => {
    try {
        const response = await api.post(API_BASE_URL, teamData);
        return response.data;
    } catch (error) {
        console.error('Failed to create team:', error);
        throw error;
    }
};

export const updateTeam = async (id, teamData) => {
    try {
        const response = await api.put(`${API_BASE_URL}/${id}`, teamData);
        return response.data;
    } catch (error) {
        console.error(`Failed to update team with id ${id}:`, error);
        throw error;
    }
};

export const deleteTeam = async (id) => {
    try {
        const response = await api.delete(`${API_BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to delete team with id ${id}:`, error);
        throw error;
    }
};

export const getMyTeam = async () => {
    try {
        // ✅ This calls the correct "/my-team" route.
        // The server knows who you are from the auth token.
        const response = await api.get(`${API_BASE_URL}/my-team`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch my team:', error);
        throw error;
    }
};

export const getMyDashboard = async () => {
    try {
        // ✅ This calls the "/my-dashboard" route for comprehensive dashboard data.
        const response = await api.get(`${API_BASE_URL}/my-dashboard`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        throw error;
    }
};

// Make all teams in a hackathon ready for evaluation
export const makeAllTeamsEvaluationReady = async (hackathonId) => {
    try {
        const response = await api.post(`${API_BASE_URL}/hackathon/${hackathonId}/make-evaluation-ready`);
        return response.data;
    } catch (error) {
        console.error('Failed to make teams evaluation ready:', error);
        throw error;
    }
};

// Get evaluation status of all teams in a hackathon
export const getTeamsEvaluationStatus = async (hackathonId) => {
    try {
        const response = await api.get(`${API_BASE_URL}/hackathon/${hackathonId}/evaluation-status`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch teams evaluation status:', error);
        throw error;
    }
};