import express from 'express';
// Assuming these controller functions are imported from '../controllers/user.controller.js'
// or a dedicated auth controller if you prefer.
import { registerUser } from '../controllers/user.controller.js'; 
import { loginUser, getCurrentUser } from '../controllers/auth.controller.js';
import { verifyUser } from '../middleware/auth.middleware.js';

const router = express.Router();

// --- Authentication Routes (Mounted under /api) ---

// Handles POST requests to /api/register
router.post('/register', registerUser);

// Handles POST requests to /api/login 
router.post('/login', loginUser);

// Handles GET requests to /api/auth/me (requires authentication)
router.get('/auth/me', verifyUser, getCurrentUser);

export default router;
