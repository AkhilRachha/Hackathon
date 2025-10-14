import express from 'express';
import { getRoles, addRole } from '../controllers/role.controller.js';

const router = express.Router();

router.get('/roles', getRoles);
router.post('/roles', addRole);

export default router;