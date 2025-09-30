import User from '../models/user.model.js';
import Team from '../models/team.model.js';
import bcrypt from 'bcryptjs';

export const registerUser = async (req, res) => {
    try {
        const {
            user_name,
            user_email,
            user_password,
            user_phoneno,
            clg_id,
            // FIX: Changed 'role_id' to 'role_name' to match the Mongoose schema.
            // This ensures 'admin' is captured from the Postman request body.
            role_name 
            // user_github_url is no longer received from the request body
        } = req.body;

        // Check if user already exists (Good practice, adding a quick check here)
        const existingUser = await User.findOne({ user_email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }


        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user_password, salt);

        const newUser = new User({
            user_name,
            user_email,
            user_password: hashedPassword,
            user_phoneno,
            clg_id,
            // FIX: Assigning the captured role_name (e.g., "admin")
            // If role_name is provided, it overrides the 'participant' default.
            role_name
        });

        await newUser.save();
        
        // Remove password before sending the response
        const userResponse = newUser.toObject();
        delete userResponse.user_password;
        
        res.status(201).json({ message: 'User registered successfully', user: userResponse });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};

export const getAvailableParticipants = async (req, res) => {
    try {
        const teams = await Team.find({}, 'members');
        const assignedUserIds = teams.flatMap(team => team.members);

        // FIX: Changed from hardcoded ObjectId to the string 'participant'
        const participantRoleName = 'participant'; 
        
        const availableUsers = await User.find({
            _id: { $nin: assignedUserIds },
            // FIX: Querying on the new field name 'role_name'
            role_name: participantRoleName 
        });
        
        res.status(200).json(availableUsers);
    } catch (error) {
        console.error("Error fetching available participants:", error);
        res.status(500).json({ message: "Server error while fetching participants" });
    }
};

// --- Updated Function to Update User Role ---
export const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        // Assuming the request body sends the new role under the key 'role'
        const { role } = req.body; 

        // Included 'admin' in allowed roles since an existing admin might use this route
        // to assign admin roles to new users.
        const allowedRoles = ['admin', 'evaluator', 'coordinator', 'participant'];

        if (!role || !allowedRoles.includes(role)) {
            return res.status(400).json({ 
                message: `Invalid role provided. Allowed roles: ${allowedRoles.join(', ')}.` 
            });
        }

        // FIX: Updating the 'role_name' field in the database
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { role_name: role }, // Use the correct field name 'role_name'
            { new: true, runValidators: true } 
        ).select('-user_password'); 

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ message: 'User role updated successfully.', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user role', error: error.message });
    }
};

// File: user.controller.js (Modified getAllUsers function)

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            // Ensure the populate path is correct: 'clg_id'
            .populate('clg_id', 'clg_name state') 
            .select('-user_password'); 
        res.status(200).json(users);
    } catch (error) {
        // FIX: Add detailed server-side error logging to diagnose the Mongoose issue (e.g., failed populate)
        console.error("Detailed Error fetching users:", error); 
        res.status(500).json({ 
            message: 'Error fetching users from server. Check server logs for populate issues.', 
            error: error.message 
        });
    }
};