import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getMyTeam } from "@/api/teamApi"; // Use the correct API function
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Trophy, Upload, Calendar, LogOut, Star, BarChart3, Clock, FileText, UserCheck } from "lucide-react";

const ParticipantDashboard = () => {
  const [myTeam, setMyTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const storedUserName = localStorage.getItem("userName");
        if (!userId || !storedUserName) {
          throw new Error("User not found. Please log in again.");
        }
        setUserName(storedUserName);

        const teamData = await getMyTeam(userId);
        setMyTeam(teamData);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setError(err.response.data.message);
        } else {
          setError("An error occurred while fetching your team data.");
        }
        console.error("Error fetching team data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading Your Dashboard...</div>;
  }

  // WAITING PAGE (no team allocated)
  if (error && !myTeam) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4 bg-gradient-to-br from-slate-50 to-indigo-100">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: "easeOut" }}>
          <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm shadow-2xl p-8 rounded-2xl border-none">
            <CardHeader>
              <motion.div animate={{ scale: [0.9, 1.1, 0.9] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} className="mx-auto w-fit p-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg">
                <Clock className="h-12 w-12 text-white" />
              </motion.div>
              <motion.h1 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }} className="mt-4 text-4xl font-bold bg-gradient-to-r from-blue-700 to-indigo-500 bg-clip-text text-transparent">
                Welcome, {userName}!
              </motion.h1>
            </CardHeader>
            <CardContent className="mt-4 space-y-4">
              <p className="text-lg font-medium text-gray-800">{error}</p>
              <p className="text-md text-gray-600">Your coordinator will assign you to a team soon. Check back later!</p>
              <div className="pt-4">
                <Button onClick={handleLogout} variant="outline" size="lg" className="w-full flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700 shadow-lg">
                  <LogOut className="w-5 h-5" /> Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }
  
  // MAIN DASHBOARD (team is allocated)
  if (!loading && myTeam) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">Participant Dashboard</h1>
                    <p className="text-gray-600 mt-3 text-lg">Hello, {userName}!</p>
                </div>
                <Button onClick={handleLogout} variant="outline" className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
            </div>
            {/* Your full dashboard UI with stats and cards goes here... */}
        </motion.div>
        </div>
    );
  }
  
  return <div className="flex items-center justify-center min-h-screen">An unexpected error occurred. Please try logging in again.</div>;
};

export default ParticipantDashboard;