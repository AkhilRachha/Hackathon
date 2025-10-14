import Hackathon from '../models/hackathon.model.js';
import User from '../models/user.model.js';
import Team from '../models/team.model.js';
import {
    OK,
    CREATED,
    BAD_REQUEST,
    NOT_FOUND,
    INTERNAL_SERVER_ERROR
} from 'http-status-codes';

export const createHackathon = async (req, res) => {
    try {
        const {
            hackathon_name,
            start_datetime,
            mid_submission_datetime,
            end_datetime,
            registrationDeadline,
            venue,
            limits
        } = req.body;

        // Validate required fields
        if (!hackathon_name || !start_datetime || !mid_submission_datetime || !end_datetime || !registrationDeadline || !venue || !limits) {
            return res.status(BAD_REQUEST).json({ message: "Please provide all required fields." });
        }

        // Validate hackathon name length (max 20 words)
        const wordCount = hackathon_name.trim().split(/\s+/).length;
        if (wordCount > 20) {
            return res.status(BAD_REQUEST).json({ message: "Hackathon name cannot exceed 20 words." });
        }

        // Validate date order
        const regDeadline = new Date(registrationDeadline);
        const startDate = new Date(start_datetime);
        const midDate = new Date(mid_submission_datetime);
        const endDate = new Date(end_datetime);
        const currentDate = new Date();

        if (regDeadline < currentDate || startDate < currentDate || midDate < currentDate || endDate < currentDate) {
            return res.status(BAD_REQUEST).json({ message: "Past dates are not allowed. Please select present or future dates only." });
        }
        if (!(regDeadline < startDate && startDate < midDate && midDate < endDate)) {
            return res.status(BAD_REQUEST).json({ message: "Invalid date sequence. Order must be: Registration Deadline < Start Date < Mid Submission < End Date." });
        }

        // Validate limits
        const { totalParticipants, totalTeams, totalCoordinators, totalEvaluators, maxMembersPerTeam } = limits;
        if (!totalParticipants || !totalTeams || !totalCoordinators || !totalEvaluators || !maxMembersPerTeam) {
            return res.status(BAD_REQUEST).json({ message: "All limit fields are required." });
        }
        if (totalParticipants < 1 || totalTeams < 1 || totalCoordinators < 1 || totalEvaluators < 1 || maxMembersPerTeam < 2) {
            return res.status(BAD_REQUEST).json({ message: "Invalid limits. Minimum values: participants(1), teams(1), coordinators(1), evaluators(1), max members per team(2)." });
        }

        const newHackathon = new Hackathon({
            hackathon_name,
            start_datetime,
            mid_submission_datetime,
            end_datetime,
            registrationDeadline,
            venue,
            limits,
            status: 'upcoming'
        });

        const savedHackathon = await newHackathon.save();
        res.status(CREATED).json({ message: 'Hackathon created successfully!', hackathon: savedHackathon });
    } catch (error) {
        console.error("Error creating hackathon:", error);
        res.status(INTERNAL_SERVER_ERROR).json({ message: 'Error creating hackathon', error: error.message });
    }
};

export const getHackathons = async (req, res) => {
    try {
        await updateHackathonStatuses();
        const currentTime = new Date();
        const availableHackathons = await Hackathon.find({
            end_datetime: { $gte: currentTime },
            status: { $in: ['upcoming', 'active'] },
            $or: [
                { registrationDeadline: { $gte: currentTime } },
                { registrationDeadline: { $exists: false } },
                { registrationDeadline: null }
            ],
            'winners.firstPlace': { $exists: false }
        }).sort({ start_datetime: 1 });
        
        res.status(OK).json(availableHackathons);
    } catch (error) {
        res.status(INTERNAL_SERVER_ERROR).json({ message: 'Error fetching available hackathons.', error: error.message });
    }
};

