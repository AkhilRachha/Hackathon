import { useState } from "react";
import { motion } from "framer-motion";
import DefaultLayout from "@/components/DefaultLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardList,
  Trophy,
  Github,
  ExternalLink,
  Star,
  CheckCircle,
  Clock,
  Users,
  BarChart3,
} from "lucide-react";

const EvaluatorDashboard = () => {
  const [teams, setTeams] = useState([
    {
      id: 1,
      name: "Code Warriors",
      members: ["Alice Johnson", "Bob Smith", "Carol Davis", "David Wilson"],
      project: "E-commerce Platform",
      githubRepo: "https://github.com/codewarriors/ecommerce-platform",
      commitId: "a1b2c3d4e5f6789",
      score: null,
      feedback: "",
      status: "pending",
    },
    {
      id: 2,
      name: "Tech Innovators",
      members: ["Emma Brown", "Frank Miller", "Grace Lee"],
      project: "AI Chatbot",
      githubRepo: "https://github.com/techinnovators/ai-chatbot",
      commitId: "b2c3d4e5f6g7890",
      score: 8.5,
      feedback:
        "Excellent implementation with good UI/UX. Could improve error handling.",
      status: "evaluated",
    },
    {
      id: 3,
      name: "Digital Pioneers",
      members: ["Henry Taylor", "Ivy Chen", "Jack Robinson", "Kate Adams"],
      project: "Mobile Fitness App",
      githubRepo: "https://github.com/digitalpioneers/fitness-app",
      commitId: "c3d4e5f6g7h8901",
      score: 7.2,
      feedback: "Good concept and execution. Missing some advanced features.",
      status: "evaluated",
    },
    {
      id: 4,
      name: "Future Builders",
      members: ["Liam Johnson", "Mia Wilson", "Noah Davis"],
      project: "Blockchain Voting System",
      githubRepo: "https://github.com/futurebuilders/blockchain-voting",
      commitId: "d4e5f6g7h8i9012",
      score: null,
      feedback: "",
      status: "pending",
    },
    {
      id: 5,
      name: "Innovation Squad",
      members: ["Olivia Brown", "Paul Miller", "Quinn Lee", "Ruby Taylor"],
      project: "IoT Smart Home",
      githubRepo: "https://github.com/innovationsquad/smart-home",
      commitId: "e5f6g7h8i9j0123",
      score: 9.1,
      feedback: "Outstanding project with innovative features and clean code.",
      status: "evaluated",
    },
  ]);

  const [selectedTeam, setSelectedTeam] = useState(null);
  const [evaluationScore, setEvaluationScore] = useState("");
  const [evaluationFeedback, setEvaluationFeedback] = useState("");

  const handleEvaluationSubmit = () => {
    if (selectedTeam && evaluationScore && evaluationFeedback) {
      setTeams((prev) =>
        prev.map((team) =>
          team.id === selectedTeam.id
            ? {
                ...team,
                score: parseFloat(evaluationScore),
                feedback: evaluationFeedback,
                status: "evaluated",
              }
            : team
        )
      );
      setSelectedTeam(null);
      setEvaluationScore("");
      setEvaluationFeedback("");
    }
  };

  const openEvaluationDialog = (team) => {
    setSelectedTeam(team);
    setEvaluationScore(team.score?.toString() || "");
    setEvaluationFeedback(team.feedback || "");
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      evaluated: { color: "bg-green-100 text-green-800", icon: CheckCircle },
    };

    const config = statusConfig[status] || statusConfig["pending"];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status === "pending" ? "Pending" : "Evaluated"}
      </Badge>
    );
  };

  const getScoreColor = (score) => {
    if (score >= 8) return "text-green-600 font-bold";
    if (score >= 6) return "text-yellow-600 font-bold";
    return "text-red-600 font-bold";
  };

  const evaluatedTeams = teams.filter((team) => team.status === "evaluated");
  const pendingTeams = teams.filter((team) => team.status === "pending");
  const averageScore =
    evaluatedTeams.length > 0
      ? (
          evaluatedTeams.reduce((sum, team) => sum + team.score, 0) /
          evaluatedTeams.length
        ).toFixed(1)
      : 0;

  return (
    <DefaultLayout userRole="evaluator">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50/30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-purple-600 bg-clip-text text-transparent">
              Evaluator Dashboard
            </h1>
            <p className="text-gray-600 mt-3 text-lg">
              Review and evaluate team submissions
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Teams
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      {teams.length}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
                <p className="text-sm text-blue-600 mt-2">Registered teams</p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Evaluated
                    </p>
                    <p className="text-3xl font-bold text-emerald-600">
                      {evaluatedTeams.length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
                <p className="text-sm text-emerald-600 mt-2">
                  Completed reviews
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-3xl font-bold text-amber-600">
                      {pendingTeams.length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-amber-500" />
                </div>
                <p className="text-sm text-amber-600 mt-2">
                  Awaiting evaluation
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Avg Score
                    </p>
                    <p className="text-3xl font-bold text-purple-600">
                      {averageScore}
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-purple-500" />
                </div>
                <p className="text-sm text-purple-600 mt-2">Overall average</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Team Submissions Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <ClipboardList className="w-6 h-6 mr-3 text-gray-700" />
                  Team Submissions
                </CardTitle>
                <CardDescription className="text-base">
                  Review and evaluate team projects and repositories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50">
                        <TableHead className="font-semibold">
                          Team Name
                        </TableHead>
                        <TableHead className="font-semibold">Project</TableHead>
                        <TableHead className="font-semibold">Members</TableHead>
                        <TableHead className="font-semibold">
                          Repository
                        </TableHead>
                        <TableHead className="font-semibold">Score</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teams.map((team) => (
                        <TableRow
                          key={team.id}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <TableCell className="font-medium">
                            {team.name}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200"
                            >
                              {team.project}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {team.members.slice(0, 2).map((member, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {member.split(" ")[0]}
                                </Badge>
                              ))}
                              {team.members.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{team.members.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                window.open(team.githubRepo, "_blank")
                              }
                              className="hover:bg-blue-50"
                            >
                              <Github className="w-4 h-4 mr-1" />
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </TableCell>
                          <TableCell>
                            {team.score ? (
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 text-yellow-500" />
                                <span
                                  className={`font-semibold ${getScoreColor(
                                    team.score
                                  )}`}
                                >
                                  {team.score}/10
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-500 italic">
                                Not scored
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(team.status)}</TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEvaluationDialog(team)}
                                  className="hover:bg-purple-50 hover:border-purple-200"
                                >
                                  {team.status === "evaluated"
                                    ? "View/Edit"
                                    : "Evaluate"}
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="text-2xl">
                                    Evaluate Team: {team.name}
                                  </DialogTitle>
                                  <DialogDescription className="text-base">
                                    Review the team's project and provide a
                                    score and feedback
                                  </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-6">
                                  {/* Team Info */}
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="p-4 bg-blue-50 rounded-lg">
                                      <h4 className="font-semibold mb-3 text-blue-900">
                                        Project
                                      </h4>
                                      <Badge
                                        variant="outline"
                                        className="bg-white text-blue-700 border-blue-200"
                                      >
                                        {team.project}
                                      </Badge>
                                    </div>
                                    <div className="p-4 bg-emerald-50 rounded-lg">
                                      <h4 className="font-semibold mb-3 text-emerald-900">
                                        Team Members
                                      </h4>
                                      <div className="space-y-2">
                                        {team.members.map((member, index) => (
                                          <p
                                            key={index}
                                            className="text-sm text-emerald-800"
                                          >
                                            {member}
                                          </p>
                                        ))}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Repository Info */}
                                  <div className="p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-semibold mb-3 text-gray-900">
                                      Repository Details
                                    </h4>
                                    <div className="space-y-3">
                                      <div className="flex items-center space-x-2">
                                        <Github className="w-5 h-5 text-gray-600" />
                                        <a
                                          href={team.githubRepo}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:underline font-medium"
                                        >
                                          {team.githubRepo}
                                        </a>
                                      </div>
                                      <p className="text-sm text-gray-600">
                                        Commit ID:{" "}
                                        <code className="bg-white px-2 py-1 rounded border font-mono text-xs">
                                          {team.commitId}
                                        </code>
                                      </p>
                                    </div>
                                  </div>

                                  {/* Evaluation Form */}
                                  <div className="space-y-4">
                                    <div>
                                      <Label
                                        htmlFor="score"
                                        className="text-sm font-semibold text-gray-700"
                                      >
                                        Score (0-10)
                                      </Label>
                                      <Input
                                        id="score"
                                        type="number"
                                        min="0"
                                        max="10"
                                        step="0.1"
                                        placeholder="Enter score"
                                        value={evaluationScore}
                                        onChange={(e) =>
                                          setEvaluationScore(e.target.value)
                                        }
                                        className="h-11 mt-2"
                                      />
                                    </div>

                                    <div>
                                      <Label
                                        htmlFor="feedback"
                                        className="text-sm font-semibold text-gray-700"
                                      >
                                        Feedback
                                      </Label>
                                      <Textarea
                                        id="feedback"
                                        placeholder="Provide detailed feedback on the project..."
                                        rows={4}
                                        value={evaluationFeedback}
                                        onChange={(e) =>
                                          setEvaluationFeedback(e.target.value)
                                        }
                                        className="mt-2"
                                      />
                                    </div>
                                  </div>

                                  <div className="flex justify-end space-x-3 pt-4 border-t">
                                    <Button variant="outline">Cancel</Button>
                                    <Button
                                      onClick={handleEvaluationSubmit}
                                      disabled={
                                        !evaluationScore || !evaluationFeedback
                                      }
                                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                                    >
                                      Submit Evaluation
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Scoreboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Trophy className="w-6 h-6 mr-3 text-yellow-600" />
                  Scoreboard
                </CardTitle>
                <CardDescription className="text-base">
                  Current rankings based on evaluation scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {evaluatedTeams
                    .sort((a, b) => b.score - a.score)
                    .map((team, index) => (
                      <motion.div
                        key={team.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        className={`flex items-center justify-between p-6 rounded-xl border transition-all duration-300 ${
                          index === 0
                            ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 shadow-lg"
                            : index === 1
                            ? "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 shadow-md"
                            : index === 2
                            ? "bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 shadow-md"
                            : "bg-white border-gray-200 hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg ${
                              index === 0
                                ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white"
                                : index === 1
                                ? "bg-gradient-to-r from-gray-400 to-gray-500 text-white"
                                : index === 2
                                ? "bg-gradient-to-r from-orange-400 to-orange-500 text-white"
                                : "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">
                              {team.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {team.project}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Star className="w-6 h-6 text-yellow-500" />
                          <span
                            className={`text-2xl font-bold ${getScoreColor(
                              team.score
                            )}`}
                          >
                            {team.score}/10
                          </span>
                        </div>
                      </motion.div>
                    ))}

                  {evaluatedTeams.length === 0 && (
                    <div className="text-center py-12">
                      <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">
                        No teams have been evaluated yet
                      </p>
                      <p className="text-gray-400 text-sm mt-2">
                        Start evaluating submissions to see the scoreboard
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </DefaultLayout>
  );
};

export default EvaluatorDashboard;
