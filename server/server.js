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
// ADDED: Import the new dedicated Auth Routes
import authRoutes from './routes/auth.routes.js'; 
import scoreRoutes from './routes/score.routes.js';
import evaluationRoutes from './routes/evaluation.routes.js';
import winnerRoutes from './routes/hackathonWinner.routes.js';
import hackathonRoutes from './routes/hackathon.routes.js';

// Load environment variables
dotenv.config();

// Initialize the Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to the database
connectDB(); 

// --- Global Middleware ---
app.use(cors());
app.use(express.json());

// --- API Routes ---

// AUTH ROUTES: Mounted directly under /api for /api/login and /api/register
app.use('/api', authRoutes); 

// USER MANAGEMENT ROUTES: Mounted under /api/users for user list and role mapping
app.use('/api/users', userRoutes); 

// Other Resource Routes (Mounted correctly under their respective resource name)
app.use('/api/teams', teamRoutes);
app.use('/api', questionRoutes); 
app.use('/api/colleges', collegeRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/winners', winnerRoutes);
app.use('/api/hackathons', hackathonRoutes); 

// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
