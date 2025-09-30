import express from 'express';
import { 
    createHackathon, 
    getHackathons, 
    getHackathonWinners, 
    checkActiveOrUpcomingHackathon
} from '../controllers/hackathon.controller.js';
// ➡️ Import the data grouping function (for Titles.jsx)
import { getDomainsAndQuestions } from '../controllers/question.controller.js'; 

const router = express.Router();

// --- Hackathon Routes (Mounted under /api/hackathons) ---

/**
 * @route GET /api/hackathons/active-or-upcoming
 * @description Checks if there is an active or upcoming hackathon currently scheduled.
 */
router.get('/active-or-upcoming', checkActiveOrUpcomingHackathon);

// ➡️ CRITICAL FIX: Combine GET (list all) and POST (create) requests for the root path.
// This resolves the 404 ambiguity on the POST request.
router.route('/')
    .get(getHackathons) // Handles GET /api/hackathons (list all hackathons)
    .post(createHackathon); // Handles POST /api/hackathons (create new hackathon)

/**
 * @route GET /api/hackathons/domains-and-questions
 * @description Fix for Titles.jsx loading error.
 */
router.get('/domains-and-questions', getDomainsAndQuestions); 

/**
 * @route GET /api/hackathons/winners
 * @description Retrieves the winners list for completed hackathons.
 */
router.get('/winners', getHackathonWinners);

export default router;