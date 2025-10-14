import express from 'express';
import { 
    getAllUsers, 
    getAvailableParticipants, 
    updateUserRole, 
    deleteUser,
    assignHackathonToUser,
    getCoordinatorInfo
} from '../controllers/user.controller.js';
import { verifyUser, verifyRole } from '../middleware/auth.middleware.js';

const router = express.Router();

// --- User Management Routes (Mounted under /api/users) ---

// --- (Admin AND Coordinator) ---
router.get(
    '/', 
    verifyUser, 
    verifyRole(['admin', 'coordinator']), // ✅ Corrected permissions
    getAllUsers
);

// Update a user's role or hackathon assignment (Protected: Admin only)
router.put(
    '/:id/role', 
    verifyUser, 
    verifyRole(['admin']), 
    updateUserRole
);

// Delete a user (Protected: Admin only)
router.delete(
    '/:id', 
    verifyUser, 
    verifyRole(['admin']), 
    deleteUser
);

// Get participants who are not in any hackathon (Protected: Admins and Coordinators)
router.get(
    '/participants/available', 
    verifyUser, 
    verifyRole(['admin', 'coordinator']), 
    getAvailableParticipants
);

// Assign hackathon to user (Protected: Admin only)
router.post(
    '/assign-hackathon',
    verifyUser,
    verifyRole(['admin']),
    assignHackathonToUser
);

// Get coordinator info for role change validation (Protected: Admin only)
router.get(
    '/:id/coordinator-info',
    verifyUser,
    verifyRole(['admin']),
    getCoordinatorInfo
);

export default router;