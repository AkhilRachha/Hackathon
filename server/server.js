import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';

// Import routes
import collegeRoutes from './routes/college.routes.js';
import userRoutes from './routes/user.routes.js';
import questionRoutes from './routes/question.routes.js';
import roleRoutes from './routes/role.routes.js';
import teamRoutes from './routes/team.routes.js';

// Configure dotenv to be silent
dotenv.config({ quiet: true });

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', collegeRoutes);
app.use('/api/user', userRoutes);
app.use('/api', questionRoutes);
app.use('/api', roleRoutes);
app.use('/api', teamRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});