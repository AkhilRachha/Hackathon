import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Configure dotenv to be silent
dotenv.config({ quiet: true });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Atlas connected successfully to: ${conn.connection.name}`);
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        console.log('Server will continue without database connection...');
        // Don't exit, let server start anyway for testing
    }
};

export default connectDB;