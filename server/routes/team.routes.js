import express from 'express';
import { createTeam, getTeams, getMyTeam } from '../controllers/team.controller.js';

const router = express.Router();

router.get('/teams', getTeams);
router.post('/teams', createTeam);

// --- NEW: Route to get a specific team for the logged-in participant ---
router.get('/my-team/:userId', getMyTeam);

export default router;