// controllers/hackathon.controller.js
import Hackathon from '../models/hackathon.model.js';
import Team from '../models/team.model.js';
import User from '../models/user.model.js';

// ➡️ HELPER: Function to check and update the status of a single hackathon
const updateHackathonStatusAutomatically = async (hackathon) => {
    const currentTime = new Date();
    let updated = false;
    let newStatus = hackathon.status;

    if (hackathon.status !== 'completed' && hackathon.endDate <= currentTime) {
        // 1. Mark as COMPLETED if end date passed
        newStatus = 'completed';
        updated = true;
    } 
    else if (hackathon.status === 'upcoming' && hackathon.startDate <= currentTime) {
        // 2. Mark as ACTIVE if status is upcoming and start date passed
        newStatus = 'active';
        updated = true;
    }

    if (updated) {
        await Hackathon.findByIdAndUpdate(hackathon._id, { status: newStatus });
        hackathon.status = newStatus; 
        return true; 
    }
    return false; 
};


// --- Check for an Active or Upcoming Hackathon (Used by Participant flow) ---
export const checkActiveOrUpcomingHackathon = async (req, res) => {
    try {
        const currentTime = new Date();
        const existingHackathons = await Hackathon.find({
            $or: [
                { status: 'upcoming' },
                { status: 'active' },
                { endDate: { $gte: currentTime }, status: { $ne: 'completed' } }
            ]
        });

        for (const hackathon of existingHackathons) {
            await updateHackathonStatusAutomatically(hackathon);
        }
        
        const activeOrUpcoming = existingHackathons.filter(h => h.status !== 'completed');

        if (activeOrUpcoming.length > 0) {
            return res.status(200).json({ exists: true, message: 'Multiple events are now allowed. Proceed to view all or create new.' });
        } else {
             return res.status(200).json({ exists: false, message: 'No active or upcoming hackathons found.' });
        }
        
    } catch (error) {
        console.error("Error in checkActiveOrUpcomingHackathon:", error);
        res.status(500).json({ message: 'Error checking active hackathons', error: error.message });
    }
};

// --- Create a new Hackathon (Non-Blocking) ---
export const createHackathon = async (req, res) => {
    try {
        const { title, startDate, endDate, registrationDeadline, venue, status } = req.body;
        
        const newHackathon = new Hackathon({
            title,
            startDate,
            endDate,
            registrationDeadline,
            venue,
            status: status || 'upcoming' 
        });
        await newHackathon.save();
        res.status(201).json({ message: 'Hackathon created successfully!', hackathon: newHackathon });
        
    } catch (error) {
        console.error("Error creating hackathon:", error);
        res.status(500).json({ message: 'Error creating hackathon', error: error.message });
    }
};

// ➡️ CRITICAL FIX: Add robust Mongoose Population error handling
export const getHackathons = async (req, res) => {
    try {
        const hackathons = await Hackathon.find().populate({
            path: 'teams',
            select: 'team_name max_members status members', 
            populate: {
                path: 'members', 
                model: 'User', 
                select: 'user_name user_email' 
            }
        });
        
        // Ensure status update runs before sending the list
        for (const hackathon of hackathons) {
            await updateHackathonStatusAutomatically(hackathon);
        }
        
        // This returns the array of hackathons directly, which the frontend expects
        res.status(200).json(hackathons); 
    } catch (error) {
        // Log the server error and send a 500 status
        console.error("Mongoose Population or Fetch Error in getHackathons:", error.message); 
        res.status(500).json({ message: 'Error fetching hackathons list. A server-side error occurred during data retrieval.', error: error.message });
    }
};

// --- Get Hackathon by ID (Deep Population) ---
export const getHackathonById = async (req, res) => {
    const { id } = req.params;
    
    try {
        let hackathon = await Hackathon.findById(id)
            .populate({
                path: 'teams',
                select: 'team_name members',
                populate: {
                    path: 'members',
                    model: 'User',
                    select: 'user_name user_email user_phoneno role_name current_hackathon' 
                }
            })
            .populate('winners.firstPlace winners.secondPlace winners.thirdPlace', 'team_name');


        if (!hackathon) {
            return res.status(404).json({ message: 'Hackathon not found' });
        }
        
        await updateHackathonStatusAutomatically(hackathon); 

        const staffUsers = await User.find({
            current_hackathon: id,
            role_name: { $in: ['coordinator', 'evaluator'] }
        }).select('user_name user_email user_phoneno role_name');
        
        let allParticipants = [];
        let teamParticipantsCount = 0;
        
        hackathon.teams.forEach(team => {
            if (team.members) {
                teamParticipantsCount += team.members.length;
                allParticipants.push(...team.members.map(member => ({
                    ...member.toObject(),
                    team_name: team.team_name 
                })));
            }
        });

        const coordinators = staffUsers.filter(u => u.role_name === 'coordinator');
        const evaluators = staffUsers.filter(u => u.role_name === 'evaluator');

        const responseData = {
            ...hackathon.toObject(), 
            counts: {
                teams: hackathon.teams.length,
                participants: teamParticipantsCount, 
                coordinators: coordinators.length,
                evaluators: evaluators.length,
            },
            managementLists: {
                coordinators: coordinators,
                evaluators: evaluators,
                participants: allParticipants,
                teams: hackathon.teams,
            },
        };

        res.status(200).json(responseData);
    } catch (error) {
        console.error("Error fetching hackathon management details:", error.message);
        res.status(500).json({ message: 'Error fetching hackathon management details', error: error.message });
    }
};

