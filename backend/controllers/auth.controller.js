import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
    OK,
    BAD_REQUEST,
    UNAUTHORIZED,
    NOT_FOUND,
    INTERNAL_SERVER_ERROR
} from 'http-status-codes';

export const loginUser = async (req, res) => {
    try {
        const { user_email, user_password } = req.body;

        if (!user_email || !user_password) {
            return res.status(BAD_REQUEST).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ user_email });
        if (!user) {
            return res.status(UNAUTHORIZED).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(user_password, user.user_password);
        if (!isMatch) {
            return res.status(UNAUTHORIZED).json({ message: 'Invalid credentials' });
        }

        const payload = { id: user._id, role: user.role_name };

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET environment variable is not set!");
            return res.status(INTERNAL_SERVER_ERROR).json({ message: 'Server configuration error' });
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(OK).json({
            message: 'Login successful',
            token: token,
            user: {
                _id: user._id,
                user_name: user.user_name,
                role_name: user.role_name,
                current_hackathon: user.current_hackathon
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(INTERNAL_SERVER_ERROR).json({ message: 'Error logging in', error: error.message });
    }
};

export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).select('-user_password');
        if (!user) {
            return res.status(NOT_FOUND).json({ message: 'User not found' });
        }
        res.status(OK).json({
            message: 'User data retrieved successfully',
            user: {
                _id: user._id,
                user_name: user.user_name,
                user_email: user.user_email,
                role_name: user.role_name,
                current_hackathon: user.current_hackathon
            }
        });
    } catch (error) {
        console.error("Get current user error:", error);
        res.status(INTERNAL_SERVER_ERROR).json({ message: 'Error retrieving user data', error: error.message });
    }
};