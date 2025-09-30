import express from 'express';
import { 
    createHackathon, 
    getHackathons, 
    getHackathonWinners, 
    checkActiveOrUpcomingHackathon
} from '../controllers/hackathon.controller.js';

const router = express.Router();

// --- Hackathon Routes (Mounted under /api/hackathons) ---

/**
 * @route GET /api/hackathons/active-or-upcoming
 * @description Checks if there is an active or upcoming hackathon currently scheduled.
 */
router.get('/active-or-upcoming', checkActiveOrUpcomingHackathon);

/**
 * @route POST /api/hackathons/
 * @description Creates a new hackathon entry.
 */
router.post('/', createHackathon);

/**
 * @route GET /api/hackathons/
 * @description Retrieves a list of all hackathons.
 */
router.get('/', getHackathons);

/**
 * @route GET /api/hackathons/winners
 * @description Retrieves the winners list for completed hackathons.
 */
router.get('/winners', getHackathonWinners);

export default router;
