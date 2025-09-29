import Hackathon from '../models/hackathon.model.js';
import Team from '../models/team.model.js';
import User from '../models/user.model.js';

// --- Create a new Hackathon ---
export const createHackathon = async (req, res) => {
    try {
        const { title, startDate, endDate, registrationDeadline, venue, status } = req.body;
        const newHackathon = new Hackathon({
            title,
            startDate,
            endDate,
            registrationDeadline,
            venue,
            status
        });
        await newHackathon.save();
        res.status(201).json({ message: 'Hackathon created successfully!', hackathon: newHackathon });
    } catch (error) {
        res.status(500).json({ message: 'Error creating hackathon', error });
    }
};

// --- Get all Hackathons ---
export const getHackathons = async (req, res) => {
    try {
        const hackathons = await Hackathon.find().populate('teams');
        res.status(200).json(hackathons);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching hackathons', error });
    }
};

// --- Get Hackathon Winners ---
export const getHackathonWinners = async (req, res) => {
    try {
        const completedHackathons = await Hackathon.find({ status: 'completed' })
            .populate('winners.firstPlace', 'team_name')
            .populate('winners.secondPlace', 'team_name')
            .populate('winners.thirdPlace', 'team_name');
        res.status(200).json(completedHackathons);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching hackathon winners', error });
    }
};