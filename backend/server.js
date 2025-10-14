import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import hackathonScheduler from './services/scheduler.js';

// --- Import all your route files here ---
import userRoutes from './routes/user.routes.js';
import teamRoutes from './routes/team.routes.js';
import questionRoutes from './routes/question.routes.js';
import collegeRoutes from './routes/college.routes.js';
import roleRoutes from './routes/role.routes.js';
import authRoutes from './routes/auth.routes.js';
import scoreRoutes from './routes/score.routes.js';
import evaluationRoutes from './routes/evaluation.routes.js';
import hackathonRoutes from './routes/hackathon.routes.js';

// Load environment variables
dotenv.config();

// Initialize the Express app
const app = express();
const PORT = process.env.PORT || 9000; // Ensure port matches frontend config

// Connect to the database
connectDB();

// --- Global Middleware ---
app.use(cors());
app.use(express.json());



// --- API Routes ---
app.use('/api', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/evaluations', evaluationRoutes);

app.use('/api/hackathons', hackathonRoutes);

// --- ⬇️  FIXED HERE ⬇️ ---
// This correctly mounts all question routes under the /api/questions path
app.use('/api/questions', questionRoutes);

// --- Start the Server ---
const server = app.listen(PORT, 'localhost', () => {
    console.log(`Server is running on http://localhost:${PORT}`);

    // Start hackathon scheduler with more frequent checks
    hackathonScheduler.start(0.25); // 15 second interval for more responsive activation
});

server.on('error', (error) => {
    console.error('Server error:', error);
});
