import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; // 1. IMPORT JWT


export const loginUser = async (req, res) => {
    try {
        const { user_email, user_password } = req.body;

        // --- Add these console logs for debugging ---
        console.log(`Login attempt for: ${user_email}`);
        const user = await User.findOne({ user_email });
        
        if (!user) {
            console.log("User not found in DB.");
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        console.log("User found. Comparing passwords...");

        const isMatch = await bcrypt.compare(user_password, user.user_password);
        console.log("Password match result:", isMatch); // This should be TRUE

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // --- FIX IS HERE: GENERATE AND SEND A TOKEN ---

        // 2. Create a JWT payload
        const payload = {
            id: user._id,
            role: user.role_id
        };

        // 3. Sign the token
        const token = jwt.sign(
            payload, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' } // Token expires in 1 day
        );
        
        // 4. Send the response in the format the frontend expects
        res.status(200).json({ 
            message: 'Login successful', 
            token: token, // The frontend needs this!
            user: {
                _id: user._id,
                user_name: user.user_name,
                role_id: user.role_id
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: 'Error logging in', error });
    }
};