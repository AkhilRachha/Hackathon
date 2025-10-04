import Team from '../models/team.model.js';
import User from '../models/user.model.js'; // ADDED: Import User model to update participants

// --- Function to get all teams ---
export const getTeams = async (req, res) => {
    try {
        const teams = await Team.find()
            .populate('members', 'user_name') 
            .populate('q_id', 'q_title')      
            .populate('coordinator', 'user_name');
        res.status(200).json(teams);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching teams', error: error.message });
    }
};

// --- Function to create a new team ---
export const createTeam = async (req, res) => {
    try {
        const { team_name, members, q_id, coordinator, user_github_url, max_members, hackathon_id } = req.body;

        if (!team_name || !members || !q_id || !coordinator || !hackathon_id) {
            return res.status(400).json({ message: "Missing required fields for team creation." });
        }

        const existingTeam = await Team.findOne({ team_name, hackathon_id });
        if (existingTeam) {
            return res.status(400).json({ message: "A team with this name already exists in this hackathon." });
        }

        const newTeam = new Team({
            team_name, members, q_id, coordinator,
            user_github_url, max_members, hackathon_id
        });

        await newTeam.save();
        
        // This is the critical step to make participants "unavailable"
        await User.updateMany(
            { _id: { $in: members } },
            { $set: { current_hackathon: hackathon_id } }
        );

        const populatedTeam = await Team.findById(newTeam._id)
            .populate('members', 'user_name user_email')
            .populate('q_id')
            .populate('coordinator', 'user_name');
        
        res.status(201).json({ message: 'Team created successfully!', team: populatedTeam });

    } catch (error) {
        console.error("Error in createTeam:", error);
        res.status(500).json({ message: 'Server error while creating team', error: error.message });
    }
};

// --- Function to get team for a specific user ---
export const getMyTeam = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required." });
        }

        const team = await Team.findOne({ members: userId })
            .populate('members', 'user_name')
            .populate('q_id') 
            .populate('coordinator', 'user_name');

        if (!team) {
            return res.status(404).json({ message: "You are not assigned to a team yet." });
        }

        res.status(200).json(team);
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching your team', error: error.message });
    }
};

// --- Get team by ID ---
export const getTeamById = async (req, res) => {
    try {
        const { id } = req.params;
        const team = await Team.findById(id)
            .populate('members', 'user_name user_email')
            .populate('q_id')
            .populate('coordinator', 'user_name');

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        res.status(200).json(team);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching team', error: error.message });
    }
};

// --- Update team ---
export const updateTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updatedTeam = await Team.findByIdAndUpdate(id, updateData, { 
            new: true, 
            runValidators: true 
        }).populate('members', 'user_name user_email')
          .populate('q_id')
          .populate('coordinator', 'user_name');

        if (!updatedTeam) {
            return res.status(404).json({ message: 'Team not found' });
        }

        res.status(200).json({ message: 'Team updated successfully', team: updatedTeam });
    } catch (error) {
        res.status(500).json({ message: 'Error updating team', error: error.message });
    }
};

// --- Delete team ---
export const deleteTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTeam = await Team.findByIdAndDelete(id);

        if (!deletedTeam) {
            return res.status(404).json({ message: 'Team not found' });
        }
        
        // ADDED: When a team is deleted, free up the participants
        await User.updateMany(
            { _id: { $in: deletedTeam.members } },
            { $set: { current_hackathon: null } }
        );

        res.status(200).json({ message: 'Team deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting team', error: error.message });
    }
};