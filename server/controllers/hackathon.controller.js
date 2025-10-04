import Hackathon from '../models/hackathon.model.js';
import User from '../models/user.model.js';
import Team from '../models/team.model.js';

// FOR PARTICIPANTS: Gets only available (active & upcoming) hackathons
export const getHackathons = async (req, res) => {
    try {
        const currentTime = new Date();
        const availableHackathons = await Hackathon.find({
            endDate: { $gte: currentTime }
        }).sort({ startDate: 1 });
        res.status(200).json(availableHackathons);
    } catch (error) {
        console.error("Error in getHackathons:", error.message); 
        res.status(500).json({ message: 'Error fetching available hackathons.', error: error.message });
    }
};

// FOR ADMINS: Gets ALL hackathons regardless of date/status
export const getAllHackathonsForAdmin = async (req, res) => {
    try {
        const allHackathons = await Hackathon.find({}).sort({ createdAt: -1 });
        res.status(200).json(allHackathons);
    } catch (error) {
        console.error("Error in getAllHackathonsForAdmin:", error.message);
        res.status(500).json({ message: 'Error fetching all hackathons for admin.', error: error.message });
    }
};


// --- ⬇️  FIXED HERE: Restored the detailed data aggregation logic ---
// --- Get Hackathon by ID (for Admin Management View) ---
export const getHackathonById = async (req, res) => {
    const { id } = req.params;
    try {
        const hackathon = await Hackathon.findById(id)
            .populate({
                path: 'teams',
                populate: { path: 'members', model: 'User', select: 'user_name user_email user_phoneno' }
            })
            .populate('winners.firstPlace winners.secondPlace winners.thirdPlace', 'team_name');

        if (!hackathon) {
            return res.status(404).json({ message: 'Hackathon not found' });
        }
        
        // Find staff assigned to this specific hackathon
        const staffUsers = await User.find({
            current_hackathon: id,
            role_name: { $in: ['coordinator', 'evaluator'] }
        }).select('user_name user_email user_phoneno role_name');

        // Aggregate all participants from all teams
        const allParticipants = hackathon.teams.flatMap(team => 
            team.members.map(member => ({
                ...member.toObject(),
                team_name: team.team_name // Add team name to each participant object
            }))
        );

        const coordinators = staffUsers.filter(u => u.role_name === 'coordinator');
        const evaluators = staffUsers.filter(u => u.role_name === 'evaluator');

        // Build the specific data structure the frontend expects
        const responseData = {
            ...hackathon.toObject(), 
            counts: {
                teams: hackathon.teams.length,
                participants: allParticipants.length, 
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
        res.status(500).json({ message: 'Error fetching hackathon details', error: error.message });
    }
};
// --- ⬆️ END OF FIX ⬆️ ---


// --- The rest of your controller functions remain the same ---

export const createHackathon = async (req, res) => {
    try {
        const { title, startDate, endDate, registrationDeadline, venue, status } = req.body;
        const newHackathon = new Hackathon({ title, startDate, endDate, registrationDeadline, venue, status: status || 'upcoming' });
        await newHackathon.save();
        res.status(201).json({ message: 'Hackathon created successfully!', hackathon: newHackathon });
    } catch (error) {
        console.error("Error creating hackathon:", error);
        res.status(500).json({ message: 'Error creating hackathon', error: error.message });
    }
};

export const updateHackathon = async (req, res) => {
    try {
        const updatedHackathon = await Hackathon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedHackathon) return res.status(404).json({ message: 'Hackathon not found' });
        res.status(200).json({ message: 'Hackathon updated successfully', hackathon: updatedHackathon });
    } catch (error) {
        console.error('Error updating hackathon:', error);
        res.status(500).json({ message: 'Error updating hackathon', error: error.message });
    }
};

export const getHackathonWinners = async (req, res) => {
    try {
        const completedHackathons = await Hackathon.find({ status: 'completed' })
            .populate('winners.firstPlace winners.secondPlace winners.thirdPlace', 'team_name')
            .sort({ endDate: -1 });
        res.status(200).json(completedHackathons);
    } catch (error) {
        console.error('Error fetching winners:', error);
        res.status(500).json({ message: 'Error fetching winners', error: error.message });
    }
};

export const declareWinners = async (req, res) => {
    try {
        const { id } = req.params;
        const { firstPlace, secondPlace, thirdPlace } = req.body;
        const updatedHackathon = await Hackathon.findByIdAndUpdate(id, { 
            $set: { 'winners.firstPlace': firstPlace, 'winners.secondPlace': secondPlace, 'winners.thirdPlace': thirdPlace }
        }, { new: true });
        if (!updatedHackathon) return res.status(404).json({ message: 'Hackathon not found' });
        res.status(200).json({ message: 'Winners declared', hackathon: updatedHackathon });
    } catch (error) {
        console.error('Error declaring winners:', error);
        res.status(500).json({ message: 'Error declaring winners', error: error.message });
    }
};

export const joinHackathon = async (req, res) => {
    try {
        const { hackathonId } = req.params;
        const userId = req.userId;
        const hackathon = await Hackathon.findById(hackathonId);
        if (!hackathon) return res.status(404).json({ message: 'Hackathon not found' });
        const currentTime = new Date();
        if (hackathon.endDate < currentTime) return res.status(400).json({ message: 'This hackathon has already ended.' });
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.current_hackathon) return res.status(400).json({ message: 'You are already in a hackathon.' });
        user.current_hackathon = hackathonId;
        await user.save();
        res.status(200).json({ message: `Successfully joined ${hackathon.title}!` });
    } catch (error) {
        console.error('Error joining hackathon:', error);
        res.status(500).json({ message: 'Error joining hackathon', error: error.message });
    }
};

export const leaveHackathon = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (!user.current_hackathon) return res.status(400).json({ message: 'Not in any hackathon' });
        await Team.updateMany({ hackathon_id: user.current_hackathon, members: userId }, { $pull: { members: userId } });
        user.current_hackathon = null;
        await user.save();
        res.status(200).json({ message: 'Successfully left the hackathon' });
    } catch (error) {
        console.error('Error leaving hackathon:', error);
        res.status(500).json({ message: 'Error leaving hackathon', error: error.message });
    }
};

export const checkActiveOrUpcomingHackathon = async (req, res) => {
    try {
        const currentTime = new Date();
        const availableHackathon = await Hackathon.findOne({ endDate: { $gte: currentTime } });
        if (availableHackathon) {
            return res.status(200).json({ exists: true, message: 'Active or upcoming events are available.' });
        } else {
             return res.status(200).json({ exists: false, message: 'No active or upcoming hackathons found.' });
        }
    } catch (error) {
        console.error("Error in checkActiveOrUpcomingHackathon:", error);
        res.status(500).json({ message: 'Error checking active hackathons', error: error.message });
    }
};

export const updateHackathonQuestions = async (req, res) => {
    try {
        const { id } = req.params;
        const { questionIds } = req.body;
        if (!Array.isArray(questionIds)) {
            return res.status(400).json({ message: 'questionIds must be an array.' });
        }
        const updatedHackathon = await Hackathon.findByIdAndUpdate(
            id,
            { $set: { questions: questionIds } },
            { new: true }
        );
        if (!updatedHackathon) return res.status(404).json({ message: 'Hackathon not found' });
        res.status(200).json({ message: 'Hackathon questions updated successfully.', hackathon: updatedHackathon });
    } catch (error) {
        console.error('Error updating hackathon questions:', error);
        res.status(500).json({ message: 'Error updating hackathon questions', error: error.message });
    }
};