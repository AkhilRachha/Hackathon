// ../routes/college.routes.js

import express from 'express';
// Import the new controller functions
import { getStates, getCollegesByState, addCollege } from '../controllers/college.controller.js';

const router = express.Router();

// NEW Route to get all unique states
router.get('/states', getStates);

// NEW Route to get colleges by state name
// The ':stateName' is a URL parameter
router.get('/colleges/:stateName', getCollegesByState);

// Route for adding a new college remains the same
router.post('/colleges', addCollege);

export default router;