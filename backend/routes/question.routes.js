// routes/question.routes.js
// KEY FIX: Adds the missing '/domains' route required by the Team Registration page.

import express from "express";
import {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  getDomainsAndQuestions // Import the missing controller function
} from "../controllers/question.controller.js";

const router = express.Router();

// This route is required by the TeamRegistration page on the frontend
// Handles GET requests to /api/questions/domains
router.get('/domains', getDomainsAndQuestions);

// Handles GET and POST for /api/questions
router.get('/', getAllQuestions);
router.post('/', createQuestion);

// Handles GET, PUT, and DELETE for /api/questions/:id
router.get('/:id', getQuestionById);
router.put('/:id', updateQuestion);
router.delete('/:id', deleteQuestion);

export default router;