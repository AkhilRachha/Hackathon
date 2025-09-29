import express from 'express';
import { getWinners, getWinnerById, addWinner, updateWinner, deleteWinner } from '../controllers/hackathonWinner.controller.js';

const router = express.Router();

router.get('/winners', getWinners);
router.get('/winners/:id', getWinnerById);
router.post('/winners', addWinner);
router.put('/winners/:id', updateWinner);
router.delete('/winners/:id', deleteWinner);

export default router;
