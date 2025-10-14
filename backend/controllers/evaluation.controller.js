import Evaluation from '../models/evaluation.model.js';
import Score from '../models/score.model.js';
import Team from '../models/team.model.js';
import User from '../models/user.model.js';
import Hackathon from '../models/hackathon.model.js';
import { updateHackathonStatuses, performCompleteCleanup } from './hackathon.controller.js';
import mongoose from 'mongoose';
import {
    OK,
    BAD_REQUEST,
    FORBIDDEN,
    NOT_FOUND,
    CONFLICT,
    INTERNAL_SERVER_ERROR
} from 'http-status-codes';

// Get evaluator dashboard data
export const getEvaluatorDashboardData = async (req, res) => {
    try {
        const evaluatorId = req.user._id;
        const evaluator = await User.findById(evaluatorId);
        if (!evaluator) {
            return res.status(NOT_FOUND).json({ message: "Evaluator not found" });
        }

        const hackathonId = await findEvaluatorHackathon(evaluatorId);
        if (!hackathonId) {
            return res.status(NOT_FOUND).json({ message: "No hackathon assigned to evaluator" });
        }

        const hackathon = await Hackathon.findById(hackathonId);
        if (!hackathon) {
            return res.status(NOT_FOUND).json({ message: "Hackathon not found" });
        }

        // Get all teams for evaluation (remove strict ready_for_evaluation filter)
        const teams = await Team.find({ hackathon_id: hackathonId })
            .populate('members', 'user_name user_email')
            .populate('q_id', 'q_title q_description evaluationCriteria')
            .populate('coordinator_id', 'user_name')
            .populate('assigned_evaluator', 'user_name')
            .lean();

        const allEvaluations = await Evaluation.find({ h_id: hackathonId })
            .populate('t_id', 'team_name github_submission')
            .populate({
                path: 'scores',
                populate: { path: 'evaluator_id', select: 'user_name' }
            })
            .lean();

        const myEvaluationsQuery = await Evaluation.find({ h_id: hackathonId })
            .populate('t_id', 'team_name github_submission')
            .populate({
                path: 'scores',
                match: { evaluator_id: evaluatorId },
                populate: { path: 'evaluator_id', select: 'user_name' }
            })
            .lean();

        const myEvaluations = myEvaluationsQuery
            .filter(evaluation => evaluation.scores && evaluation.scores.length > 0)
            .map(evaluation => {
                const myScore = evaluation.scores[0];
                return {
                    _id: evaluation._id,
                    team_id: evaluation.t_id,
                    scores: myScore ? myScore.criterionScores : [],
                    feedback: myScore ? myScore.feedback : '',
                    total_score: myScore ? myScore.total_score : 0
                };
            });

        const allTeamScores = allEvaluations.map(evaluation => {
            if (evaluation.scores && evaluation.scores.length > 0) {
                const totalScore = evaluation.scores.reduce((sum, score) => sum + score.total_score, 0);
                const averageScore = totalScore / evaluation.scores.length;
                return {
                    _id: evaluation._id,
                    team_id: evaluation.t_id,
                    total_score: parseFloat(averageScore.toFixed(2)),
                    evaluation_count: evaluation.scores.length,
                    evaluators: evaluation.scores.map(score => score.evaluator_id.user_name)
                };
            }
            return { _id: evaluation._id, team_id: evaluation.t_id, total_score: 0, evaluation_count: 0, evaluators: [] };
        });

        // Only consider teams that have submitted their final submission
        const teamsWithFinalSubmission = teams.filter(team => 
            team.github_submission && team.github_submission.url
        );

        // Check if all teams with final submissions have been evaluated
        const allTeamsEvaluated = teamsWithFinalSubmission.length > 0 && 
            teamsWithFinalSubmission.every(team =>
                allEvaluations.some(evaluation =>
                    evaluation.t_id._id.toString() === team._id.toString() &&
                    evaluation.scores &&
                    evaluation.scores.length > 0
                )
            );

        const [participants, coordinators, evaluators, teamsList] = await Promise.all([
            User.find({ current_hackathon: hackathonId, role_name: 'participant' }).select('user_name user_email').lean(),
            User.find({ current_hackathon: hackathonId, role_name: 'coordinator' }).select('user_name user_email').lean(),
            User.find({ current_hackathon: hackathonId, role_name: 'evaluator' }).select('user_name user_email').lean(),
            Team.find({ hackathon_id: hackathonId }).select('team_name members').populate('members', 'user_name').lean()
        ]);

        const stats = {
            total_teams: teams.length,
            teams_with_submissions: teamsWithFinalSubmission.length,
            total_participants: participants.length,
            total_coordinators: coordinators.length,
            total_evaluators: evaluators.length,
            teamsList,
            participantsList: participants,
            coordinatorsList: coordinators,
            evaluatorsList: evaluators
        };

        const dashboardData = {
            hackathon,
            stats,
            teams,
            myEvaluations,
            allTeamScores,
            allTeamsEvaluated
        };

        res.status(OK).json(dashboardData);
    } catch (error) {
        console.error("Error fetching evaluator dashboard data:", error);
        res.status(INTERNAL_SERVER_ERROR).json({ message: "Server error while fetching dashboard data", error: error.message });
    }
};

