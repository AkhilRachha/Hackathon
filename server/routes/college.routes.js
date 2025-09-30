// ../routes/college.routes.js

import express from 'express';
// Import all necessary controller functions
import { 
    getColleges, 
    getStates, 
    getCollegesByState, 
    addCollege 
} from '../controllers/college.controller.js';

const router = express.Router();

// 1. Route to get ALL colleges (accessible at /api/colleges)
router.get('/', getColleges); 

// 2. FIX/CLARIFICATION: Route to get all unique states
// This combines with the app.js mount to be /api/colleges/states
router.get('/states', getStates); 

// 3. Route to get colleges by state name
// This combines with the app.js mount to be /api/colleges/colleges/:stateName
router.get('/colleges/:stateName', getCollegesByState); 

// 4. Route for adding a new college
router.post('/colleges', addCollege);

export default router;