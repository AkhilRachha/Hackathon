import axiosInstance from '@/lib/axiosInstance';

export const adminApi = {
    /**
     * Fetches all users from the database.
     */
    getAllUsers: async () => {
        try {
            const response = await axiosInstance.get('/users');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch all users');
        }
    },

    /**
     * Updates the role of a specific user.
     */
    updateUserRole: async (userId, roleId) => {
        try {
            const response = await axiosInstance.put(`/users/${userId}/role`, { role_id: roleId });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to update user role');
        }
    }
}