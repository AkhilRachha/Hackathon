import express from 'express';
import { getAvailableParticipants, updateUserRole, getAllUsers, deleteUser } from '../controllers/user.controller.js';
// Assuming verifyAdmin middleware is used for these sensitive operations

const router = express.Router();

// --- User Management Routes (Mounted under /api/users) ---

// Handles GET requests to /api/users/ (Used by RoleMapping to get all users)
router.get('/', getAllUsers); 

// Handles PUT requests to /api/users/:id/role (Used by RoleMapping to assign/unassign)
router.put('/:id/role', updateUserRole); // Add verifyAdmin middleware here

// Handles DELETE requests to /api/users/:id (Used by AdminDashboard to suspend users)
router.delete('/:id', deleteUser);

// Handles GET requests to /api/users/participants/available
router.get('/participants/available', getAvailableParticipants);

export default router;