// Submit or update evaluation
export const submitEvaluation = async (req, res) => {
    try {
        const evaluatorId = req.user._id;
        const { team_id, scores, feedback } = req.body;

        if (!team_id || !scores || !Array.isArray(scores)) {
            return res.status(BAD_REQUEST).json({ message: "Team ID and scores array are required" });
        }

        const evaluator = await User.findById(evaluatorId);
        if (!evaluator || !evaluator.current_hackathon) {
            return res.status(NOT_FOUND).json({ message: "No hackathon assigned to evaluator" });
        }
        const hackathonId = evaluator.current_hackathon;

        const team = await Team.findById(team_id);
        if (!team || team.hackathon_id.toString() !== hackathonId.toString()) {
            return res.status(NOT_FOUND).json({ message: "Team not found or not in your assigned hackathon" });
        }

        // Allow evaluation of any team - automatically mark as ready when evaluated
        if (!team.ready_for_evaluation) {
            team.ready_for_evaluation = true;
            team.evaluation_ready_at = new Date();
            await team.save();
        }

        const totalScore = scores.reduce((sum, score) => sum + score.score, 0) / scores.length;
        let evaluation = await Evaluation.findOne({ h_id: hackathonId, t_id: team_id }).populate('scores');
        let scoreDoc;

        if (evaluation) {
            const existingScoreInEval = evaluation.scores.find(score => score.evaluator_id && score.evaluator_id.toString() === evaluatorId);
            if (existingScoreInEval) {
                await Score.findByIdAndUpdate(existingScoreInEval._id, {
                    criterionScores: scores.map(s => ({ criterionName: s.criteriaName, score: s.score })),
                    hackathonId: hackathonId,
                    total_score: totalScore,
                    feedback: feedback
                });
                scoreDoc = existingScoreInEval;
            } else {
                scoreDoc = new Score({
                    criterionScores: scores.map(s => ({ criterionName: s.criteriaName, score: s.score })),
                    evaluator_id: evaluatorId,
                    hackathonId: hackathonId,
                    total_score: totalScore,
                    feedback: feedback
                });
                await scoreDoc.save();
                evaluation.scores.push(scoreDoc._id);
                await evaluation.save();
            }
        } else {
            scoreDoc = new Score({
                criterionScores: scores.map(s => ({ criterionName: s.criteriaName, score: s.score })),
                evaluator_id: evaluatorId,
                hackathonId: hackathonId,
                total_score: totalScore,
                feedback: feedback
            });
            await scoreDoc.save();
            evaluation = new Evaluation({
                h_id: hackathonId,
                q_id: team.q_id,
                t_id: team_id,
                scores: [scoreDoc._id]
            });
            await evaluation.save();
        }

        await Team.findByIdAndUpdate(team_id, { evaluation_status: 'completed', assigned_evaluator: evaluatorId });

        res.status(OK).json({
            message: "Evaluation submitted successfully",
            score: scoreDoc
        });

    } catch (error) {
        console.error("Error submitting evaluation:", error);
        res.status(INTERNAL_SERVER_ERROR).json({ message: "Server error while submitting evaluation", error: error.message });
    }
};