// Helper function to update hackathon statuses based on current time
const updateHackathonStatuses = async () => {
    try {
        const currentTime = new Date();
        
        // Check for hackathons where registration has ended and make teams evaluation-ready
        await makeTeamsEvaluationReadyAfterRegistration(currentTime);
        
        // First, handle hackathons that should become active (basic time check)
        const hackathonsToActivate = await Hackathon.find({
            start_datetime: { $lte: currentTime },
            end_datetime: { $gte: currentTime },
            status: 'upcoming'
        });

        for (const hackathon of hackathonsToActivate) {
            // Check if hackathon has sufficient participants to be active
            const [teamCount, coordinatorCount, evaluatorCount] = await Promise.all([
                Team.countDocuments({ hackathon_id: hackathon._id }),
                User.countDocuments({ current_hackathon: hackathon._id, role_name: 'coordinator' }),
                User.countDocuments({ current_hackathon: hackathon._id, role_name: 'evaluator' })
            ]);

            // Business logic: If event has started but has insufficient participants, mark as completed
            // Require at least 3 teams, 1 coordinator, and 1 evaluator
            if (teamCount < 3 || coordinatorCount === 0 || evaluatorCount === 0) {
                console.log(`Hackathon ${hackathon.hackathon_name} marked as completed due to insufficient participants: Teams: ${teamCount}, Coordinators: ${coordinatorCount}, Evaluators: ${evaluatorCount}`);
                await Hackathon.findByIdAndUpdate(hackathon._id, { 
                    $set: { 
                        status: 'completed',
                        completedReason: 'insufficient_participants',
                        completedAt: currentTime
                    } 
                });
            } else {
                // Has sufficient participants, can be active
                await Hackathon.findByIdAndUpdate(hackathon._id, { $set: { status: 'active' } });
                console.log(`Hackathon ${hackathon.hackathon_name} activated with Teams: ${teamCount}, Coordinators: ${coordinatorCount}, Evaluators: ${evaluatorCount}`);
            }
        }
        
        // Handle hackathons that have ended naturally (time-based completion)
        await Hackathon.updateMany(
            { 
                end_datetime: { $lt: currentTime }, 
                status: { $in: ['upcoming', 'active'] }
            },
            { 
                $set: { 
                    status: 'completed',
                    completedReason: 'time_ended',
                    completedAt: currentTime
                } 
            }
        );

        // Handle hackathons that have winners announced
        await Hackathon.updateMany(
            { 
                status: { $in: ['upcoming', 'active'] }, 
                'winners.firstPlace': { $exists: true, $ne: null } 
            },
            { 
                $set: { 
                    status: 'completed',
                    completedReason: 'winners_announced'
                } 
            }
        );
        
    } catch (error) {
        console.error('Error updating hackathon statuses:', error);
    }
};

// Helper function to make teams evaluation-ready when registration ends
const makeTeamsEvaluationReadyAfterRegistration = async (currentTime) => {
    try {
        // Find hackathons where registration has ended but teams are not yet evaluation-ready
        const hackathonsWithEndedRegistration = await Hackathon.find({
            registrationDeadline: { $lt: currentTime },
            status: { $in: ['upcoming', 'active'] }
        });

        for (const hackathon of hackathonsWithEndedRegistration) {
            // Find teams in this hackathon that are not yet ready for evaluation
            const teamsToUpdate = await Team.find({
                hackathon_id: hackathon._id,
                ready_for_evaluation: false
            });

            if (teamsToUpdate.length > 0) {
                // Update all teams to be ready for evaluation
                const updateResult = await Team.updateMany(
                    {
                        hackathon_id: hackathon._id,
                        ready_for_evaluation: false
                    },
                    {
                        $set: {
                            ready_for_evaluation: true,
                            evaluation_ready_at: currentTime
                        }
                    }
                );

                console.log(`Registration ended for hackathon "${hackathon.hackathon_name}". Made ${updateResult.modifiedCount} teams ready for evaluation.`);
            }
        }
    } catch (error) {
        console.error('Error making teams evaluation-ready after registration:', error);
    }
};

