import express from 'express';
import { createTeam, getTeams, getMyTeam } from '../controllers/team.controller.js';

const router = express.Router();

router.get('/', getTeams); // Route for GET /api/teams
router.post('/', createTeam); // Route for POST /api/teams

// NEW: Route to get a specific team for the logged-in participant
// This is the route that is correctly accessed by the frontend now: /api/teams/my-team/:userId
router.get('/my-team/:userId', getMyTeam);

export default router;
