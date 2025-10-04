import api from './axiosInstance';

const API_BASE_URL = '/teams'; // The base URL is already in axiosInstance

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

export const getMyTeam = async (userId) => {
    if (!userId) {
        // Immediately throw an error if userId is missing to prevent a bad API call
        throw new Error("User ID is required to fetch team data.");
    }
    try {
        const response = await api.get(`${API_BASE_URL}/my-team/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch my team:', error);
        throw error;
    }
};