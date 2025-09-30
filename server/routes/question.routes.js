import express from "express";
import {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} from "../controllers/question.controller.js";

const router = express.Router();

// CRUD routes
router.route("/questions").get(getAllQuestions).post(createQuestion);
router
  .route("/questions/:id")
  .get(getQuestionById)
  .put(updateQuestion)
  .delete(deleteQuestion);

export default router;