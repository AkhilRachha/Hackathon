import express from 'express';
import { getQuestions, addQuestion } from '../controllers/question.controller.js';

const router = express.Router();

router.get('/questions', getQuestions);
router.post('/questions', addQuestion);

export default router;