// --- Update Hackathon (Admin Edit) ---
export const updateHackathon = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updatedHackathon = await Hackathon.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true }
        );

        if (!updatedHackathon) {
            return res.status(404).json({ message: 'Hackathon not found' });
        }

        res.status(200).json({ 
            message: 'Hackathon updated successfully', 
            hackathon: updatedHackathon 
        });
    } catch (error) {
        console.error('Error updating hackathon:', error);
        res.status(500).json({ message: 'Error updating hackathon', error: error.message });
    }
};

// --- Get Hackathon Winners (Auto-Updates Status) ---
export const getHackathonWinners = async (req, res) => {
    try {
        // Find all completed hackathons with populated winner data
        const completedHackathons = await Hackathon.find({ status: 'completed' })
            .populate('winners.firstPlace', 'team_name')
            .populate('winners.secondPlace', 'team_name')
            .populate('winners.thirdPlace', 'team_name')
            .sort({ endDate: -1 }); // Sort by end date, most recent first

        res.status(200).json(completedHackathons);
    } catch (error) {
        console.error('Error fetching hackathon winners:', error);
        res.status(500).json({ message: 'Error fetching hackathon winners', error: error.message });
    }
};

// --- Declare Winners ---
export const declareWinners = async (req, res) => {
    try {
        const { id } = req.params;
        const { firstPlace, secondPlace, thirdPlace } = req.body;

        const hackathon = await Hackathon.findById(id);
        if (!hackathon) {
            return res.status(404).json({ message: 'Hackathon not found' });
        }

        // Update winners
        hackathon.winners = {
            firstPlace: firstPlace || null,
            secondPlace: secondPlace || null,
            thirdPlace: thirdPlace || null
        };

        await hackathon.save();

        res.status(200).json({ 
            message: 'Winners declared successfully', 
            hackathon: hackathon 
        });
    } catch (error) {
        console.error('Error declaring winners:', error);
        res.status(500).json({ message: 'Error declaring winners', error: error.message });
    }
};

// --- User joins a specific hackathon (Restriction logic) ---
export const joinHackathon = async (req, res) => {
    try {
        const { hackathonId } = req.params;
        const userId = req.userId; // From auth middleware
        
        // Find the hackathon
        const hackathon = await Hackathon.findById(hackathonId);
        if (!hackathon) {
            return res.status(404).json({ message: 'Hackathon not found' });
        }
        
        // Check if hackathon is active or upcoming
        if (hackathon.status !== 'active' && hackathon.status !== 'upcoming') {
            return res.status(400).json({ message: 'This hackathon is not available for joining' });
        }
        
        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Check if user is already in a hackathon
        if (user.current_hackathon) {
            return res.status(400).json({ message: 'You are already participating in a hackathon. Please leave your current hackathon first.' });
        }
        
        // Update user's current hackathon
        user.current_hackathon = hackathonId;
        await user.save();
        
        res.status(200).json({ 
            message: `Successfully joined ${hackathon.title}!`,
            hackathon: {
                _id: hackathon._id,
                title: hackathon.title,
                status: hackathon.status
            }
        });
        
    } catch (error) {
        console.error('Error joining hackathon:', error);
        res.status(500).json({ message: 'Error joining hackathon', error: error.message });
    }
};

// --- User leaves current hackathon ---
export const leaveHackathon = async (req, res) => {
    try {
        const userId = req.userId; // From auth middleware
        
        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        if (!user.current_hackathon) {
            return res.status(400).json({ message: 'You are not currently participating in any hackathon' });
        }
        
        const hackathonId = user.current_hackathon;
        
        // Remove user from any teams in this hackathon
        await Team.updateMany(
            { hackathon_id: hackathonId, members: userId },
            { $pull: { members: userId } }
        );
        
        // Clear user's current hackathon
        user.current_hackathon = null;
        await user.save();
        
        res.status(200).json({ 
            message: 'Successfully left the hackathon!'
        });
        
    } catch (error) {
        console.error('Error leaving hackathon:', error);
        res.status(500).json({ message: 'Error leaving hackathon', error: error.message });
    }
};