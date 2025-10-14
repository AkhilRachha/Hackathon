import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Trophy,
  Medal,
  Award,
  Users,
  Calendar,
  MapPin,
  Github,
  ExternalLink,
  ArrowRight,
  LogOut,
  Sparkles,
  Crown,
  CheckCircle,
  Clock
} from "lucide-react";
import { leaveHackathon } from "@/api/hackathonApi";
import { format } from "date-fns";

const CompletedHackathon = ({ 
  hackathon, 
  team, 
  stats, 
  userName, 
  onLeaveHackathon, 
  onLogout 
}) => {
  const [leaving, setLeaving] = useState(false);
  const { toast } = useToast();

  const handleLeaveHackathon = async () => {
    setLeaving(true);
    try {
      await leaveHackathon();
      localStorage.removeItem('currentHackathonId');
      toast({
        title: "Left Hackathon Successfully",
        description: "You can now register for new hackathons!",
      });
      onLeaveHackathon();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to leave hackathon",
        variant: "destructive"
      });
    } finally {
      setLeaving(false);
    }
  };

  const getWinnerDisplay = () => {
    if (!hackathon.winners) return null;

    const { firstPlace, secondPlace, thirdPlace } = hackathon.winners;
    const isWinner = 
      team._id === firstPlace?._id || 
      team._id === secondPlace?._id || 
      team._id === thirdPlace?._id;

    if (isWinner) {
      let position = "";
      let icon = null;
      let colorClass = "";
      
      if (team._id === firstPlace?._id) {
        position = "1st Place Winner";
        icon = <Crown className="w-8 h-8 text-yellow-500" />;
        colorClass = "from-yellow-400 to-yellow-600";
      } else if (team._id === secondPlace?._id) {
        position = "2nd Place (Runner-up 1st)";
        icon = <Medal className="w-8 h-8 text-gray-400" />;
        colorClass = "from-gray-400 to-gray-600";
      } else if (team._id === thirdPlace?._id) {
        position = "3rd Place (Runner-up 2nd)";
        icon = <Award className="w-8 h-8 text-amber-600" />;
        colorClass = "from-amber-400 to-amber-600";
      }

      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Card className={`bg-gradient-to-r ${colorClass} text-white border-0 shadow-2xl`}>
            <CardContent className="p-8 text-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="mb-4"
              >
                {icon}
              </motion.div>
              <h2 className="text-3xl font-bold mb-2">🎉 Congratulations! 🎉</h2>
              <p className="text-xl font-semibold">{position}</p>
              <p className="text-lg opacity-90 mt-2">Team {team.team_name}</p>
            </CardContent>
          </Card>
        </motion.div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50/30 p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-purple-600 bg-clip-text text-transparent">
              {hackathon.hackathon_name}
            </h1>
            <p className="text-gray-600 mt-3 text-lg">Welcome back, {userName}!</p>
            <Badge className="mt-2 bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="w-4 h-4 mr-1" />
              Hackathon Completed
            </Badge>
          </div>
          <Button onClick={onLogout} variant="outline" className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>

        {/* Winner Display */}
        {getWinnerDisplay()}

        {/* Hackathon Summary */}
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              Hackathon Summary
            </CardTitle>
            <CardDescription>
              Your journey in this hackathon has concluded
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Hackathon Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Event Details</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-600">Started:</span>
                    <span className="font-medium">{format(new Date(hackathon.start_datetime), 'MMM d, yyyy h:mm a')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-gray-600">Ended:</span>
                    <span className="font-medium">{format(new Date(hackathon.end_datetime), 'MMM d, yyyy h:mm a')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600">Venue:</span>
                    <span className="font-medium">{hackathon.venue}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Your Team Performance</h3>
                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <p><strong>Team:</strong> {team.team_name}</p>
                  <p><strong>Project:</strong> {team.project?.title || "No project assigned"}</p>
                  <div>
                    <strong>Team Members:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {team.members?.map((member, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {member.user_name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {team.github_submission?.url && (
                    <div className="flex items-center gap-2 mt-2">
                      <Github className="w-4 h-4" />
                      <a 
                        href={team.github_submission.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        View Final Submission
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Winners Section */}
            {hackathon.winners && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Hackathon Winners
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {/* First Place */}
                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="p-4 text-center">
                      <Crown className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                      <p className="font-semibold text-yellow-800">1st Place</p>
                      <p className="text-sm">{hackathon.winners.firstPlace?.team_name || "TBD"}</p>
                    </CardContent>
                  </Card>

                  {/* Second Place */}
                  <Card className="border-gray-200 bg-gray-50">
                    <CardContent className="p-4 text-center">
                      <Medal className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                      <p className="font-semibold text-gray-800">2nd Place</p>
                      <p className="text-sm">{hackathon.winners.secondPlace?.team_name || "TBD"}</p>
                    </CardContent>
                  </Card>

                  {/* Third Place */}
                  <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="p-4 text-center">
                      <Award className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                      <p className="font-semibold text-amber-800">3rd Place</p>
                      <p className="text-sm">{hackathon.winners.thirdPlace?.team_name || "TBD"}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{stats?.total_participants || 0}</p>
                  <p className="text-sm text-gray-600">Participants</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Trophy className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{stats?.total_teams || 0}</p>
                  <p className="text-sm text-gray-600">Teams</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{stats?.total_coordinators || 0}</p>
                  <p className="text-sm text-gray-600">Coordinators</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">100%</p>
                  <p className="text-sm text-gray-600">Completed</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Action Card */}
        <Card className="shadow-lg border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready for Your Next Challenge?</h2>
            <p className="text-gray-600 mb-4">
              This hackathon has concluded. You can now register for new upcoming hackathons and continue your journey!
            </p>
            
            {/* Benefits of joining new hackathons */}
            <div className="grid md:grid-cols-3 gap-4 mb-6 text-sm">
              <div className="p-3 bg-white rounded-lg border">
                <Sparkles className="w-5 h-5 text-purple-500 mx-auto mb-2" />
                <p className="font-medium">New Challenges</p>
                <p className="text-gray-600">Explore different domains and technologies</p>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <Users className="w-5 h-5 text-blue-500 mx-auto mb-2" />
                <p className="font-medium">Meet New People</p>
                <p className="text-gray-600">Collaborate with different teams</p>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <Trophy className="w-5 h-5 text-yellow-500 mx-auto mb-2" />
                <p className="font-medium">Win More Prizes</p>
                <p className="text-gray-600">Multiple chances to be a winner</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleLeaveHackathon}
                disabled={leaving}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {leaving ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Leaving...
                  </>
                ) : (
                  <>
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Join New Hackathon
                  </>
                )}
              </Button>
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              Note: Leaving this hackathon will allow you to register for new events. Your participation record will be preserved.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default CompletedHackathon;