// routes/hackathon.routes.js
import express from 'express';
import { verifyUser } from '../middlewares/auth.middleware.js'; 
import { 
    createHackathon, 
    getHackathons, 
    getHackathonWinners, 
    checkActiveOrUpcomingHackathon,
    getHackathonById, 
    updateHackathon,
    joinHackathon,
    leaveHackathon,
    declareWinners
} from '../controllers/hackathon.controller.js';
import { getDomainsAndQuestions } from '../controllers/question.controller.js'; 

const router = express.Router();

// --- Hackathon Routes (Mounted under /api/hackathons) ---

// 1. Checks if an event is active (Used by frontend)
router.get('/active-or-upcoming', checkActiveOrUpcomingHackathon);

// ➡️ 2. CRITICAL FIX: Handles GET /api/hackathons (list all) and POST /api/hackathons (create new)
router.route('/')
    .get(getHackathons) // ✅ Resolves to GET /api/hackathons
    .post(createHackathon); 

// 3. Dynamic route for fetching the detailed management view, editing, and Admin management
router.route('/:id')
    .get(getHackathonById) 
    .put(updateHackathon); 
    
// 4. Protected Winner Route (Admin only)
router.put('/declare-winners/:id', verifyUser, declareWinners);

// 5. Domains and Criteria (for Titles.jsx)
router.get('/domains-and-questions', getDomainsAndQuestions); 

// 6. Winners list
router.get('/winners', getHackathonWinners);

// 7. Protected Join Route (Participant/Staff flow)
router.post('/join/:hackathonId', verifyUser, joinHackathon);

// 8. Protected Leave Route (Participant/Staff flow)
router.post('/leave', verifyUser, leaveHackathon);

export default router;