const revertRolesToParticipant = async (hackathonId) => {
    try {
        const usersToRevert = await User.find({
            current_hackathon: hackathonId,
            role_name: { $in: ['coordinator', 'evaluator'] }
        });

        for (const user of usersToRevert) {
            user.role_name = 'participant';
            user.current_hackathon = null;
            await user.save();
        }
        return { totalReverted: usersToRevert.length };
    } catch (error) {
        console.error('Error reverting roles:', error);
        return { totalReverted: 0 };
    }
};

const performCompleteCleanup = async (hackathonId) => {
    try {
        await revertRolesToParticipant(hackathonId);
        await User.updateMany(
            { current_hackathon: hackathonId },
            { $set: { current_hackathon: null } }
        );
    } catch (error) {
        console.error(`Error performing complete cleanup for hackathon ${hackathonId}:`, error);
        throw error;
    }
};

const cleanupCompletedHackathons = async () => {
    try {
        const completedHackathons = await Hackathon.find({
            status: 'completed',
            winnersAnnouncedAt: { $exists: true, $ne: null }
        }).select('_id');

        for (const hackathon of completedHackathons) {
            await performCompleteCleanup(hackathon._id);
        }
    } catch (error) {
        console.error('Error cleaning up completed hackathons:', error);
    }
};

export { updateHackathonStatuses, cleanupCompletedHackathons, performCompleteCleanup, makeTeamsEvaluationReadyAfterRegistration };

export const getAllHackathonsForAdmin = async (req, res) => {
    try {
        const allHackathons = await Hackathon.find({}).sort({ createdAt: -1 });
        res.status(OK).json(allHackathons);
    } catch (error) {
        res.status(INTERNAL_SERVER_ERROR).json({ message: 'Error fetching all hackathons for admin.', error: error.message });
    }
};

export const getHackathonById = async (req, res) => {
    try {
        const hackathon = await Hackathon.findById(req.params.id)
            .populate({ 
                path: 'teams', 
                populate: [
                    { path: 'members', select: 'user_name user_email' },
                    { path: 'coordinator_id', select: 'user_name user_email' }
                ]
            })
            .populate('winners.firstPlace winners.secondPlace winners.thirdPlace', 'team_name')
            .populate('questions');

        if (!hackathon) {
            return res.status(NOT_FOUND).json({ message: 'Hackathon not found' });
        }

        const allUsersInHackathon = await User.find({ current_hackathon: req.params.id }).select('user_name user_email role_name');
        
        // Get all team members and coordinators who are already allocated
        const allocatedMemberIds = new Set();
        const allocatedCoordinatorIds = new Set();
        
        hackathon.teams.forEach(team => {
            // Add all team members to allocated set
            team.members.forEach(member => {
                allocatedMemberIds.add(member._id.toString());
            });
            // Add team coordinator to allocated set
            if (team.coordinator_id) {
                // Handle both ObjectId and populated object cases
                const coordinatorId = team.coordinator_id._id ? team.coordinator_id._id.toString() : team.coordinator_id.toString();
                allocatedCoordinatorIds.add(coordinatorId);
            }
        });
        
        // Filter participants: only show those NOT allocated to any team
        const participants = allUsersInHackathon.filter(u => 
            u.role_name === 'participant' && !allocatedMemberIds.has(u._id.toString())
        );
        
        // Show ALL coordinators (no filtering)
        const coordinators = allUsersInHackathon.filter(u => 
            u.role_name === 'coordinator'
        );
        
        const evaluators = allUsersInHackathon.filter(u => u.role_name === 'evaluator');

        const responseData = {
            ...hackathon.toObject(),
            counts: { 
                teams: hackathon.teams.length, 
                participants: participants.length, // Unallocated participants only
                coordinators: coordinators.length, // Unallocated coordinators only
                evaluators: evaluators.length,
                totalParticipants: allUsersInHackathon.filter(u => u.role_name === 'participant').length, // All participants
                totalCoordinators: allUsersInHackathon.filter(u => u.role_name === 'coordinator').length // All coordinators
            },
            managementLists: { coordinators, evaluators, participants, teams: hackathon.teams },
        };
        res.status(OK).json(responseData);
    } catch (error) {
        res.status(INTERNAL_SERVER_ERROR).json({ message: 'Error fetching hackathon details', error: error.message });
    }
};

