import express from 'express';
import {
    createQuestion,
    getAllQuestions,
    getQuestionById,
    updateQuestion,
    deleteQuestion
} from '../controllers/question.controller.js';

const router = express.Router();

// Route to get all questions and create a new question
router.route('/questions')
    .get(getAllQuestions)
    .post(createQuestion);

// Route to get, update, and delete a specific question by its ID
router.route('/questions/:id')
    .get(getQuestionById)
    .put(updateQuestion)
    .delete(deleteQuestion);

export default router;
