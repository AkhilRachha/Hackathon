import express from 'express';
import { getEvaluations, getEvaluationById, addEvaluation, updateEvaluation, deleteEvaluation } from '../controllers/evaluation.controller.js';

const router = express.Router();

router.get('/evaluations', getEvaluations);
router.get('/evaluations/:id', getEvaluationById);
router.post('/evaluations', addEvaluation);
router.put('/evaluations/:id', updateEvaluation);
router.delete('/evaluations/:id', deleteEvaluation);

export default router;
