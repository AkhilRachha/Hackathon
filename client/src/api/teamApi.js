import api from './axiosInstance';

const API_BASE_URL = '/api/teams';

export const getAllTeams = async () => {
    return api.get(API_BASE_URL);
};

export const getTeamById = async (id) => {
    return api.get(`${API_BASE_URL}/${id}`);
};

export const createTeam = async (teamData) => {
    return api.post(API_BASE_URL, teamData);
};

export const updateTeam = async (id, teamData) => {
    return api.put(`${API_BASE_URL}/${id}`, teamData);
};

export const deleteTeam = async (id) => {
    return api.delete(`${API_BASE_URL}/${id}`);
};

export const getMyTeam = async (userId) => {
    return api.get(`${API_BASE_URL}/my-team/${userId}`);
};