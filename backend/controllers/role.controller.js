import Role from '../models/role.model.js';
import {
    OK,
    CREATED,
    INTERNAL_SERVER_ERROR
} from 'http-status-codes';

export const getRoles = async (req, res) => {
    try {
        // Fetch all role documents
        const roles = await Role.find();
        
        // Map the results to return only the role_name strings.
        const roleNames = roles.map(role => role.role_name);
        
        // Return the array of role names
        res.status(OK).json(roleNames);
    } catch (error) {
        // Log the detailed error to the console for debugging
        console.error("Critical Error fetching roles:", error); 
        
        // Return a 500 error with the specific message
        res.status(INTERNAL_SERVER_ERROR).json({ 
            message: 'Error fetching roles from server. Check server logs for Model/DB issues.', 
            error: error.message 
        });
    }
};

export const addRole = async (req, res) => {
    try {
        const { role_name, description } = req.body;
        const newRole = new Role({ role_name, description });
        await newRole.save();
        res.status(CREATED).json(newRole);
    } catch (error) {
        res.status(INTERNAL_SERVER_ERROR).json({ message: 'Error adding role', error: error.message });
    }
};