// Get all evaluations for a hackathon
export const getAllEvaluations = async (req, res) => {
    try {
        const evaluator = await User.findById(req.user._id);
        if (!evaluator || !evaluator.current_hackathon) {
            return res.status(NOT_FOUND).json({ message: "No hackathon assigned to evaluator" });
        }
        const hackathonId = evaluator.current_hackathon;

        const evaluations = await Evaluation.find({ h_id: hackathonId })
            .populate({ path: 't_id', populate: { path: 'q_id', select: 'q_title' } })
            .populate({ path: 'scores', populate: { path: 'evaluator_id', select: 'user_name' } });

        const teamScores = evaluations.map(evaluation => {
            if (evaluation.scores && evaluation.scores.length > 0) {
                const avgScore = evaluation.scores.reduce((sum, score) => sum + score.total_score, 0) / evaluation.scores.length;
                return {
                    _id: evaluation._id,
                    team_id: evaluation.t_id,
                    total_score: avgScore
                };
            }
            return null;
        }).filter(Boolean);

        res.status(OK).json(teamScores);
    } catch (error) {
        console.error("Error fetching all evaluations:", error);
        res.status(INTERNAL_SERVER_ERROR).json({ message: "Server error while fetching evaluations", error: error.message });
    }
};

// Get evaluations by current evaluator
export const getMyEvaluations = async (req, res) => {
    try {
        const evaluatorId = req.user._id;
        const evaluator = await User.findById(evaluatorId);
        if (!evaluator || !evaluator.current_hackathon) {
            return res.status(NOT_FOUND).json({ message: "No hackathon assigned to evaluator" });
        }
        const hackathonId = evaluator.current_hackathon;

        const evaluations = await Evaluation.find({ h_id: hackathonId })
            .populate({ path: 't_id', populate: { path: 'q_id', select: 'q_title' } })
            .populate({ path: 'scores', populate: { path: 'evaluator_id', select: 'user_name' } });

        const myEvaluations = evaluations.filter(evaluation => 
            evaluation.scores.some(score => score.evaluator_id._id.toString() === evaluatorId)
        ).map(evaluation => {
            const myScore = evaluation.scores.find(score => score.evaluator_id._id.toString() === evaluatorId);
            return {
                _id: evaluation._id,
                team_id: evaluation.t_id,
                scores: myScore ? myScore.criterionScores : [],
                feedback: myScore ? myScore.feedback : '',
                total_score: myScore ? myScore.total_score : 0
            };
        });

        res.status(OK).json(myEvaluations);
    } catch (error) {
        console.error("Error fetching my evaluations:", error);
        res.status(INTERNAL_SERVER_ERROR).json({ message: "Server error while fetching evaluations", error: error.message });
    }
};

// Get evaluation by ID
export const getEvaluationById = async (req, res) => {
    try {
        const { id } = req.params;
        const evaluation = await Evaluation.findById(id).populate('t_id').populate('evaluator_id', 'user_name');

        if (!evaluation) {
            return res.status(NOT_FOUND).json({ message: "Evaluation not found" });
        }
        res.status(OK).json(evaluation);
    } catch (error) {
        console.error("Error fetching evaluation:", error);
        res.status(INTERNAL_SERVER_ERROR).json({ message: "Server error while fetching evaluation", error: error.message });
    }
};

// Update evaluation
export const updateEvaluation = async (req, res) => {
    try {
        const { id } = req.params;
        const { scores, feedback } = req.body;
        const evaluation = await Evaluation.findById(id);

        if (!evaluation) {
            return res.status(NOT_FOUND).json({ message: "Evaluation not found" });
        }

        evaluation.scores = scores || evaluation.scores;
        evaluation.feedback = feedback || evaluation.feedback;
        evaluation.evaluated_at = new Date();
        await evaluation.save();

        const populatedEvaluation = await Evaluation.findById(evaluation._id)
            .populate('t_id', 'team_name')
            .populate('evaluator_id', 'user_name');

        res.status(OK).json({
            message: "Evaluation updated successfully",
            evaluation: populatedEvaluation
        });
    } catch (error) {
        console.error("Error updating evaluation:", error);
        res.status(INTERNAL_SERVER_ERROR).json({ message: "Server error while updating evaluation", error: error.message });
    }
};

