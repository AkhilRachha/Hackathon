import User from '../models/user.model.js';
import Team from '../models/team.model.js';
import Hackathon from '../models/hackathon.model.js';
import bcrypt from 'bcryptjs';
import {
    OK,
    CREATED,
    BAD_REQUEST,
    NOT_FOUND,
    INTERNAL_SERVER_ERROR
} from 'http-status-codes';

// --- Get All Users ---
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-user_password').populate('current_hackathon', 'name');
        res.status(OK).json(users);
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(INTERNAL_SERVER_ERROR).json({ message: 'Error fetching users', error: error.message });
    }
};

// --- Get Available Participants ---
export const getAvailableParticipants = async (req, res) => {
    try {
        const coordinatorId = req.userId; // From auth middleware
        const coordinator = await User.findById(coordinatorId);
        if (!coordinator || !coordinator.current_hackathon) {
            return res.status(BAD_REQUEST).json({ message: 'Coordinator not assigned to any hackathon' });
        }
        const participants = await User.find({
            role_name: 'participant',
            current_hackathon: coordinator.current_hackathon
        }).select('-user_password');
        res.status(OK).json(participants);
    } catch (error) {
        console.error('Error fetching available participants:', error);
        res.status(INTERNAL_SERVER_ERROR).json({ message: 'Error fetching available participants', error: error.message });
    }
};

// --- Register User (Public) ---
export const registerUser = async (req, res) => {
    try {
        const { user_name, user_email, user_password, user_phoneno, college_name } = req.body;

        if (!user_name || !user_email || !user_password || !user_phoneno) {
            return res.status(BAD_REQUEST).json({ message: "Username, email, password, and phone number are required." });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(user_email)) {
            return res.status(BAD_REQUEST).json({ message: "Please provide a valid email address." });
        }

        const phoneRegex = /^\d{10,15}$/;
        if (!phoneRegex.test(user_phoneno)) {
            return res.status(BAD_REQUEST).json({ message: "Please provide a valid phone number (10-15 digits)." });
        }

        const existingUserByEmail = await User.findOne({ user_email });
        if (existingUserByEmail) {
            return res.status(BAD_REQUEST).json({ message: 'User already exists with this email address' });
        }

        const existingUserByPhone = await User.findOne({ user_phoneno });
        if (existingUserByPhone) {
            return res.status(BAD_REQUEST).json({ message: 'User already exists with this phone number' });
        }

        const hashedPassword = await bcrypt.hash(user_password, 12);
        const newUser = new User({
            user_name,
            user_email,
            user_password: hashedPassword,
            user_phoneno,
            college_name,
            role_name: 'participant'
        });
        await newUser.save();
        res.status(CREATED).json({
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
        res.status(INTERNAL_SERVER_ERROR).json({ message: 'Error registering user', error: error.message });
    }
};

// --- Update User Role and Hackathon Assignment (Admin) ---
export const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, current_hackathon, newCoordinatorId } = req.body;
        const allowedRoles = ['admin', 'evaluator', 'coordinator', 'participant'];

        if (role && !allowedRoles.includes(role)) {
            return res.status(BAD_REQUEST).json({ message: `Invalid role. Allowed: ${allowedRoles.join(', ')}.` });
        }

        // Get current user data
        const currentUser = await User.findById(id);
        if (!currentUser) {
            return res.status(NOT_FOUND).json({ message: 'User not found.' });
        }

        // Check if user is currently a coordinator and being changed/removed
        if (currentUser.role_name === 'coordinator' && role !== 'coordinator') {
            // Find teams where this user is coordinator
            const teamsAsCoordinator = await Team.find({ coordinator_id: id });
            
            if (teamsAsCoordinator.length > 0) {
                if (!newCoordinatorId) {
                    return res.status(BAD_REQUEST).json({ 
                        message: 'This user is a coordinator for one or more teams. Please assign a new coordinator before changing their role.',
                        teamsCount: teamsAsCoordinator.length,
                        requiresNewCoordinator: true
                    });
                }

                // Validate new coordinator
                const newCoordinator = await User.findById(newCoordinatorId);
                if (!newCoordinator) {
                    return res.status(NOT_FOUND).json({ message: 'New coordinator not found.' });
                }

                if (newCoordinator.role_name !== 'coordinator' && newCoordinator.role_name !== 'participant') {
                    return res.status(BAD_REQUEST).json({ message: 'New coordinator must be a coordinator or participant.' });
                }

                // Update teams with new coordinator
                await Team.updateMany(
                    { coordinator_id: id },
                    { coordinator_id: newCoordinatorId }
                );

                // If new coordinator was a participant, promote them
                if (newCoordinator.role_name === 'participant') {
                    await User.findByIdAndUpdate(newCoordinatorId, { role_name: 'coordinator' });
                }
            }
        }

        if (current_hackathon && role && role !== 'admin') {
            const hackathon = await Hackathon.findById(current_hackathon);
            if (!hackathon) {
                return res.status(NOT_FOUND).json({ message: 'Hackathon not found.' });
            }

            if (role === 'coordinator') {
                const count = await User.countDocuments({ current_hackathon, role_name: 'coordinator' });
                if (count >= hackathon.limits.totalCoordinators) {
                    return res.status(BAD_REQUEST).json({ message: `Coordinator limit (${hackathon.limits.totalCoordinators}) reached.` });
                }
            } else if (role === 'evaluator') {
                const count = await User.countDocuments({ current_hackathon, role_name: 'evaluator' });
                if (count >= hackathon.limits.totalEvaluators) {
                    return res.status(BAD_REQUEST).json({ message: `Evaluator limit (${hackathon.limits.totalEvaluators}) reached.` });
                }
            } else if (role === 'participant') {
                const count = await User.countDocuments({ current_hackathon, role_name: 'participant' });
                if (count >= hackathon.limits.totalParticipants) {
                    return res.status(BAD_REQUEST).json({ message: `Participant limit (${hackathon.limits.totalParticipants}) reached.` });
                }
            }
        }

        const updateData = { role_name: role, current_hackathon: current_hackathon || null };
        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select('-user_password');

        if (!updatedUser) {
            return res.status(NOT_FOUND).json({ message: 'User not found.' });
        }
        res.status(OK).json({ message: 'User updated successfully.', user: updatedUser });
    } catch (error) {
        res.status(INTERNAL_SERVER_ERROR).json({ message: 'Error updating user role', error: error.message });
    }
};

