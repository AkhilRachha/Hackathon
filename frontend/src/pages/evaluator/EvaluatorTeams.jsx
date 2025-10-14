import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  ClipboardList,
  Github,
  ExternalLink,
  Star,
  CheckCircle,
  Clock,
  UserCheck,
  Eye,
  Trophy,
} from "lucide-react";
import { selectTeamForEvaluation } from "@/api/evaluationApi";

const EvaluatorTeams = ({
  teams,
  myEvaluations,
  allTeamScores,
  onTeamSelect,
  onDataRefresh
}) => {
  const [activeTab, setActiveTab] = useState("my-evaluations");
  const { toast } = useToast();

  // Helper function to format dates
  const formatSubmissionTime = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Helper function to get submission times - based on actual team model structure
  const getSubmissionTimes = (team) => {
    // Based on the team model, submission times are stored as:
    // - mid_submission.submitted_at for mid submission
    // - github_submission.submitted_at for final submission

    const midTime = team.mid_submission?.submitted_at;
    const finalTime = team.github_submission?.submitted_at;



    return { midTime, finalTime };
  };

  // Filter teams based on evaluator assignment rules
  const getFilteredTeams = () => {
    const currentUserId = localStorage.getItem('userId');

    return teams.filter(team => {
      const isEvaluatedByMe = myEvaluations.some(evaluation => evaluation.team_id._id === team._id);
      const isAssignedToMe = team.assigned_evaluator?._id === currentUserId;
      const isNotAssigned = !team.assigned_evaluator;
      const isNotEvaluated = team.evaluation_status !== 'completed';

      // Show teams that are:
      // 1. Assigned to me and not yet evaluated
      // 2. Not assigned to anyone and not yet evaluated
      // 3. Already evaluated by me (for viewing/editing)
      return (isAssignedToMe && isNotEvaluated) ||
        (isNotAssigned && isNotEvaluated) ||
        isEvaluatedByMe;
    });
  };

  const openEvaluationDialog = async (team) => {
    const currentUserId = localStorage.getItem('userId');
    const isEvaluatedByMe = myEvaluations.some(evaluation => evaluation.team_id._id === team._id);

    // If already evaluated by me, just open for viewing/editing
    if (isEvaluatedByMe) {
      onTeamSelect(team);
      return;
    }

    // Check if team is being evaluated by another evaluator
    if (team.evaluation_status === 'being_evaluated' &&
      team.assigned_evaluator &&
      team.assigned_evaluator._id !== currentUserId) {
      toast({
        title: "Team Unavailable",
        description: `This team is currently being evaluated by ${team.assigned_evaluator.user_name}`,
        variant: "destructive"
      });
      return;
    }

    // If team is already assigned to me, directly open evaluation dialog
    if (team.assigned_evaluator?._id === currentUserId) {
      onTeamSelect(team);
      return;
    }

    // If team is not assigned to anyone, try to select it
    if (!team.assigned_evaluator) {
      try {
        await selectTeamForEvaluation(team._id);
        toast({
          title: "Team Selected",
          description: "Team has been assigned to you for evaluation",
        });
        // Refresh data to get updated team status
        if (onDataRefresh) {
          await onDataRefresh();
        }
        // Open evaluation dialog after successful selection
        onTeamSelect(team);
      } catch (error) {
        toast({
          title: "Selection Failed",
          description: error.response?.data?.message || "Failed to select team for evaluation",
          variant: "destructive"
        });
        return;
      }
    }
  };



  const getTeamScore = (teamId) => {
    const evaluation = myEvaluations.find(evaluation => evaluation.team_id._id === teamId);
    if (!evaluation) return null;

    const totalScore = evaluation.scores.reduce((sum, score) => sum + score.score, 0) / evaluation.scores.length;
    return totalScore.toFixed(1);
  };

  const getScoreColor = (score) => {
    if (score >= 8) return "text-green-600 font-bold";
    if (score >= 6) return "text-yellow-600 font-bold";
    return "text-red-600 font-bold";
  };

  const getStatusBadge = (team) => {
    const isEvaluated = myEvaluations.some(evaluation => evaluation.team_id._id === team._id);

    if (isEvaluated || team.evaluation_status === 'completed') {
      return (
        <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Completed
        </Badge>
      );
    }

    if (team.evaluation_status === 'being_evaluated') {
      const currentUserId = localStorage.getItem('userId');
      if (team.assigned_evaluator?._id === currentUserId) {
        return (
          <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
            <Eye className="w-3 h-3" />
            Evaluating (You)
          </Badge>
        );
      } else {
        return (
          <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
            <UserCheck className="w-3 h-3" />
            Being Evaluated ({team.assigned_evaluator?.user_name})
          </Badge>
        );
      }
    }

    return (
      <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
        <Clock className="w-3 h-3" />
        Available
      </Badge>
    );
  };

  const getAllTeamScore = (teamId) => {
    const teamScore = allTeamScores?.find(score => score.team_id._id === teamId);
    return teamScore ? teamScore.total_score : 0;
  };

  const getEvaluationCount = (teamId) => {
    const teamScore = allTeamScores?.find(score => score.team_id._id === teamId);
    return teamScore ? teamScore.evaluation_count : 0;
  };

  const getEvaluators = (teamId) => {
    const teamScore = allTeamScores?.find(score => score.team_id._id === teamId);
    if (!teamScore || !teamScore.evaluators) return [];

    // Since only one evaluator can evaluate one team, ensure we show unique names
    const uniqueEvaluators = [...new Set(teamScore.evaluators)];
    return uniqueEvaluators;
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <ClipboardList className="w-6 h-6 mr-3 text-gray-700" />
          Team Evaluations
        </CardTitle>
        <CardDescription className="text-base">
          Review your evaluations and view all team scores
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-evaluations" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Available for Evaluation ({getFilteredTeams().length})
            </TabsTrigger>
            <TabsTrigger value="all-scores" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              All Team Scores ({teams.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-evaluations" className="mt-6">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="font-semibold">Team Name</TableHead>
                    <TableHead className="font-semibold">Project</TableHead>
                    <TableHead className="font-semibold">Members</TableHead>
                    <TableHead className="font-semibold">Repository</TableHead>
                    <TableHead className="font-semibold">Submissions</TableHead>
                    <TableHead className="font-semibold">Score</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(() => {
                    const filteredTeams = getFilteredTeams();
                    return filteredTeams.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                          No teams available for evaluation.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTeams.map((team) => {
                        const teamScore = getTeamScore(team._id);
                        return (
                          <TableRow key={team._id} className="hover:bg-gray-50/50 transition-colors">
                            <TableCell className="font-medium">{team.team_name}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {team.q_id?.q_title || "No Project"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {team.members?.slice(0, 2).map((member, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {member.user_name}
                                  </Badge>
                                ))}
                                {team.members?.length > 2 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{team.members.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {team.github_submission?.url ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(team.github_submission.url, "_blank")}
                                  className="hover:bg-blue-50"
                                >
                                  <Github className="w-4 h-4 mr-1" />
                                  <ExternalLink className="w-3 h-3" />
                                </Button>
                              ) : (
                                <span className="text-gray-500 text-sm">Not submitted</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1 text-xs">
                                {(() => {
                                  const { midTime, finalTime } = getSubmissionTimes(team);
                                  return (
                                    <>
                                      {midTime && (
                                        <div className="text-blue-600">
                                          <span className="font-medium">Mid:</span> {formatSubmissionTime(midTime)}
                                        </div>
                                      )}
                                      {finalTime && (
                                        <div className="text-green-600">
                                          <span className="font-medium">Final:</span> {formatSubmissionTime(finalTime)}
                                        </div>
                                      )}
                                      {!midTime && !finalTime && (
                                        <span className="text-gray-500">No submissions</span>
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                            </TableCell>
                            <TableCell>
                              {teamScore ? (
                                <div className="flex items-center space-x-1">
                                  <Star className="w-4 h-4 text-yellow-500" />
                                  <span className={`font-semibold ${getScoreColor(teamScore)}`}>
                                    {teamScore}/10
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-500 italic">Not Scored</span>
                              )}
                            </TableCell>
                            <TableCell>{getStatusBadge(team)}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {(() => {
                                  const currentUserId = localStorage.getItem('userId');
                                  const isEvaluatedByMe = myEvaluations.some(evaluation => evaluation.team_id._id === team._id);
                                  const isAssignedToMe = team.assigned_evaluator?._id === currentUserId;
                                  const hasSubmission = team.github_submission?.url;



                                  if (isEvaluatedByMe) {
                                    return (
                                      <Button
                                        size="sm"
                                        onClick={() => openEvaluationDialog(team)}
                                      >
                                        View/Edit
                                      </Button>
                                    );
                                  }

                                  if (isAssignedToMe) {
                                    return (
                                      <Button
                                        size="sm"
                                        onClick={() => openEvaluationDialog(team)}
                                      >
                                        Evaluate
                                      </Button>
                                    );
                                  }

                                  // Team is not assigned to anyone - only disable if no submission
                                  return (
                                    <Button
                                      size="sm"
                                      onClick={() => openEvaluationDialog(team)}
                                      disabled={!hasSubmission}
                                    >
                                      Select & Evaluate
                                    </Button>
                                  );
                                })()}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    );
                  })()}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="all-scores" className="mt-6">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="font-semibold">Rank</TableHead>
                    <TableHead className="font-semibold">Team Name</TableHead>
                    <TableHead className="font-semibold">Project</TableHead>
                    <TableHead className="font-semibold">Members</TableHead>
                    <TableHead className="font-semibold">Submissions</TableHead>
                    <TableHead className="font-semibold">Average Score</TableHead>
                    <TableHead className="font-semibold">Evaluations</TableHead>
                    <TableHead className="font-semibold">Repository</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teams.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No teams available.
                      </TableCell>
                    </TableRow>
                  ) : (
                    teams
                      .map(team => ({
                        ...team,
                        averageScore: getAllTeamScore(team._id),
                        evaluationCount: getEvaluationCount(team._id),
                        evaluators: getEvaluators(team._id)
                      }))
                      .sort((a, b) => b.averageScore - a.averageScore)
                      .map((team, index) => (
                        <TableRow key={team._id} className="hover:bg-gray-50/50 transition-colors">
                          <TableCell className="font-bold text-lg">
                            <div className="flex items-center gap-2">
                              #{index + 1}
                              {index === 0 && <Trophy className="w-4 h-4 text-yellow-500" />}
                              {index === 1 && <Star className="w-4 h-4 text-gray-400" />}
                              {index === 2 && <Star className="w-4 h-4 text-amber-600" />}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{team.team_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {team.q_id?.q_title || "No Project"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {team.members?.slice(0, 2).map((member, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {member.user_name}
                                </Badge>
                              ))}
                              {team.members?.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{team.members.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1 text-xs">
                              {(() => {
                                const { midTime, finalTime } = getSubmissionTimes(team);
                                return (
                                  <>
                                    {midTime && (
                                      <div className="text-blue-600">
                                        <span className="font-medium">Mid:</span> {formatSubmissionTime(midTime)}
                                      </div>
                                    )}
                                    {finalTime && (
                                      <div className="text-green-600">
                                        <span className="font-medium">Final:</span> {formatSubmissionTime(finalTime)}
                                      </div>
                                    )}
                                    {!midTime && !finalTime && (
                                      <span className="text-gray-500">No submissions</span>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className={`font-bold text-lg ${getScoreColor(team.averageScore)}`}>
                                {team.averageScore.toFixed(1)}/10
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Badge variant="outline">
                                {team.evaluationCount} evaluation{team.evaluationCount !== 1 ? 's' : ''}
                              </Badge>
                              {team.evaluators && team.evaluators.length > 0 && (
                                <div className="text-xs text-gray-500">
                                  By: {team.evaluators[0]}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {team.github_submission?.url ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(team.github_submission.url, "_blank")}
                                className="hover:bg-blue-50"
                              >
                                <Github className="w-4 h-4 mr-1" />
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            ) : (
                              <span className="text-gray-500 text-sm">Not submitted</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EvaluatorTeams;