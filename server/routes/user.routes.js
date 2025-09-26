import express from 'express';

// 1. Import all the controller functions you need for this file
import { registerUser, getAvailableParticipants } from '../controllers/user.controller.js';
import { loginUser } from '../controllers/auth.controller.js'; // Assuming loginUser is in auth.controller.js

const router = express.Router();

// --- All user and auth routes are now in one place for clarity ---

// Handles POST requests to /api/register
router.post('/register', registerUser);

// Handles POST requests to /api/login
router.post('/login', loginUser);

// Handles GET requests to /api/participants/available
router.get('/participants/available', getAvailableParticipants);

export default router;
