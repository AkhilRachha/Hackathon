import axiosInstance from '@/lib/axiosInstance';

export const hackathonApi = {
    /**
     * Creates a new hackathon event.
     */
    createHackathon: async (hackathonData) => {
        try {
            const response = await axiosInstance.post('/hackathons', hackathonData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to create hackathon');
        }
    },

    /**
     * Fetches all hackathons. Can be filtered by status.
     */
    getHackathons: async (status) => {
        try {
            const params = status ? { params: { status } } : {};
            const response = await axiosInstance.get('/hackathons', params);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch hackathons');
        }
    },

    /**
     * Fetches all completed hackathons with winner details.
     */
    getHackathonWinners: async () => {
        try {
            const response = await axiosInstance.get('/hackathon/winners'); // Endpoint corrected to match common pattern
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch hackathon winners');
        }
    }
}