import express from 'express';

// 1. Import all the controller functions you need for this file
import { registerUser, getAvailableParticipants, updateUserRole } from '../controllers/user.controller.js';
import { loginUser } from '../controllers/auth.controller.js'; // Assuming loginUser is in auth.controller.js

const router = express.Router();

// --- All user and auth routes are now in one place for clarity ---

// Handles POST requests to /api/register
router.post('/register', registerUser);

// Handles POST requests to /api/login
router.post('/login', loginUser);

// Handles GET requests to /api/participants/available
router.get('/participants/available', getAvailableParticipants);

// --- NEW: Route to update a user's role ---
router.put('/users/:userId/role', updateUserRole);

// --- NEW: Route to get all users for admin ---
router.get('/users', getUsers);

router.put('/users/:userId/role', updateUserRole);

export default router;