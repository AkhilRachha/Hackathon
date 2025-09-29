import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

/**
 * Creates a new hackathon event.
 * @param {object} hackathonData - The data for the new hackathon.
 * @returns {Promise<object>} The created hackathon data.
 */
export const createHackathon = (hackathonData) => {
    return axios.post(`${API_URL}/hackathons`, hackathonData);
};

/**
 * Fetches all hackathons. Can be filtered by status.
 * @param {string} [status] - Optional status to filter by (e.g., 'active', 'completed').
 * @returns {Promise<Array>} A list of hackathons.
 */
export const getHackathons = (status) => {
    const params = status ? { params: { status } } : {};
    return axios.get(`${API_URL}/hackathons`, params);
};

/**
 * Fetches all completed hackathons with winner details.
 * @returns {Promise<Array>} A list of completed hackathons with winners.
 */
export const getHackathonWinners = () => {
    return axios.get(`${API_URL}/hackathons/winners`);
};
