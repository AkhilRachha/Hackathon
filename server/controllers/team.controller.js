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
        const { team_name, members, q_id, coordinator, user_github_url, max_members } = req.body;

        // 1. Check for duplicate team name
        const existingTeam = await Team.findOne({ team_name });
        if (existingTeam) {
            return res.status(400).json({ message: "A team with this name already exists." });
        }

        // 2. Create the new team instance
        const newTeam = new Team({
            team_name,
            members,
            q_id,
            coordinator,
            user_github_url,
            max_members
        });

        // 3. Save to the database
        await newTeam.save();
        res.status(201).json({ message: 'Team created successfully!', team: newTeam });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while creating team', error });
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