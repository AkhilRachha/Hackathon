import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

/**
 * Fetches all users from the database.
 * @returns {Promise<Array>} A list of all users.
 */
export const getAllUsers = () => {
    return axios.get(`${API_URL}/users`);
};

/**
 * Updates the role of a specific user.
 * @param {string} userId - The ID of the user to update.
 * @param {string} roleId - The new role ID to assign.
 * @returns {Promise<object>} The updated user data.
 */
export const updateUserRole = (userId, roleId) => {
    return axios.put(`${API_URL}/users/${userId}/role`, { role_id: roleId });
};
