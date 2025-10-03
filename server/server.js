// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';

// --- Import all your route files here ---
import userRoutes from './routes/user.routes.js';
import teamRoutes from './routes/team.routes.js';
import questionRoutes from './routes/question.routes.js'; 
import collegeRoutes from './routes/college.routes.js';
import roleRoutes from './routes/role.routes.js'; 
import authRoutes from './routes/auth.routes.js'; 
import scoreRoutes from './routes/score.routes.js';
import evaluationRoutes from './routes/evaluation.routes.js';
import winnerRoutes from './routes/hackathonWinner.routes.js';
import hackathonRoutes from './routes/hackathon.routes.js'; // Hackathon management routes

// Load environment variables
dotenv.config();

// Initialize the Express app
const app = express();
const PORT = process.env.PORT || 8000;

// Connect to the database
connectDB(); 

// --- Global Middleware ---
app.use(cors());
app.use(express.json());

// --- API Routes ---

// AUTH ROUTES: /api/login, /api/register
app.use('/api', authRoutes); 

// CORE RESOURCE ROUTES: Ensure mounted paths match client expectations
app.use('/api/users', userRoutes); 
app.use('/api/teams', teamRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/winners', winnerRoutes);
app.use('/api/hackathons', hackathonRoutes); // ✅ Correct: All hackathon routes start here

// QUESTION ROUTES (Mounted strangely, but matching the provided structure)
app.use('/api', questionRoutes); 

// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});