import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import DefaultLayout from "@/components/DefaultLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Trophy } from "lucide-react";
import {
  getEvaluatorDashboardData,
  getEvaluatorStatus
} from "@/api/evaluationApi";

// Import components
import EvaluatorHeader from "./EvaluatorHeader";
import EvaluatorStats from "./EvaluatorStats";
import EvaluatorTeams from "./EvaluatorTeams";
import EvaluationForm from "./EvaluationForm";
import EvaluatorLists from "./EvaluatorLists";
import WinnerSelection from "./WinnerSelection";

import {
  NotStartedError,
  GeneralError,
  LoadingState,
  NoDataState
} from "./EvaluatorErrors";

const EvaluatorDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [teams, setTeams] = useState([]);
  const [myEvaluations, setMyEvaluations] = useState([]);
  const [allTeamScores, setAllTeamScores] = useState([]);
  const [allTeamsEvaluated, setAllTeamsEvaluated] = useState(false);

  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showListDialog, setShowListDialog] = useState({ open: false, type: "", data: [] });
  const [showWinnerSelection, setShowWinnerSelection] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  // Initial setup effect - runs only once
  useEffect(() => {
    // Check if user is logged in and has evaluator role
    const userRole = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');

    if (!userId) {
      window.location.href = "/login";
      return;
    }

    if (userRole !== 'evaluator') {
      toast({
        title: "Access Denied",
        description: "You must be logged in as an evaluator to access this page",
        variant: "destructive"
      });
      window.location.href = "/login";
      return;
    }

    // Initialize evaluator dashboard
    const initDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        // First check evaluator status
        const status = await getEvaluatorStatus();
        console.log("Evaluator status check:", status);

        if (!status.evaluator.current_hackathon) {
          setError({
            type: 'no_hackathon',
            message: `No hackathon assigned to your account (${status.evaluator.name}). Please contact an administrator to assign you to a hackathon.`
          });
          setLoading(false);
          return;
        }

        if (status.evaluator.hackathon_details) {
          const hackathonDetails = status.evaluator.hackathon_details;
          const now = new Date();
          const startTime = new Date(hackathonDetails.start_datetime);
          const endTime = new Date(hackathonDetails.end_datetime);

          // Check if hackathon should be accessible for evaluators
          const isActive = hackathonDetails.status === 'active';
          
          // Check if winners have actually been announced (not just empty object)
          const hasWinnersAnnounced = hackathonDetails.winnersAnnouncedAt || 
            (hackathonDetails.winners && 
             (hackathonDetails.winners.firstPlace || 
              hackathonDetails.winners.secondPlace || 
              hackathonDetails.winners.thirdPlace));
          
          const isEvaluationPhase = hackathonDetails.status === 'completed' && !hasWinnersAnnounced;
          const hasStarted = now >= startTime;
          
          // Allow access if:
          // 1. Hackathon is active
          // 2. Hackathon is completed but winners not announced (evaluation phase)
          // 3. Hackathon has started and not yet ended (during hackathon period)
          const canAccess = isActive || isEvaluationPhase || (hasStarted && now <= endTime);

          if (!canAccess) {
            if (now < startTime) {
              setError({
                type: 'not_started',
                hackathon: hackathonDetails,
                message: `The hackathon "${hackathonDetails.hackathon_name}" hasn't started yet.`
              });
            } else if (hackathonDetails.status === 'completed' && hasWinnersAnnounced) {
              setError({
                type: 'evaluation_complete',
                hackathon: hackathonDetails,
                message: `The hackathon "${hackathonDetails.hackathon_name}" has ended and winners have been announced. Evaluation is complete. Thank you for your evaluation work!`
              });
            } else {
              setError({
                type: 'inactive',
                hackathon: hackathonDetails,
                message: `Your assigned hackathon "${hackathonDetails.hackathon_name}" is not currently active. Status: ${hackathonDetails.status}`
              });
            }
            setLoading(false);
            return;
          }
        }

        // If status check passes, fetch dashboard data
        await fetchDashboardData();

      } catch (error) {
        console.error("Error initializing evaluator dashboard:", error);
        setError({
          type: 'error',
          message: "Failed to verify evaluator status. Please try logging in again."
        });
        setLoading(false);
      }
    };

    initDashboard();
  }, [toast]); // Only depend on toast

  // Periodic role check effect - check for role changes every 2 minutes (less frequent to avoid interference)
  useEffect(() => {
    const checkRoleStatus = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          const currentRole = localStorage.getItem('userRole');

          if (data.user.role_name !== currentRole) {
            // Role has changed, update localStorage and redirect
            localStorage.setItem('userRole', data.user.role_name);
            localStorage.setItem('userName', data.user.user_name);

            if (data.user.current_hackathon) {
              localStorage.setItem('currentHackathonId', data.user.current_hackathon);
            } else {
              localStorage.removeItem('currentHackathonId');
            }

            toast({
              title: "Role Updated",
              description: `Your role has been changed to ${data.user.role_name}. Redirecting...`,
              variant: "default"
            });

            // Redirect based on new role
            setTimeout(() => {
              if (data.user.role_name === 'participant') {
                window.location.href = '/participant';
              } else if (data.user.role_name === 'coordinator') {
                window.location.href = '/coordinator';
              } else if (data.user.role_name === 'admin') {
                window.location.href = '/admin';
              } else {
                window.location.href = '/login';
              }
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Error checking role status:', error);
      }
    };

    // Only start role checking after dashboard is loaded to avoid interference
    if (!loading && !error) {
      const interval = setInterval(checkRoleStatus, 120000); // Check every 2 minutes
      return () => clearInterval(interval);
    }
  }, [loading, error, toast]);

  // Cleanup effect for team release - separate from initialization
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (selectedTeam &&
        selectedTeam.evaluation_status === 'being_evaluated' &&
        selectedTeam.assigned_evaluator?._id === localStorage.getItem('userId') &&
        !myEvaluations.some(evaluation => evaluation.team_id._id === selectedTeam._id)) {
        // Use sendBeacon for reliable cleanup on page unload
        navigator.sendBeacon('/api/evaluations/release-team', JSON.stringify({ team_id: selectedTeam._id }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Also cleanup on component unmount
      handleBeforeUnload();
    };
  }, [selectedTeam, myEvaluations]);



  const fetchDashboardData = useCallback(async () => {
    try {
      console.log("Attempting to fetch evaluator dashboard data...");
      const data = await getEvaluatorDashboardData();
      console.log("Dashboard data received:", data);
      setDashboardData(data);
      setTeams(data.teams || []);
      setMyEvaluations(data.myEvaluations || []);
      setAllTeamScores(data.allTeamScores || []);
      setAllTeamsEvaluated(data.allTeamsEvaluated || false);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      console.error("Error details:", error.response);

      // Check if it's an authentication error
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast({
          title: "Authentication Error",
          description: "Please log in again as an evaluator",
          variant: "destructive"
        });
        localStorage.clear();
        window.location.href = "/login";
        return;
      }

      // Check if it's a "no hackathon assigned" error
      if (error.response?.status === 404 && error.response?.data?.message?.includes("hackathon")) {
        setError({
          type: 'no_hackathon',
          message: "No hackathon assigned to your account. Please contact an administrator to assign you to a hackathon."
        });
        setLoading(false);
        return;
      }

      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load dashboard data",
        variant: "destructive"
      });
      setLoading(false);
    }
  }, []); // Remove toast dependency to prevent infinite loops

  const handleShowList = (type) => {
    let data = [];
    switch (type) {
      case 'teams':
        data = dashboardData?.stats?.teamsList || [];
        break;
      case 'participants':
        data = dashboardData?.stats?.participantsList || [];
        break;
      case 'coordinators':
        data = dashboardData?.stats?.coordinatorsList || [];
        break;
      case 'evaluators':
        data = dashboardData?.stats?.evaluatorsList || [];
        break;
    }
    setShowListDialog({ open: true, type, data });
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const handleEvaluationSubmitted = useCallback(async () => {
    // Refresh dashboard data after evaluation is submitted
    await fetchDashboardData();
  }, [fetchDashboardData]);

  const handleWinnersAnnounced = useCallback(async () => {
    // Refresh dashboard data after winners are announced
    await fetchDashboardData();
    setShowWinnerSelection(false);
  }, [fetchDashboardData]);

  // Check if winners can be announced (all teams evaluated by at least one evaluator)
  const hasWinnersAnnounced = dashboardData?.hackathon?.winnersAnnouncedAt || 
    (dashboardData?.hackathon?.winners && 
     (dashboardData.hackathon.winners.firstPlace || 
      dashboardData.hackathon.winners.secondPlace || 
      dashboardData.hackathon.winners.thirdPlace));

  // Check if we have at least 3 teams with final submissions
  const teamsWithSubmissions = dashboardData?.stats?.teams_with_submissions || 0;
  
  const canAnnounceWinners = dashboardData &&
    allTeamsEvaluated &&
    !hasWinnersAnnounced &&
    teamsWithSubmissions >= 3; // Need at least 3 teams with final submissions for winners



  // Render different states
  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    if (error.type === 'not_started') {
      return <NotStartedError error={error} onLogout={handleLogout} />;
    }
    if (error.type === 'evaluation_complete') {
      return <GeneralError error={error} onLogout={handleLogout} />;
    }
    return <GeneralError error={error} onLogout={handleLogout} />;
  }

  if (!dashboardData) {
    return <NoDataState />;
  }

  const { hackathon, stats } = dashboardData;

  return (
    <DefaultLayout userRole="evaluator">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50/30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
        >
          {/* Header with Hackathon Info */}
          <EvaluatorHeader hackathon={hackathon} onLogout={handleLogout} />

          {/* Stats Cards */}
          <EvaluatorStats stats={stats} onShowList={handleShowList} />



          {/* Winner Selection Button */}
          {canAnnounceWinners && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
            >
              <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-800 flex items-center gap-2">
                        <Trophy className="w-5 h-5" />
                        All Teams Evaluated - Ready to Announce Winners!
                      </h3>
                      <p className="text-yellow-700 mt-1">
                        All {teamsWithSubmissions} teams with final submissions have been evaluated. You can now select and announce the winners.
                      </p>
                    </div>
                    <Button
                      onClick={() => setShowWinnerSelection(true)}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white"
                      size="lg"
                    >
                      <Trophy className="mr-2 h-4 w-4" />
                      Select Winners
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}



          {/* Team Submissions Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <EvaluatorTeams
              teams={teams}
              myEvaluations={myEvaluations}
              allTeamScores={allTeamScores}
              onTeamSelect={setSelectedTeam}
              onDataRefresh={fetchDashboardData}
            />
          </motion.div>

          {/* Evaluation Dialog */}
          <EvaluationForm
            selectedTeam={selectedTeam}
            setSelectedTeam={setSelectedTeam}
            myEvaluations={myEvaluations}
            onEvaluationSubmitted={handleEvaluationSubmitted}
          />

          {/* List Dialog */}
          <EvaluatorLists
            showListDialog={showListDialog}
            setShowListDialog={setShowListDialog}
          />

          {/* Winner Selection Dialog */}
          <WinnerSelection
            hackathon={hackathon}
            teams={teams}
            allTeamScores={allTeamScores}
            onWinnersAnnounced={handleWinnersAnnounced}
            open={showWinnerSelection}
            setOpen={setShowWinnerSelection}
          />
        </motion.div>
      </div>
    </DefaultLayout>
  );
};

export default EvaluatorDashboard;