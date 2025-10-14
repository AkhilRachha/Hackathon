import express from 'express';
import { getScores, getScoreById, addScore, updateScore, deleteScore } from '../controllers/score.controller.js';

const router = express.Router();

router.get('/scores', getScores);
router.get('/scores/:id', getScoreById);
router.post('/scores', addScore);
router.put('/scores/:id', updateScore);
router.delete('/scores/:id', deleteScore);

export default router;
