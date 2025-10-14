import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model.js';

// Load environment variables
dotenv.config();

const createIndexes = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Create unique indexes
        await User.collection.createIndex({ user_email: 1 }, { unique: true });
        await User.collection.createIndex({ user_phoneno: 1 }, { unique: true });
        
        console.log('Unique indexes created successfully for user_email and user_phoneno');
        
        // Close connection
        await mongoose.connection.close();
        console.log('Database connection closed');
        
    } catch (error) {
        console.error('Error creating indexes:', error);
        process.exit(1);
    }
};

createIndexes();