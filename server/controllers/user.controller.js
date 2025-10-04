import User from '../models/user.model.js';
import Team from '../models/team.model.js';
import bcrypt from 'bcryptjs';

// --- Get All Users ---
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('-user_password')
            .populate('current_hackathon', 'name'); // Changed to 'name' for consistency
        
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

// --- Get Available Participants ---
// This function finds users who are 'participants' AND are not currently in a hackathon.
export const getAvailableParticipants = async (req, res) => {
    try {
        // Find users that meet both criteria:
        // 1. Their role is 'participant'
        // 2. Their 'current_hackathon' field is null (meaning they are not assigned)
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

// --- Register User ---
export const registerUser = async (req, res) => {
    try {
        const { user_name, user_email, user_password, user_phoneno, college_name } = req.body;

        if (!user_name || !user_email || !user_password) {
            return res.status(400).json({ message: "Username, email, and password are required." });
        }

        const existingUser = await User.findOne({ user_email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        const hashedPassword = await bcrypt.hash(user_password, 12);

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

// --- Update User Role and Hackathon Assignment ---
export const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, current_hackathon } = req.body; 

        const allowedRoles = ['admin', 'evaluator', 'coordinator', 'participant'];

        if (!role || !allowedRoles.includes(role)) {
            return res.status(400).json({ 
                message: `Invalid role provided. Allowed roles: ${allowedRoles.join(', ')}.` 
            });
        }
        
        // If current_hackathon is explicitly passed as an empty string or null, set it to null.
        // Otherwise, use the provided value.
        const updateData = { 
            role_name: role, 
            current_hackathon: current_hackathon || null
        };
        
        const updatedUser = await User.findByIdAndUpdate(
            id,
            updateData, 
            { new: true, runValidators: true } 
        ).select('-user_password'); 

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ message: 'User updated successfully.', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user role', error: error.message });
    }
};

// --- Delete User ---
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        await Team.updateMany(
            { members: id },
            { $pull: { members: id } }
        );
        
        const deletedUser = await User.findByIdAndDelete(id);
        
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};