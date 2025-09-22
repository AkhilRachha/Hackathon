import Team from '../models/team.model.js';
import User from '../models/user.model.js';

export const addTeam = async (req, res) => {
    const { team_name, max_members, coordinator, q_id, user_github_url } = req.body;

    try {
        const newTeam = new Team({
            team_name,
            max_members,
            coordinator,
            q_id,
            user_github_url
        });

        const savedTeam = await newTeam.save();

        // Optionally, update the user who created the team
        if (req.user) {
            await User.findByIdAndUpdate(req.user.id, { team_id: savedTeam._id });
        }

        res.status(201).json(savedTeam);
    } catch (error) {
        res.status(500).json({ message: "Error creating team", error: error.message });
    }
};

export const getTeams = async (req, res) => {
    try {
        const teams = await Team.find().populate('q_id');
        res.status(200).json(teams);
    } catch (error) {
        res.status(500).json({ message: "Error fetching teams", error: error.message });
    }
};