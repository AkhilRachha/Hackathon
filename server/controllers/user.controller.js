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
            role_id
            // user_github_url is no longer received from the request body
        } = req.body;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user_password, salt);

        const newUser = new User({
            user_name,
            user_email,
            user_password: hashedPassword,
            user_phoneno,
            clg_id,
            role_id
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};

export const getAvailableParticipants = async (req, res) => {
    try {
        const teams = await Team.find({}, 'members');
        const assignedUserIds = teams.flatMap(team => team.members);

        const participantRoleId = '68d1f884ce0af1a5778f50c1';
        const availableUsers = await User.find({ 
            _id: { $nin: assignedUserIds },
            role_id: participantRoleId 
        });
        
        res.status(200).json(availableUsers);
    } catch (error) {
        console.error("Error fetching available participants:", error);
        res.status(500).json({ message: "Server error while fetching participants" });
    }
};
