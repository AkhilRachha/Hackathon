import Team from '../models/team.model.js';
import Hackathon from '../models/hackathon.model.js';
import User from '../models/user.model.js';
import Question from '../models/question.model.js';
import mongoose from 'mongoose';
import {
    OK,
    CREATED,
    BAD_REQUEST,
    UNAUTHORIZED,
    FORBIDDEN,
    NOT_FOUND,
    INTERNAL_SERVER_ERROR
} from 'http-status-codes';

export const getParticipantDashboardData = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user._id);
        
        const user = await User.findById(userId);
        if (!user || !user.current_hackathon) {
            return res.status(NOT_FOUND).json({ message: "You are not registered for any hackathon." });
        }

        const hackathon = await Hackathon.findById(user.current_hackathon);
        if (!hackathon) {
            return res.status(NOT_FOUND).json({ message: "Hackathon details not found." });
        }

        const team = await Team.findOne({ members: userId })
            .populate('members', 'user_name')
            .populate('q_id')
            .populate('coordinator_id', 'user_name');

        if (!team) {
            if (hackathon.status === 'upcoming') {
                return res.status(OK).json({
                    hackathon: hackathon,
                    waitingForTeamAssignment: true
                });
            } else {
                return res.status(NOT_FOUND).json({ message: "You have not been assigned to a team yet." });
            }
        }

        if (team.hackathon_id.toString() !== user.current_hackathon.toString()) {
            return res.status(NOT_FOUND).json({ message: "Team assignment mismatch with your current hackathon." });
        }

        const hackathonId = team.hackathon_id;
        const [totalParticipants, totalProjects, totalTeams, totalCoordinators] = await Promise.all([
            User.countDocuments({ role_name: 'participant', current_hackathon: hackathonId }),
            Question.countDocuments({_id: {$in: hackathon.questions} }),
            Team.countDocuments({ hackathon_id: hackathonId }),
            User.countDocuments({ role_name: 'coordinator', current_hackathon: hackathonId })
        ]);

        const stats = { total_participants: totalParticipants, total_projects: totalProjects, total_teams: totalTeams, total_coordinators: totalCoordinators };

        const dashboardData = {
            hackathon: {
                _id: hackathon._id,
                hackathon_name: hackathon.hackathon_name,
                start_datetime: hackathon.start_datetime,
                mid_submission_datetime: hackathon.mid_submission_datetime,
                end_datetime: hackathon.end_datetime,
                status: hackathon.status
            },
            stats,
            team: {
                _id: team._id,
                team_name: team.team_name,
                members: team.members,
                project: {
                    domain: team.q_id?.domain,
                    title: team.q_id?.q_title,
                    description: team.q_id?.q_description,
                    criteria: team.q_id?.evaluationCriteria?.map(c => c.name).join(', ') || '',
                },
                coordinator: team.coordinator_id,
                mid_submission: team.mid_submission,
                github_submission: team.github_submission
            }
        };
        
        res.status(OK).json(dashboardData);
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        res.status(INTERNAL_SERVER_ERROR).json({ message: "Server error while fetching dashboard data.", error: error.message });
    }
};

export const submitMidProject = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user._id);
        const { githubUrl } = req.body;
        if (!githubUrl) return res.status(BAD_REQUEST).json({ message: "GitHub URL is required." });

        const team = await Team.findOne({ members: userId });
        if (!team) return res.status(NOT_FOUND).json({ message: "You are not part of a team." });

        const hackathon = await Hackathon.findById(team.hackathon_id);
        if (new Date() > new Date(hackathon.mid_submission_datetime)) {
            return res.status(FORBIDDEN).json({ message: "The mid-submission deadline has passed." });
        }

        team.mid_submission = { url: githubUrl, submitted_at: new Date() };
        await team.save();
        res.status(OK).json({ message: "Mid-project submitted successfully!", submission: team.mid_submission });
    } catch (error) {
        console.error("Error submitting mid-project:", error);
        res.status(INTERNAL_SERVER_ERROR).json({ message: "Server error during mid-project submission." });
    }
};