// --- Delete User (Admin) ---
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await Team.updateMany({ members: id }, { $pull: { members: id } });
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(NOT_FOUND).json({ message: 'User not found' });
        }
        res.status(OK).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(INTERNAL_SERVER_ERROR).json({ message: 'Error deleting user', error: error.message });
    }
};

// Assign hackathon to user
export const assignHackathonToUser = async (req, res) => {
    try {
        const { userId, hackathonId } = req.body;
        if (!userId || !hackathonId) {
            return res.status(BAD_REQUEST).json({ message: "User ID and Hackathon ID are required" });
        }
        const hackathon = await Hackathon.findById(hackathonId);
        if (!hackathon) {
            return res.status(NOT_FOUND).json({ message: "Hackathon not found" });
        }
        const user = await User.findByIdAndUpdate(userId, { current_hackathon: hackathonId }, { new: true }).select('-user_password');
        if (!user) {
            return res.status(NOT_FOUND).json({ message: "User not found" });
        }
        res.status(OK).json({
            message: `User ${user.user_name} assigned to hackathon ${hackathon.hackathon_name}`,
            user: user,
            hackathon: hackathon
        });
    } catch (error) {
        console.error("Error assigning hackathon to user:", error);
        res.status(INTERNAL_SERVER_ERROR).json({ message: "Server error while assigning hackathon", error: error.message });
    }
};

// Get coordinator info for role change validation
export const getCoordinatorInfo = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        
        if (!user) {
            return res.status(NOT_FOUND).json({ message: 'User not found' });
        }

        if (user.role_name !== 'coordinator') {
            return res.status(OK).json({ 
                isCoordinator: false,
                teamsCount: 0,
                teams: []
            });
        }

        // Find teams where this user is coordinator
        const teams = await Team.find({ coordinator_id: id })
            .populate('members', 'user_name')
            .select('team_name members');

        // Get available coordinators for replacement (excluding current user)
        // Include all coordinators and only participants who are NOT in teams
        const allPotentialCoordinators = await User.find({
            _id: { $ne: id },
            current_hackathon: user.current_hackathon,
            role_name: { $in: ['coordinator', 'participant'] }
        }).select('user_name user_email role_name');

        // Get all teams in the hackathon to filter out participants who are already team members
        const allTeams = await Team.find({ hackathon_id: user.current_hackathon });
        const allocatedMemberIds = new Set();
        
        allTeams.forEach(team => {
            team.members.forEach(member => {
                allocatedMemberIds.add(member.toString());
            });
        });

        // Filter: include all coordinators + only participants who are NOT in teams
        const availableCoordinators = allPotentialCoordinators.filter(coordinator => {
            if (coordinator.role_name === 'coordinator') {
                return true; // Include all coordinators
            }
            // For participants, only include those NOT allocated to teams
            return !allocatedMemberIds.has(coordinator._id.toString());
        });

        res.status(OK).json({
            isCoordinator: true,
            teamsCount: teams.length,
            teams: teams,
            availableCoordinators: availableCoordinators
        });
    } catch (error) {
        console.error('Error getting coordinator info:', error);
        res.status(INTERNAL_SERVER_ERROR).json({ message: 'Error getting coordinator info', error: error.message });
    }
};