// Delete evaluation
export const deleteEvaluation = async (req, res) => {
    try {
        const { id } = req.params;
        const evaluation = await Evaluation.findByIdAndDelete(id);

        if (!evaluation) {
            return res.status(NOT_FOUND).json({ message: "Evaluation not found" });
        }
        res.status(OK).json({ message: "Evaluation deleted successfully" });
    } catch (error) {
        console.error("Error deleting evaluation:", error);
        res.status(INTERNAL_SERVER_ERROR).json({ message: "Server error while deleting evaluation", error: error.message });
    }
};


// Select team for evaluation (exclusive lock)
export const selectTeamForEvaluation = async (req, res) => {
    try {
        const evaluatorId = req.user._id;
        const { team_id } = req.body;

        if (!team_id) {
            return res.status(BAD_REQUEST).json({ message: "Team ID is required" });
        }

        const evaluator = await User.findById(evaluatorId);
        if (!evaluator || !evaluator.current_hackathon) {
            return res.status(NOT_FOUND).json({ message: "No hackathon assigned to evaluator" });
        }
        const hackathonId = evaluator.current_hackathon;

        const team = await Team.findById(team_id);
        if (!team || team.hackathon_id.toString() !== hackathonId.toString()) {
            return res.status(NOT_FOUND).json({ message: "Team not found or not in your assigned hackathon" });
        }

        // Allow selection of any team - automatically mark as ready when selected
        if (!team.ready_for_evaluation) {
            team.ready_for_evaluation = true;
            team.evaluation_ready_at = new Date();
        }

        if (team.evaluation_status === 'being_evaluated' && team.assigned_evaluator && team.assigned_evaluator.toString() !== evaluatorId) {
            return res.status(CONFLICT).json({
                message: "Team is already being evaluated by another evaluator",
                assigned_evaluator: team.assigned_evaluator
            });
        }

        if (team.evaluation_status === 'completed') {
            return res.status(CONFLICT).json({ message: "Team evaluation has already been completed" });
        }

        team.assigned_evaluator = evaluatorId;
        team.evaluation_status = 'being_evaluated';
        team.evaluation_started_at = new Date();
        await team.save();

        res.status(OK).json({
            message: "Team selected for evaluation successfully",
            team: {
                _id: team._id,
                team_name: team.team_name,
                evaluation_status: team.evaluation_status,
                assigned_evaluator: team.assigned_evaluator
            }
        });

    } catch (error) {
        console.error("Error selecting team for evaluation:", error);
        res.status(INTERNAL_SERVER_ERROR).json({ message: "Server error while selecting team", error: error.message });
    }
};

// Release team from evaluation
export const releaseTeamFromEvaluation = async (req, res) => {
    try {
        const evaluatorId = req.user._id;
        const { team_id } = req.body;

        if (!team_id) {
            return res.status(BAD_REQUEST).json({ message: "Team ID is required" });
        }

        const team = await Team.findById(team_id);
        if (!team) {
            return res.status(NOT_FOUND).json({ message: "Team not found" });
        }

        if (team.assigned_evaluator && team.assigned_evaluator.toString() !== evaluatorId) {
            return res.status(FORBIDDEN).json({
                message: "You can only release teams assigned to you"
            });
        }

        team.assigned_evaluator = null;
        team.evaluation_status = 'available';
        team.evaluation_started_at = null;
        await team.save();

        res.status(OK).json({
            message: "Team released from evaluation successfully",
            team: {
                _id: team._id,
                team_name: team.team_name,
                evaluation_status: team.evaluation_status,
                assigned_evaluator: team.assigned_evaluator
            }
        });
    } catch (error) {
        console.error("Error releasing team from evaluation:", error);
        res.status(INTERNAL_SERVER_ERROR).json({ message: "Server error while releasing team", error: error.message });
    }
};

