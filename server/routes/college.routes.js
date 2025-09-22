import express from 'express';
import { getColleges, addCollege } from '../controllers/college.controller.js';

const router = express.Router();

router.get('/colleges', getColleges);
router.post('/colleges', addCollege);

export default router;