export const submitProject = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user._id);
        const { githubUrl } = req.body;
        if (!githubUrl) return res.status(BAD_REQUEST).json({ message: "GitHub URL is required." });

        const team = await Team.findOne({ members: userId });
        if (!team) return res.status(NOT_FOUND).json({ message: "You are not part of a team." });

        const hackathon = await Hackathon.findById(team.hackathon_id);
        if (new Date() > new Date(hackathon.end_datetime)) {
            return res.status(FORBIDDEN).json({ message: "The final submission deadline has passed." });
        }

        const currentTime = new Date();
        team.github_submission = { url: githubUrl, submitted_at: currentTime };
        
        // Make team ready for evaluation upon final submission
        if (!team.ready_for_evaluation) {
            team.ready_for_evaluation = true;
            team.evaluation_ready_at = currentTime;
        }
        
        await team.save();
        res.status(OK).json({ 
            message: "Final project submitted successfully! Your team is now ready for evaluation.", 
            submission: team.github_submission,
            evaluationReady: team.ready_for_evaluation
        });
    } catch (error) {
        console.error("Error submitting final project:", error);
        res.status(INTERNAL_SERVER_ERROR).json({ message: "Server error during final project submission." });
    }
};

export const createTeam = async (req, res) => {
    try {
        const coordinator_id = req.user._id;
        if (!coordinator_id) {
            return res.status(UNAUTHORIZED).json({ message: "Authentication failed. Please log in again." });
        }

        const { team_name, members, q_id, user_github_url, hackathon_id } = req.body;
        if (!team_name || !members || members.length === 0 || !q_id || !user_github_url || !hackathon_id) {
            return res.status(BAD_REQUEST).json({ message: "Missing required fields, or no members selected." });
        }

        const hackathon = await Hackathon.findById(hackathon_id);
        if (!hackathon) {
            return res.status(NOT_FOUND).json({ message: "Hackathon not found." });
        }

        const maxTeamSize = hackathon.limits?.maxMembersPerTeam || 4;
        if (members.length > maxTeamSize) {
            return res.status(BAD_REQUEST).json({ message: `Team size cannot exceed ${maxTeamSize} members.` });
        }

        const existingTeam = await Team.findOne({ team_name, hackathon_id });
        if (existingTeam) {
            return res.status(BAD_REQUEST).json({ message: "A team with this name already exists in this hackathon." });
        }

        const currentTeamCount = await Team.countDocuments({ hackathon_id });
        if (currentTeamCount >= hackathon.limits.totalTeams) {
            return res.status(BAD_REQUEST).json({ message: `Maximum number of teams (${hackathon.limits.totalTeams}) reached.` });
        }

        const newTeam = new Team({ team_name, members, q_id, user_github_url, hackathon_id, coordinator_id });
        const savedTeam = await newTeam.save();

        await Hackathon.findByIdAndUpdate(hackathon_id, { $push: { teams: savedTeam._id } });
            
        const populatedTeam = await Team.findById(savedTeam._id)
            .populate('members', 'user_name')
            .populate('q_id', 'q_title');
            
        res.status(CREATED).json({ message: 'Team created successfully!', team: populatedTeam });
    } catch (error) {
        console.error("Error in createTeam:", error);
        res.status(INTERNAL_SERVER_ERROR).json({ message: 'Server error while creating team', error: error.message });
    }
};

export const getTeams = async (req, res) => {
    try {
        const teams = await Team.find()
            .populate('members', 'user_name') 
            .populate('q_id', 'q_title')      
            .populate('coordinator_id', 'user_name');
        res.status(OK).json(teams);
    } catch (error) {
        res.status(INTERNAL_SERVER_ERROR).json({ message: 'Error fetching teams', error: error.message });
    }
};

export const getMyTeam = async (req, res) => {
    try {
        const userObjectId = new mongoose.Types.ObjectId(req.user._id);
        const team = await Team.findOne({ members: userObjectId })
            .populate('members', 'user_name')
            .populate('q_id')
            .populate('coordinator_id', 'user_name');

        if (!team) {
            return res.status(NOT_FOUND).json({ message: "You have not been assigned to a team yet." });
        }
        res.status(OK).json(team);
    } catch (error) {
        console.error("Error in getMyTeam controller:", error);
        res.status(INTERNAL_SERVER_ERROR).json({ message: "Server error while fetching your team." });
    }
};