export const updateHackathon = async (req, res) => {
    try {
        const updatedHackathon = await Hackathon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedHackathon) return res.status(NOT_FOUND).json({ message: 'Hackathon not found' });
        res.status(OK).json({ message: 'Hackathon updated successfully', hackathon: updatedHackathon });
    } catch (error) {
        console.error('Error updating hackathon:', error);
        res.status(INTERNAL_SERVER_ERROR).json({ message: 'Error updating hackathon', error: error.message });
    }
};

export const getHackathonWinners = async (req, res) => {
    try {
        const completedHackathons = await Hackathon.find({ 
            status: 'completed',
            'winners.firstPlace': { $exists: true, $ne: null }
        })
        .populate({ path: 'winners.firstPlace winners.secondPlace winners.thirdPlace', populate: { path: 'members', select: 'user_name' }})
        .sort({ winnersAnnouncedAt: -1 });
        res.status(OK).json(completedHackathons);
    } catch (error) {
        console.error('Error fetching winners:', error);
        res.status(INTERNAL_SERVER_ERROR).json({ message: 'Error fetching winners', error: error.message });
    }
};

export const getRecentWinners = async (req, res) => {
    try {
        const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
        const recentWinners = await Hackathon.find({
            status: 'completed',
            'winners.firstPlace': { $exists: true, $ne: null },
            winnersAnnouncedAt: { $gte: sixHoursAgo }
        })
        .populate({ path: 'winners.firstPlace winners.secondPlace winners.thirdPlace', populate: { path: 'members', select: 'user_name' }})
        .sort({ winnersAnnouncedAt: -1 })
        .limit(5);

        res.status(OK).json(recentWinners);
    } catch (error) {
        console.error('Error fetching recent winners:', error);
        res.status(INTERNAL_SERVER_ERROR).json({ message: 'Error fetching recent winners', error: error.message });
    }
};

export const joinHackathon = async (req, res) => {
    try {
        const { hackathonId } = req.params;
        const userId = req.user._id;
        const hackathon = await Hackathon.findById(hackathonId);
        if (!hackathon) return res.status(NOT_FOUND).json({ message: 'Hackathon not found' });

        const currentTime = new Date();
        if (hackathon.end_datetime < currentTime) {
            return res.status(BAD_REQUEST).json({ message: 'This hackathon has already ended.' });
        }
        if (hackathon.registrationDeadline && hackathon.registrationDeadline < currentTime) {
            return res.status(BAD_REQUEST).json({ message: 'Registration deadline for this hackathon has passed.' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(NOT_FOUND).json({ message: 'User not found' });
        if (user.current_hackathon) return res.status(BAD_REQUEST).json({ message: 'You are already in a hackathon.' });

        const currentParticipantCount = await User.countDocuments({ current_hackathon: hackathonId, role_name: 'participant' });
        if (currentParticipantCount >= hackathon.limits.totalParticipants) {
            return res.status(BAD_REQUEST).json({ message: `Maximum number of participants (${hackathon.limits.totalParticipants}) reached.` });
        }

        user.current_hackathon = hackathonId;
        await user.save();

        res.status(OK).json({ message: `Successfully joined ${hackathon.hackathon_name}!` });
    } catch (error) {
        console.error('Error joining hackathon:', error);
        res.status(INTERNAL_SERVER_ERROR).json({ message: 'Error joining hackathon', error: error.message });
    }
};

export const leaveHackathon = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) return res.status(NOT_FOUND).json({ message: 'User not found' });
        if (!user.current_hackathon) return res.status(BAD_REQUEST).json({ message: 'Not in any hackathon' });
        
        await Team.updateMany({ hackathon_id: user.current_hackathon, members: userId }, { $pull: { members: userId } });
        
        user.current_hackathon = null;
        await user.save();
        
        res.status(OK).json({ 
            message: 'Successfully left the hackathon.',
            user: { _id: user._id, user_name: user.user_name, current_hackathon: user.current_hackathon }
        });
    } catch (error) {
        console.error('Error leaving hackathon:', error);
        res.status(INTERNAL_SERVER_ERROR).json({ message: 'Error leaving hackathon', error: error.message });
    }
};

