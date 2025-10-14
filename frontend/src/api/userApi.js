import api from '../lib/axiosInstance';

const API_URL = '/users';

// --- ⬇️ CORRECTED FUNCTION ⬇️ ---
export const getAllUsers = async () => {
  try {
    // 1. Await the response
    const response = await api.get(API_URL);
    // 2. Return the data
    return response.data;
  } catch (error) {
    console.error('Failed to fetch all users:', error);
    throw error;
  }
};

// --- ⬇️ CORRECTED FUNCTION ⬇️ ---
export const updateUserRole = async (userId, updateData) => {
  try {
    const response = await api.put(`${API_URL}/${userId}/role`, updateData);
    return response.data;
  } catch (error) {
    console.error(`Failed to update role for user ${userId}:`, error);
    throw error;
  }
};

// Get coordinator info for role change validation
export const getCoordinatorInfo = async (userId) => {
  try {
    const response = await api.get(`${API_URL}/${userId}/coordinator-info`);
    return response.data;
  } catch (error) {
    console.error(`Failed to get coordinator info for user ${userId}:`, error);
    throw error;
  }
};