import jwt from 'jsonwebtoken';

/**
 * Middleware to verify a JWT token and attach user data (userId, role) to the request object.
 * Assumes the token is passed in the 'Authorization' header as 'Bearer <token>'.
 * Assumes JWT_SECRET is defined in your environment variables.
 */
export const verifyUser = (req, res, next) => {
    // 1. Check for the token in the Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access denied. No token provided or invalid format.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // 2. Verify the token using the secret key
        // NOTE: Uses the JWT_SECRET environment variable
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Attach decoded user information to the request object
        // The ID should match the key used in your login controller (e.g., 'id' or 'userId')
        req.userId = decoded.id; 
        req.userRole = decoded.role;
        
        // 4. Proceed to the next middleware/controller function
        next();
    } catch (error) {
        // Handle invalid, expired, or tampered tokens
        return res.status(401).json({ message: 'Invalid token.' });
    }
};