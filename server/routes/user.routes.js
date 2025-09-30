import express from 'express';
import { getAvailableParticipants, updateUserRole, getAllUsers } from '../controllers/user.controller.js';

const router = express.Router();

// --- User Management Routes (Mounted under /api/users) ---

// Handles GET requests to /api/users/
router.get('/', getAllUsers); 

// Handles PUT requests to /api/users/:id/role
router.put('/:id/role', updateUserRole);

// Handles GET requests to /api/users/participants/available
router.get('/participants/available', getAvailableParticipants);

export default router;
