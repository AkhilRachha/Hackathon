import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

/**
 * Fetches all available roles from the database.
 * @returns {Promise<Array>} A list of roles.
 */
export const getRoles = () => {
    return axios.get(`${API_URL}/roles`);
};
