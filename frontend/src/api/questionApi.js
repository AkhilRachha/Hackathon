import api from '../lib/axiosInstance';

const API_URL = '/questions';

// Gets the grouped data for the Titles page
export const getDomainsAndCriteria = async () => {
  try {
    const response = await api.get(`${API_URL}/domains`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch domains and criteria:', error);
    throw error;
  }
};

// Creates a new question/project
export const createQuestion = async (questionData) => {
  try {
    const response = await api.post(API_URL, questionData);
    return response.data;
  } catch (error) {
    console.error('Failed to create question:', error);
    throw error;
  }
};

// Updates an existing question/project
export const updateQuestion = async (id, questionData) => {
  try {
    const response = await api.put(`${API_URL}/${id}`, questionData);
    return response.data;
  } catch (error) {
    console.error(`Failed to update question ${id}:`, error);
    throw error;
  }
};

// Deletes a question/project
export const deleteQuestion = async (id) => {
  try {
    const response = await api.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete question ${id}:`, error);
    throw error;
  }
};

export const getAllQuestions = async () => {
  try {
    const response = await api.get(API_URL); // GET /api/questions
    return response.data;
  } catch (error) {
    console.error('Failed to fetch all questions:', error);
    throw error;
  }
};