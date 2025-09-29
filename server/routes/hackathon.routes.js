import express from 'express';
import { createHackathon, getHackathons, getHackathonWinners } from '../controllers/hackathon.controller.js';

const router = express.Router();

router.post('/hackathons', createHackathon);
router.get('/hackathons', getHackathons);
router.get('/hackathons/winners', getHackathonWinners);

export default router;