import axiosInstance from '@/lib/axiosInstance';

export const roleApi = {
    /**
     * Fetches all available roles from the database.
     */
    getRoles: async () => {
        try {
            const response = await axiosInstance.get('/roles');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch roles');
        }
    }
}