export const updateHackathonQuestions = async (req, res) => {
    try {
        const { id } = req.params;
        const { questionIds } = req.body;
        if (!Array.isArray(questionIds)) {
            return res.status(BAD_REQUEST).json({ message: 'questionIds must be an array.' });
        }
        const updatedHackathon = await Hackathon.findByIdAndUpdate(id, { $set: { questions: questionIds } }, { new: true });
        if (!updatedHackathon) return res.status(NOT_FOUND).json({ message: 'Hackathon not found' });
        res.status(OK).json({ message: 'Hackathon questions updated successfully.', hackathon: updatedHackathon });
    } catch (error) {
        console.error('Error updating hackathon questions:', error);
        res.status(INTERNAL_SERVER_ERROR).json({ message: 'Error updating hackathon questions', error: error.message });
    }
};

export const updateHackathonStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const validStatuses = ['upcoming', 'active', 'completed'];
        if (!validStatuses.includes(status)) {
            return res.status(BAD_REQUEST).json({ message: 'Invalid status.' });
        }
        
        const hackathon = await Hackathon.findById(id);
        if (!hackathon) {
            return res.status(NOT_FOUND).json({ message: 'Hackathon not found' });
        }
        
        const currentTime = new Date();
        if (status === 'completed' && hackathon.end_datetime > currentTime) {
            return res.status(BAD_REQUEST).json({ message: 'Cannot mark as completed before end time' });
        }
        
        const updatedHackathon = await Hackathon.findByIdAndUpdate(id, { $set: { status } }, { new: true });
        
        res.status(OK).json({ 
            message: `Hackathon status updated to ${status}`, 
            hackathon: updatedHackathon 
        });
    } catch (error) {
        console.error('Error updating hackathon status:', error);
        res.status(INTERNAL_SERVER_ERROR).json({ message: 'Error updating hackathon status', error: error.message });
    }
};

export const manualCleanupCompletedHackathons = async (req, res) => {
    try {
        console.log('Manual cleanup requested by admin:', req.user.user_name);
        const completedHackathons = await Hackathon.find({
            status: 'completed',
            winnersAnnouncedAt: { $exists: true, $ne: null }
        });
        for (const hackathon of completedHackathons) {
            await performCompleteCleanup(hackathon._id);
        }
        res.status(OK).json({ message: 'Manual cleanup completed successfully' });
    } catch (error) {
        console.error('Error in manual cleanup:', error);
        res.status(INTERNAL_SERVER_ERROR).json({ message: 'Error performing manual cleanup', error: error.message });
    }
};

export const checkHackathonCleanupStatus = async (req, res) => {
    try {
        const { hackathonId } = req.params;
        if (!hackathonId) {
            return res.status(BAD_REQUEST).json({ message: 'Hackathon ID is required' });
        }
        
        const usersStillAssigned = await User.find({ current_hackathon: hackathonId }).select('user_name user_email role_name');
        const hackathon = await Hackathon.findById(hackathonId).select('hackathon_name status winnersAnnouncedAt');
        
        const status = {
            hackathon: hackathon || { message: 'Hackathon not found' },
            usersStillAssigned: usersStillAssigned.length,
            isCleanupComplete: usersStillAssigned.length === 0,
        };
        
        res.status(OK).json(status);
    } catch (error) {
        console.error('Error checking cleanup status:', error);
        res.status(INTERNAL_SERVER_ERROR).json({ message: 'Error checking cleanup status', error: error.message });
    }
};