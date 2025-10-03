import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const loginUser = async (req, res) => {
    try {
        const { user_email, user_password } = req.body;

        const user = await User.findOne({ user_email });
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(user_password, user.user_password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // 2. Create a JWT payload
        const payload = {
            id: user._id,
            role: user.role_name 
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
            token: token, 
            user: {
                _id: user._id,
                user_name: user.user_name,
                role_name: user.role_name,
                // ➡️ NEW: Send the current hackathon ID
                current_hackathon: user.current_hackathon 
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};