export const getTeamById = async (req, res) => {
    try {
        const { id } = req.params;
        const team = await Team.findById(id)
            .populate('members', 'user_name user_email')
            .populate('q_id');

        if (!team) {
            return res.status(NOT_FOUND).json({ message: 'Team not found' });
        }
        res.status(OK).json(team);
    } catch (error) {
        res.status(INTERNAL_SERVER_ERROR).json({ message: 'Error fetching team', error: error.message });
    }
};

export const updateTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const existingTeam = await Team.findById(id);
        if (!existingTeam) {
            return res.status(NOT_FOUND).json({ message: 'Team not found' });
        }

        if (updateData.members) {
            const hackathon = await Hackathon.findById(existingTeam.hackathon_id);
            if (hackathon) {
                const maxTeamSize = hackathon.limits?.maxMembersPerTeam || 4;
                if (updateData.members.length > maxTeamSize) {
                    return res.status(BAD_REQUEST).json({ message: `Team size cannot exceed ${maxTeamSize} members.` });
                }
            }
        }

        const updatedTeam = await Team.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
            .populate('members', 'user_name user_email')
            .populate('q_id');

        if (!updatedTeam) {
            return res.status(NOT_FOUND).json({ message: 'Team not found' });
        }
        res.status(OK).json({ message: 'Team updated successfully', team: updatedTeam });
    } catch (error) {
        res.status(INTERNAL_SERVER_ERROR).json({ message: 'Error updating team', error: error.message });
    }
};

export const deleteTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTeam = await Team.findByIdAndDelete(id);

        if (!deletedTeam) {
            return res.status(NOT_FOUND).json({ message: 'Team not found' });
        }
        
        await Hackathon.findByIdAndUpdate(deletedTeam.hackathon_id, { $pull: { teams: deletedTeam._id } });

        res.status(OK).json({ message: 'Team deleted successfully' });
    } catch (error) {
        res.status(INTERNAL_SERVER_ERROR).json({ message: 'Error deleting team', error: error.message });
    }
};

export const makeAllTeamsEvaluationReady = async (req, res) => {
    try {
        const { hackathonId } = req.params;
        
        if (!hackathonId) {
            return res.status(BAD_REQUEST).json({ message: "Hackathon ID is required." });
        }

        const hackathon = await Hackathon.findById(hackathonId);
        if (!hackathon) {
            return res.status(NOT_FOUND).json({ message: "Hackathon not found." });
        }

        const currentTime = new Date();
        
        // Update all teams in this hackathon to be ready for evaluation
        const updateResult = await Team.updateMany(
            {
                hackathon_id: hackathonId,
                ready_for_evaluation: false
            },
            {
                $set: {
                    ready_for_evaluation: true,
                    evaluation_ready_at: currentTime
                }
            }
        );

        res.status(OK).json({ 
            message: `Successfully made ${updateResult.modifiedCount} teams ready for evaluation in hackathon "${hackathon.hackathon_name}".`,
            teamsUpdated: updateResult.modifiedCount,
            hackathonName: hackathon.hackathon_name
        });
    } catch (error) {
        console.error("Error making teams evaluation ready:", error);
        res.status(INTERNAL_SERVER_ERROR).json({ message: "Server error while updating team evaluation readiness." });
    }
};

export const getTeamsEvaluationStatus = async (req, res) => {
    try {
        const { hackathonId } = req.params;
        
        if (!hackathonId) {
            return res.status(BAD_REQUEST).json({ message: "Hackathon ID is required." });
        }

        const teams = await Team.find({ hackathon_id: hackathonId })
            .populate('members', 'user_name')
            .populate('q_id', 'q_title')
            .select('team_name ready_for_evaluation evaluation_ready_at github_submission members q_id');

        const evaluationStats = {
            totalTeams: teams.length,
            readyForEvaluation: teams.filter(team => team.ready_for_evaluation).length,
            notReady: teams.filter(team => !team.ready_for_evaluation).length,
            withSubmissions: teams.filter(team => team.github_submission?.url).length,
            withoutSubmissions: teams.filter(team => !team.github_submission?.url).length
        };

        res.status(OK).json({
            stats: evaluationStats,
            teams: teams
        });
    } catch (error) {
        console.error("Error fetching teams evaluation status:", error);
        res.status(INTERNAL_SERVER_ERROR).json({ message: "Server error while fetching evaluation status." });
    }
};