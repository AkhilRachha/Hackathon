import { useState } from "react";
import { motion } from "framer-motion";
import DefaultLayout from "@/components/DefaultLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Users,
  User,
  Code,
  GitBranch,
  CheckCircle,
  Clock,
  ExternalLink,
  Upload,
  Star,
  Calendar,
  Target,
} from "lucide-react";

const ParticipantDashboard = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [githubRepo, setGithubRepo] = useState("");
  const [commitId, setCommitId] = useState("");
  const [submissionStatus, setSubmissionStatus] = useState("pending");

  // Mock team data
  const teamData = {
    name: "Code Warriors",
    members: [
      "Alice Johnson (You)",
      "Bob Smith",
      "Carol Davis",
      "David Wilson",
    ],
    coordinator: "John Doe",
    deadline: "2025-02-15",
    progress: 65,
  };

  // Mock available projects
  const availableProjects = [
    {
      id: 1,
      title: "E-commerce Platform",
      description:
        "Build a full-stack e-commerce platform with user authentication, product catalog, shopping cart, and payment integration.",
      difficulty: "Medium",
      category: "Web Development",
      rating: 4.2,
      participants: 24,
      requirements: [
        "User registration and authentication",
        "Product catalog with search and filters",
        "Shopping cart functionality",
        "Payment gateway integration",
        "Admin panel for product management",
      ],
      techStack: ["React", "Node.js", "MongoDB", "Express"],
    },
    {
      id: 2,
      title: "AI Chatbot",
      description:
        "Create an intelligent chatbot using natural language processing that can answer questions and provide assistance.",
      difficulty: "Hard",
      category: "Machine Learning",
      rating: 4.7,
      participants: 18,
      requirements: [
        "Natural language understanding",
        "Context-aware responses",
        "Integration with external APIs",
        "Web interface for interaction",
        "Training data management",
      ],
      techStack: ["Python", "TensorFlow", "Flask", "React"],
    },
    {
      id: 3,
      title: "Mobile Fitness App",
      description:
        "Develop a mobile application for fitness tracking with workout plans, progress monitoring, and social features.",
      difficulty: "Medium",
      category: "Mobile Development",
      rating: 4.0,
      participants: 32,
      requirements: [
        "Workout tracking and logging",
        "Progress visualization",
        "Social features and challenges",
        "Nutrition tracking",
        "Wearable device integration",
      ],
      techStack: ["React Native", "Firebase", "Node.js"],
    },
    {
      id: 4,
      title: "Blockchain Voting System",
      description:
        "Build a secure and transparent voting system using blockchain technology.",
      difficulty: "Hard",
      category: "Blockchain",
      rating: 4.5,
      participants: 12,
      requirements: [
        "Secure voter authentication",
        "Transparent vote recording",
        "Real-time result tracking",
        "Audit trail functionality",
        "Mobile-friendly interface",
      ],
      techStack: ["Solidity", "Web3.js", "React", "Ethereum"],
    },
  ];

  const handleProjectSelection = (project) => {
    setSelectedProject(project);
  };

  const handleSubmission = () => {
    if (githubRepo && commitId) {
      setSubmissionStatus("submitted");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        color: "bg-amber-50 text-amber-700 border-amber-200",
        icon: Clock,
        text: "Pending",
      },
      submitted: {
        color: "bg-blue-50 text-blue-700 border-blue-200",
        icon: CheckCircle,
        text: "Submitted",
      },
      reviewed: {
        color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: CheckCircle,
        text: "Reviewed",
      },
    };

    const config = statusConfig[status] || statusConfig["pending"];
    const Icon = config.icon;

    return (
      <Badge
        variant="outline"
        className={`${config.color} flex items-center gap-1.5 px-3 py-1`}
      >
        <Icon className="w-3.5 h-3.5" />
        {config.text}
      </Badge>
    );
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      Easy: "bg-emerald-50 text-emerald-700 border-emerald-200",
      Medium: "bg-amber-50 text-amber-700 border-amber-200",
      Hard: "bg-red-50 text-red-700 border-red-200",
    };
    return colors[difficulty] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  return (
    <DefaultLayout userRole="participant">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
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
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
              Participant Dashboard
            </h1>
            <p className="text-gray-600 mt-3 text-lg">
              Manage your team project and submissions
            </p>
          </motion.div>

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Team Progress
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      {teamData.progress}%
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-blue-500" />
                </div>
                <div className="mt-4 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${teamData.progress}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Deadline
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      Feb 15, 2025
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-amber-500" />
                </div>
                <p className="text-sm text-amber-600 mt-2">10 days remaining</p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Submission Status
                    </p>
                    <div className="mt-2">
                      {getStatusBadge(submissionStatus)}
                    </div>
                  </div>
                  <Upload className="w-8 h-8 text-emerald-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Team Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-xl">
                  <Users className="w-6 h-6 mr-3 text-blue-600" />
                  {teamData.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-4 flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Team Members
                    </h4>
                    <div className="space-y-3">
                      {teamData.members.map((member, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: 0.4 + index * 0.1,
                            duration: 0.3,
                          }}
                          className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
                            member.includes("(You)")
                              ? "bg-blue-50 border border-blue-200"
                              : "bg-gray-50 hover:bg-gray-100"
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full mr-3 ${
                              member.includes("(You)")
                                ? "bg-blue-500"
                                : "bg-gray-400"
                            }`}
                          />
                          <span
                            className={`font-medium ${
                              member.includes("(You)")
                                ? "text-blue-700"
                                : "text-gray-700"
                            }`}
                          >
                            {member}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-4">
                      Coordinator
                    </h4>
                    <div className="flex items-center p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border border-emerald-200">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                        <User className="w-5 h-5 text-emerald-600" />
                      </div>
                      <span className="font-semibold text-emerald-700">
                        {teamData.coordinator}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Project Selection or Selected Project */}
          {!selectedProject ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Code className="w-6 h-6 mr-3 text-purple-600" />
                    Available Projects
                  </CardTitle>
                  <CardDescription className="text-base">
                    Choose a project for your team to work on during the
                    hackathon
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {availableProjects.map((project, index) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                        className="group relative bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 cursor-pointer"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-4">
                            <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-700 transition-colors">
                              {project.title}
                            </h3>
                            <Badge
                              variant="outline"
                              className={`${getDifficultyColor(
                                project.difficulty
                              )} text-xs font-medium`}
                            >
                              {project.difficulty}
                            </Badge>
                          </div>

                          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                            {project.description}
                          </p>

                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Badge
                                variant="outline"
                                className="text-xs bg-white"
                              >
                                {project.category}
                              </Badge>
                              <div className="flex items-center text-xs text-gray-500">
                                <Star className="w-3 h-3 mr-1 text-yellow-500" />
                                {project.rating}
                                <span className="mx-2">•</span>
                                <Users className="w-3 h-3 mr-1" />
                                {project.participants}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {project.techStack
                                .slice(0, 3)
                                .map((tech, techIndex) => (
                                  <Badge
                                    key={techIndex}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {tech}
                                  </Badge>
                                ))}
                              {project.techStack.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{project.techStack.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="mt-6 flex items-center justify-between">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="hover:bg-blue-50"
                                >
                                  View Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="text-2xl">
                                    {project.title}
                                  </DialogTitle>
                                  <DialogDescription className="text-base">
                                    {project.description}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-6">
                                  <div className="flex items-center gap-4">
                                    <Badge
                                      variant="outline"
                                      className={getDifficultyColor(
                                        project.difficulty
                                      )}
                                    >
                                      {project.difficulty}
                                    </Badge>
                                    <Badge variant="outline">
                                      {project.category}
                                    </Badge>
                                    <div className="flex items-center text-sm text-gray-600">
                                      <Star className="w-4 h-4 mr-1 text-yellow-500" />
                                      {project.rating} rating
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-semibold mb-3 text-lg">
                                      Requirements
                                    </h4>
                                    <ul className="space-y-2">
                                      {project.requirements.map(
                                        (req, reqIndex) => (
                                          <li
                                            key={reqIndex}
                                            className="flex items-start"
                                          >
                                            <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                                            <span className="text-sm">
                                              {req}
                                            </span>
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>

                                  <div>
                                    <h4 className="font-semibold mb-3 text-lg">
                                      Recommended Tech Stack
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                      {project.techStack.map(
                                        (tech, techIndex) => (
                                          <Badge
                                            key={techIndex}
                                            variant="secondary"
                                            className="text-sm"
                                          >
                                            {tech}
                                          </Badge>
                                        )
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>

                            <Button
                              onClick={() => handleProjectSelection(project)}
                              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                            >
                              Select Project
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            /* Selected Project & Submission */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="space-y-6"
            >
              {/* Selected Project Display */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="w-6 h-6 mr-3 text-blue-600" />
                      <span className="text-blue-900">Selected Project</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProject(null)}
                      className="hover:bg-white"
                    >
                      Change Project
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <h3 className="text-2xl font-bold text-blue-900">
                        {selectedProject.title}
                      </h3>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className={getDifficultyColor(
                            selectedProject.difficulty
                          )}
                        >
                          {selectedProject.difficulty}
                        </Badge>
                        <div className="flex items-center text-sm text-blue-700">
                          <Star className="w-4 h-4 mr-1 text-yellow-500" />
                          {selectedProject.rating}
                        </div>
                      </div>
                    </div>

                    <p className="text-blue-800 text-base">
                      {selectedProject.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {selectedProject.techStack.map((tech, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-white/70"
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* GitHub Submission */}
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <GitBranch className="w-6 h-6 mr-3 text-gray-700" />
                    Project Submission
                  </CardTitle>
                  <CardDescription className="text-base">
                    Submit your GitHub repository and commit details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="github-repo"
                        className="text-sm font-medium"
                      >
                        GitHub Repository URL
                      </Label>
                      <Input
                        id="github-repo"
                        placeholder="https://github.com/username/repo"
                        value={githubRepo}
                        onChange={(e) => setGithubRepo(e.target.value)}
                        disabled={submissionStatus === "submitted"}
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="commit-id"
                        className="text-sm font-medium"
                      >
                        Commit ID
                      </Label>
                      <Input
                        id="commit-id"
                        placeholder="e.g., a1b2c3d4e5f6..."
                        value={commitId}
                        onChange={(e) => setCommitId(e.target.value)}
                        disabled={submissionStatus === "submitted"}
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-700">
                        Status:
                      </span>
                      {getStatusBadge(submissionStatus)}
                    </div>

                    {submissionStatus === "pending" ? (
                      <Button
                        onClick={handleSubmission}
                        disabled={!githubRepo || !commitId}
                        className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Submit Checkpoint
                      </Button>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-blue-50"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Submission
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-emerald-50"
                        >
                          Update Submission
                        </Button>
                      </div>
                    )}
                  </div>

                  {submissionStatus === "submitted" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        <span className="font-semibold text-emerald-800">
                          Submission Successful!
                        </span>
                      </div>
                      <p className="text-sm text-emerald-700 mt-2">
                        Your project has been submitted for evaluation. You can
                        still update your submission before the deadline.
                      </p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </DefaultLayout>
  );
};

export default ParticipantDashboard;
