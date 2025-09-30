import Role from '../models/role.model.js';

export const getRoles = async (req, res) => {
    try {
        // Fetch all role documents
        const roles = await Role.find();
        
        // 🛠️ CHANGE: Map the results to return only the role_name strings.
        // This is often what the frontend select field expects.
        const roleNames = roles.map(role => role.role_name);
        
        // Return the array of role names
        res.status(200).json(roleNames);
    } catch (error) {
        // 🛠️ CHANGE: Log the detailed error to the console for debugging
        console.error("Critical Error fetching roles:", error); 
        
        // Return a 500 error with the specific message
        res.status(500).json({ 
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
        res.status(201).json(newRole);
    } catch (error) {
        res.status(500).json({ message: 'Error adding role', error: error.message });
    }
};