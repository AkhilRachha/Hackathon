import Hackathon from '../models/hackathon.model.js';
import Team from '../models/team.model.js';
import User from '../models/user.model.js';

// --- Check for an Active or Upcoming Hackathon (New Function) ---
export const checkActiveOrUpcomingHackathon = async (req, res) => {
    // Determine the current time for real-time comparison
    const currentTime = new Date();

    try {
        // Query the database for any hackathon that is:
        // 1. Status is 'upcoming'
        // OR
        // 2. Status is 'active'
        // OR
        // 3. Status is 'upcoming' or 'active' AND the end date is in the future
        const existingHackathon = await Hackathon.findOne({
            $or: [
                { status: 'upcoming' },
                { status: 'active' },
                // Fallback check for events that should be over but haven't been marked 'completed'
                { endDate: { $gte: currentTime }, status: { $ne: 'completed' } }
            ]
        });

        if (existingHackathon) {
            // Found an active/upcoming event
            return res.status(200).json({ exists: true, message: 'An active or upcoming hackathon already exists.' });
        } else {
            // No active/upcoming events found
            return res.status(200).json({ exists: false, message: 'No active or upcoming hackathons found.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error checking active hackathons', error });
    }
};


// --- Create a new Hackathon (Modified with Blocking Logic) ---
export const createHackathon = async (req, res) => {
    try {
        const { title, startDate, endDate, registrationDeadline, venue, status } = req.body;
        
        // 1. Check for existing active/upcoming hackathons (Logic moved from checkActiveOrUpcomingHackathon)
        const currentTime = new Date();
        const existingHackathon = await Hackathon.findOne({
            $or: [
                { status: 'upcoming' },
                { status: 'active' },
                { endDate: { $gte: currentTime }, status: { $ne: 'completed' } }
            ]
        });

        if (existingHackathon) {
            // BLOCK CREATION: Return 409 Conflict if one already exists.
            return res.status(409).json({ 
                message: 'Cannot create a new hackathon: An active or upcoming event already exists.', 
                existingHackathon
            });
        }

        // 2. Proceed with creation if no existing event is found
        const newHackathon = new Hackathon({
            title,
            startDate,
            endDate,
            registrationDeadline,
            venue,
            status: status || 'upcoming' // Ensure status defaults to upcoming
        });
        await newHackathon.save();
        res.status(201).json({ message: 'Hackathon created successfully!', hackathon: newHackathon });
        
    } catch (error) {
        res.status(500).json({ message: 'Error creating hackathon', error: error.message });
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
