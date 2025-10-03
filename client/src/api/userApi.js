import api from './axiosInstance';

const API_BASE_URL = '/api/users';

export const getAllUsers = async () => {
    return api.get(API_BASE_URL);
};

export const updateUserRole = async (userId, updateData) => {
    return api.put(`${API_BASE_URL}/${userId}/role`, updateData);
};