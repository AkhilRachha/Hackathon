import api from './axiosInstance'; 

const API_BASE_URL = '/api/hackathons';

export const getAllHackathons = async () => {
    return api.get(API_BASE_URL);
};

export const getHackathonById = async (id) => {
    return api.get(`${API_BASE_URL}/${id}`);
};

export const updateHackathon = async (id, hackathonData) => {
    return api.put(`${API_BASE_URL}/${id}`, hackathonData);
};

export const createHackathon = async (hackathonData) => {
    return api.post(API_BASE_URL, hackathonData);
};

export const getHackathonWinners = async () => {
    return api.get(`${API_BASE_URL}/winners`);
};

export const getDomainsAndCriteria = async () => {
    return api.get(`${API_BASE_URL}/domains-and-questions`);
};

export const joinHackathon = async (hackathonId) => {
    return api.post(`${API_BASE_URL}/join/${hackathonId}`);
};

export const leaveHackathon = async () => {
    return api.post(`${API_BASE_URL}/leave`);
};

// ➡️ API call for winner submission
export const declareWinners = async (hackathonId, winnerData) => {
    return api.put(`${API_BASE_URL}/declare-winners/${hackathonId}`, winnerData);
};