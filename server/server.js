import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';

// --- Import all your route files here ---
import userRoutes from './routes/user.routes.js';
import teamRoutes from './routes/team.routes.js';
import questionRoutes from './routes/question.routes.js';
import collegeRoutes from './routes/college.routes.js'; // The missing import
import authRoutes from './routes/auth.routes.js';

// Load environment variables
dotenv.config();

// Initialize the Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to the database
connectDB();

// --- Global Middleware ---
// Enable Cross-Origin Resource Sharing (CORS) for all routes
app.use(cors());
// Parse incoming JSON requests
app.use(express.json());

// --- API Routes ---
// This section tells the server which router to use for different URL paths.
// All routes are prefixed with '/api' for consistency.

app.use('/api', userRoutes);
app.use('/api', teamRoutes);
app.use('/api', questionRoutes);
app.use('/api', collegeRoutes); // The missing line that fixes the 404 error
app.use('/api/auth', authRoutes);

// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