// Announce winners
export const announceWinners = async (req, res) => {
    try {
        const { hackathon_id, firstPlace, secondPlace, thirdPlace } = req.body;
        if (!hackathon_id || !firstPlace || !secondPlace || !thirdPlace) {
            return res.status(BAD_REQUEST).json({ message: "All winner positions are required" });
        }

        const hackathon = await Hackathon.findById(hackathon_id);
        if (!hackathon) {
            return res.status(NOT_FOUND).json({ message: "Hackathon not found" });
        }

        if (hackathon.winners && (hackathon.winners.firstPlace || hackathon.winners.secondPlace || hackathon.winners.thirdPlace)) {
            return res.status(CONFLICT).json({ message: "Winners have already been announced for this hackathon" });
        }

        const evaluationCount = await Evaluation.countDocuments({ h_id: hackathon_id });
        if (evaluationCount === 0) {
            return res.status(BAD_REQUEST).json({ message: "Cannot announce winners without any evaluations." });
        }

        const [firstTeam, secondTeam, thirdTeam] = await Promise.all([
            Team.findById(firstPlace),
            Team.findById(secondPlace),
            Team.findById(thirdPlace)
        ]);

        if (!firstTeam || !secondTeam || !thirdTeam) {
            return res.status(NOT_FOUND).json({ message: "One or more selected teams not found" });
        }

        const updatedHackathon = await Hackathon.findByIdAndUpdate(
            hackathon_id,
            {
                $set: {
                    'winners.firstPlace': firstPlace,
                    'winners.secondPlace': secondPlace,
                    'winners.thirdPlace': thirdPlace,
                    'status': 'completed',
                    'winnersAnnouncedAt': new Date()
                }
            },
            { new: true }
        ).populate({
             path: 'winners.firstPlace winners.secondPlace winners.thirdPlace',
             populate: { path: 'members', select: 'user_name' }
         });

        const cleanupStats = await performCompleteCleanup(hackathon_id);
        
        res.status(OK).json({
            message: "Winners announced successfully!",
            hackathon: updatedHackathon,
            cleanupStatistics: cleanupStats
        });

    } catch (error) {
        console.error("Error announcing winners:", error);
        res.status(INTERNAL_SERVER_ERROR).json({ message: "Server error while announcing winners", error: error.message });
    }
};

// --- Helper and Utility Functions ---

export const cleanupStaleLocks = async () => {
    try {
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        const staleTeams = await Team.find({
            evaluation_status: 'being_evaluated',
            evaluation_started_at: { $lt: thirtyMinutesAgo }
        });

        for (const team of staleTeams) {
            team.assigned_evaluator = null;
            team.evaluation_status = 'available';
            team.evaluation_started_at = null;
            await team.save();
        }
    } catch (error) {
        console.error("Error cleaning up stale locks:", error);
    }
};

setInterval(cleanupStaleLocks, 10 * 60 * 1000); // Auto-cleanup every 10 minutes

const findEvaluatorHackathon = async (evaluatorId) => {
    const evaluator = await User.findById(evaluatorId);
    if (!evaluator) return null;
    if (evaluator.current_hackathon) return evaluator.current_hackathon;
    // Fallback logic to find recent hackathons can be added here if needed
    return null;
};

export const reconnectEvaluatorToHackathon = async (req, res) => {
    try {
        const evaluatorId = req.user._id;
        const hackathonId = await findEvaluatorHackathon(evaluatorId);
        
        if (!hackathonId) {
            return res.status(NOT_FOUND).json({ message: "No available hackathon found for reconnection" });
        }
        
        await User.findByIdAndUpdate(evaluatorId, {
            current_hackathon: hackathonId,
            role_name: 'evaluator'
        });
        
        const hackathon = await Hackathon.findById(hackathonId);
        
        res.status(OK).json({
            message: "Successfully reconnected to hackathon",
            hackathon: hackathon
        });
        
    } catch (error) {
        console.error("Error reconnecting evaluator to hackathon:", error);
        res.status(INTERNAL_SERVER_ERROR).json({ message: "Server error", error: error.message });
    }
};

export const getEvaluatorStatus = async (req, res) => {
    try {
        const evaluatorId = req.user._id;
        await updateHackathonStatuses();
        
        const evaluator = await User.findById(evaluatorId);
        if (!evaluator) {
            return res.status(NOT_FOUND).json({ message: "Evaluator not found" });
        }

        const effectiveHackathonId = await findEvaluatorHackathon(evaluatorId);
        let hackathonDetails = null;
        
        if (effectiveHackathonId) {
            hackathonDetails = await Hackathon.findById(effectiveHackathonId);
        }
        
        res.status(OK).json({
            evaluator: {
                ...evaluator.toObject(),
                current_hackathon: effectiveHackathonId,
                hackathon_details: hackathonDetails
            }
        });
    } catch (error) {
        console.error("Error fetching evaluator status:", error);
        res.status(INTERNAL_SERVER_ERROR).json({ message: "Server error", error: error.message });
    }
};