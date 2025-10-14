import express from 'express';
import { verifyUser, verifyRole } from '../middleware/auth.middleware.js';
import {
    getEvaluatorDashboardData,
    submitEvaluation,
    selectTeamForEvaluation,
    releaseTeamFromEvaluation,
    getEvaluatorStatus,
    reconnectEvaluatorToHackathon,
    announceWinners,
    cleanupStaleLocks
} from '../controllers/evaluation.controller.js';

const router = express.Router();

// All routes require user authentication
router.use(verifyUser);

// Get evaluator dashboard data
router.get('/dashboard', verifyRole(['evaluator']), getEvaluatorDashboardData);

// Debug endpoint to check evaluator status
router.get('/status', verifyRole(['evaluator']), getEvaluatorStatus);

// Reconnect evaluator to hackathon (for cases where cleanup ran early)
router.post('/reconnect', verifyRole(['evaluator']), reconnectEvaluatorToHackathon);

// Submit new evaluation
router.post('/', verifyRole(['evaluator']), submitEvaluation);

// TODO: Add missing functions: getAllEvaluations, getMyEvaluations, getEvaluationById, updateEvaluation, deleteEvaluation

// Select team for evaluation (lock)
router.post('/select-team', verifyRole(['evaluator']), selectTeamForEvaluation);

// Release team from evaluation (unlock)
router.post('/release-team', verifyRole(['evaluator']), releaseTeamFromEvaluation);

// Announce winners
router.post('/announce-winners', verifyRole(['evaluator']), announceWinners);

// Cleanup stale locks (admin only)
router.post('/cleanup-stale-locks', verifyRole(['admin']), async (req, res) => {
    try {
        const releasedCount = await cleanupStaleLocks();
        res.status(200).json({ 
            message: `Cleaned up ${releasedCount} stale team locks`,
            releasedCount 
        });
    } catch (error) {
        res.status(500).json({ message: "Error cleaning up stale locks", error: error.message });
    }
});

export default router;