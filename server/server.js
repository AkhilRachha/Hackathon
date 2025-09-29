import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';

// --- Import all your route files here ---
import userRoutes from './routes/user.routes.js';
import teamRoutes from './routes/team.routes.js';
import questionRoutes from './routes/question.routes.js'; // The new import
import collegeRoutes from './routes/college.routes.js';
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
app.use('/api', userRoutes);
app.use('/api', teamRoutes);
app.use('/api', questionRoutes); // The new line that adds the question routes
app.use('/api', collegeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', scoreRoutes);
app.use('/api', evaluationRoutes);
app.use('/api', winnerRoutes);
app.use('/api', hackathonRoutes);

// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
