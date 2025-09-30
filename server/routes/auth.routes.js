import express from 'express';
// Assuming these controller functions are imported from '../controllers/user.controller.js'
// or a dedicated auth controller if you prefer.
import { registerUser } from '../controllers/user.controller.js'; 
import { loginUser } from '../controllers/auth.controller.js'; // Assuming this is correct

const router = express.Router();

// --- Authentication Routes (Mounted under /api) ---

// Handles POST requests to /api/register
router.post('/register', registerUser);

// Handles POST requests to /api/login 
router.post('/login', loginUser);

export default router;
