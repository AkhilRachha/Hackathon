import Team from '../models/team.model.js';

// --- Function to get all teams ---
export const getTeams = async (req, res) => {
    try {
        const teams = await Team.find()
            .populate('members', 'user_name') // Replaces member IDs with user documents (only the name)
            .populate('q_id', 'q_title')      // Replaces question ID with question document (only the title)
            .populate('coordinator', 'user_name'); // Replaces coordinator ID with user document (only the name)
        res.status(200).json(teams);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching teams', error });
    }
};

// --- Function to create a new team ---
export const createTeam = async (req, res) => {
    try {
        const { team_name, members, q_id, coordinator, user_github_url, max_members, hackathon_id } = req.body;

        // 1. Check for duplicate team name within the same hackathon
        const existingTeam = await Team.findOne({ team_name, hackathon_id });
        if (existingTeam) {
            return res.status(400).json({ message: "A team with this name already exists in this hackathon." });
        }

        // 2. Create the new team instance
        const newTeam = new Team({
            team_name,
            members,
            q_id,
            coordinator,
            user_github_url,
            max_members,
            hackathon_id
        });

        // 3. Save to the database
        await newTeam.save();
        
        // 4. Populate the team data for response
        const populatedTeam = await Team.findById(newTeam._id)
            .populate('members', 'user_name user_email')
            .populate('q_id')
            .populate('coordinator', 'user_name');
        
        res.status(201).json({ message: 'Team created successfully!', team: populatedTeam });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while creating team', error: error.message });
    }
};
export const getMyTeam = async (req, res) => {
    try {
        const { userId } = req.params; // Get the user's ID from the URL parameter

        if (!userId) {
            return res.status(400).json({ message: "User ID is required." });
        }

        // Find the team where the 'members' array contains the participant's userId
        const team = await Team.findOne({ members: userId })
            .populate('members', 'user_name')
            .populate('q_id') // Populate the entire question/project object
            .populate('coordinator', 'user_name');

        if (!team) {
            return res.status(404).json({ message: "You are not assigned to a team yet." });
        }

        res.status(200).json(team);
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching your team', error });
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

        res.status(200).json({ message: 'Team deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting team', error: error.message });
    }
};