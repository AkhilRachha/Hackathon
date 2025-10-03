import User from '../models/user.model.js';
import Team from '../models/team.model.js';
import bcrypt from 'bcryptjs';

// --- Get All Users (for Role Mapping) ---
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('-user_password')
            .populate('current_hackathon', 'title');
        
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

// --- Get Available Participants ---
export const getAvailableParticipants = async (req, res) => {
    try {
        const participants = await User.find({
            role_name: 'participant',
            current_hackathon: null
        }).select('-user_password');
        
        res.status(200).json(participants);
    } catch (error) {
        console.error('Error fetching available participants:', error);
        res.status(500).json({ message: 'Error fetching available participants', error: error.message });
    }
};

// --- Register User (placeholder for existing implementation) ---
export const registerUser = async (req, res) => {
    try {
        const { user_name, user_email, user_password, user_phoneno, college_name } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ user_email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(user_password, 12);

        // Create new user
        const newUser = new User({
            user_name,
            user_email,
            user_password: hashedPassword,
            user_phoneno,
            college_name,
            role_name: 'participant' // Default role
        });

        await newUser.save();

        res.status(201).json({ 
            message: 'User registered successfully', 
            user: { 
                _id: newUser._id, 
                user_name: newUser.user_name, 
                user_email: newUser.user_email,
                role_name: newUser.role_name
            } 
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};


// ➡️ MODIFIED: Function to Update User Role for Mapping (Transfer List)
export const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        // Capture 'role' (new role_name) and 'current_hackathon'
        const { role, current_hackathon } = req.body; 

        const allowedRoles = ['admin', 'evaluator', 'coordinator', 'participant'];

        if (!role || !allowedRoles.includes(role)) {
            return res.status(400).json({ 
                message: `Invalid role provided. Allowed roles: ${allowedRoles.join(', ')}.` 
            });
        }
        
        const updateData = { 
            role_name: role, 
            current_hackathon: current_hackathon || null // Clear if null is passed
        };
        
        const updatedUser = await User.findByIdAndUpdate(
            id,
            updateData, 
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

// --- Delete User (for admin suspension) ---
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Remove user from any teams first
        await Team.updateMany(
            { members: id },
            { $pull: { members: id } }
        );
        
        // Delete the user
        const deletedUser = await User.findByIdAndDelete(id);
        
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};