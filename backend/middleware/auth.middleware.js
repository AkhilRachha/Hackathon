// server/middleware/auth.middleware.js

import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import {
    UNAUTHORIZED,
    FORBIDDEN,
    NOT_FOUND,
    INTERNAL_SERVER_ERROR
} from 'http-status-codes';

export const verifyUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(UNAUTHORIZED).json({ message: "Authentication failed: No token provided." });
        }

        const token = authHeader.split(' ')[1];
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find the user by ID from the token, excluding the password
        const user = await User.findById(decoded.id).select('-user_password');

        if (!user) {
            return res.status(NOT_FOUND).json({ message: "Authentication failed: User not found." });
        }

        // Attach the full user object to the request
        req.user = user;
        next();

    } catch (error) {
        console.error("Authentication middleware error:", error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(FORBIDDEN).json({ message: "Authentication failed: Invalid token." });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(FORBIDDEN).json({ message: "Authentication failed: Token has expired." });
        }
        return res.status(INTERNAL_SERVER_ERROR).json({ message: "Internal server error during authentication." });
    }
};

export const verifyRole = (roles) => (req, res, next) => {
    // Check if the user object exists and if their role is included in the required roles
    if (!req.user || !roles.includes(req.user.role_name)) {
        return res.status(FORBIDDEN).json({ message: "Access denied: You do not have the required role." });
    }
    next();
};