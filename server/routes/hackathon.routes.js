import express from 'express';
import { verifyUser } from '../middlewares/auth.middleware.js'; 
import { 
    createHackathon, 
    getHackathons, 
    getAllHackathonsForAdmin,
    getHackathonWinners, 
    checkActiveOrUpcomingHackathon,
    getHackathonById, 
    updateHackathon,
    joinHackathon,
    leaveHackathon,
    declareWinners,
    updateHackathonQuestions
} from '../controllers/hackathon.controller.js';
// REMOVED: No longer importing from question.controller.js

const router = express.Router();

router.get('/all', verifyUser, getAllHackathonsForAdmin); 
router.get('/', getHackathons); 
router.post('/', verifyUser, createHackathon); 
router.get('/active-or-upcoming', checkActiveOrUpcomingHackathon);
router.get('/winners', getHackathonWinners);

// REMOVED: The '/domains-and-questions' route has been deleted from this file.

router.get('/:id', getHackathonById); 
router.put('/:id', verifyUser, updateHackathon); 
router.put('/declare-winners/:id', verifyUser, declareWinners);
router.post('/join/:hackathonId', verifyUser, joinHackathon);
router.post('/leave', verifyUser, leaveHackathon);
router.put('/:id/questions', verifyUser, updateHackathonQuestions);

export default router;