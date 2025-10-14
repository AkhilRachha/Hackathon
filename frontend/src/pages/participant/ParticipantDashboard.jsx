import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getMyDashboard, submitMidProject, submitProject } from "@/api/teamApi";
import { markHackathonAsCompleted, updateHackathonStatus } from "@/api/hackathonApi";
import { useToast } from "@/hooks/use-toast";
import CompletedHackathon from "./CompletedHackathon";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Users, FileText, Clock, LogOut, Github, Calendar, Trophy, ClipboardList, Send, Loader2, CheckCircle, UserCheck, ExternalLink, MapPin
} from "lucide-react";

// This is the "Waiting for Team" screen (unchanged)
const WaitingForTeam = ({ userName, error, onLogout }) => (
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
                        <Button onClick={onLogout} variant="outline" size="lg" className="w-full flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700 shadow-lg">
                            <LogOut className="w-5 h-5" /> Logout
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    </div>
);

// New waiting screen for participants in non-active hackathons
const WaitingForActivation = ({ userName, hackathon, onLogout }) => (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4 bg-gradient-to-br from-slate-50 to-blue-100">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: "easeOut" }}>
            <Card className="w-full max-w-2xl bg-white/90 backdrop-blur-sm shadow-2xl p-8 rounded-2xl border-none">
                <CardHeader>
                    <motion.div animate={{ scale: [0.9, 1.1, 0.9] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }} className="mx-auto w-fit p-6 rounded-full bg-gradient-to-r from-orange-500 to-yellow-600 shadow-lg">
                        <Calendar className="h-16 w-16 text-white" />
                    </motion.div>
                    <motion.h1 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }} className="mt-6 text-4xl font-bold bg-gradient-to-r from-orange-700 to-yellow-600 bg-clip-text text-transparent">
                        Welcome, {userName}!
                    </motion.h1>
                    <motion.h2 initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }} className="mt-2 text-2xl font-semibold text-gray-800">
                        {hackathon.hackathon_name}
                    </motion.h2>
                </CardHeader>
                <CardContent className="mt-6 space-y-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                        <h3 className="text-xl font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Event Not Started Yet
                        </h3>
                        <p className="text-lg text-yellow-700 mb-4">
                            You have successfully registered for this hackathon! The event will begin once the coordinator activates it.
                        </p>
                        <div className="space-y-3 text-sm text-yellow-600">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span><strong>Scheduled Start:</strong> {new Date(hackathon.start_datetime).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span><strong>Scheduled End:</strong> {new Date(hackathon.end_datetime).toLocaleString()}</span>
                            </div>
                            {hackathon.venue && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    <span><strong>Venue:</strong> {hackathon.venue}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            What's Next?
                        </h3>
                        <ul className="text-blue-700 space-y-2 text-left">
                            <li className="flex items-start gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                <span>Wait for the coordinator to activate the event</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                <span>You'll be assigned to a team once the event starts</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                <span>Check back periodically or wait for notifications</span>
                            </li>
                        </ul>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button 
                            onClick={() => window.location.reload()} 
                            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                        >
                            <Clock className="w-4 h-4 mr-2" />
                            Refresh Status
                        </Button>
                        <Button 
                            onClick={onLogout} 
                            variant="outline" 
                            className="flex-1 text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700 shadow-lg"
                        >
                            <LogOut className="w-4 h-4 mr-2" /> 
                            Logout
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    </div>
);

// Component for the Countdown Timer with callback when timer ends
const CountdownTimer = ({ endTime, onTimerEnd }) => {
    const calculateTimeLeft = () => {
        if (!endTime) return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
        const difference = +new Date(endTime) - +new Date();
        if (difference <= 0) {
            return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
        return {
            total: difference,
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
        };
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
    const [hasEnded, setHasEnded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            const newTimeLeft = calculateTimeLeft();
            setTimeLeft(newTimeLeft);

            // Check if timer has just ended
            if (newTimeLeft.total <= 0 && !hasEnded) {
                setHasEnded(true);
                if (onTimerEnd) {
                    onTimerEnd();
                }
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [timeLeft, hasEnded, onTimerEnd]);

    // Show "ENDED" message when timer reaches zero
    if (timeLeft.total <= 0) {
        return (
            <div className="flex justify-center items-center">
                <div className="text-center">
                    <span className="text-3xl md:text-5xl font-bold text-red-600">ENDED</span>
                    <p className="text-sm text-gray-500 mt-2">Hackathon has concluded</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-end gap-4 text-center">
            {Object.entries(timeLeft).map(([unit, value]) => {
                if (unit === 'total') return null;
                return (
                    <div key={unit} className="flex flex-col items-center">
                        <span className="text-3xl md:text-5xl font-bold text-indigo-600">{String(value).padStart(2, '0')}</span>
                        <span className="text-xs md:text-sm font-medium text-gray-500 uppercase">{unit}</span>
                    </div>
                );
            })}
        </div>
    );
};


const ParticipantDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [userName, setUserName] = useState("");
    const [midGithubUrl, setMidGithubUrl] = useState("");
    const [finalGithubUrl, setFinalGithubUrl] = useState("");
    const [isSubmitting, setIsSubmitting] = useState({ mid: false, final: false });
    const [hasFinalSubmitted, setHasFinalSubmitted] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const fetchTeamData = async () => {
            try {
                const storedUserName = localStorage.getItem("userName");
                if (!storedUserName) throw new Error("User not found. Please log in again.");
                setUserName(storedUserName);

                const data = await getMyDashboard();
                
                // Handle case where participant is waiting for team assignment
                if (data.waitingForTeamAssignment) {
                    setDashboardData(data);
                    return;
                }
                
                setDashboardData(data);

                // Check if hackathon should be marked as active
                const currentTime = new Date();
                if (data.hackathon &&
                    new Date(data.hackathon.start_datetime) <= currentTime &&
                    new Date(data.hackathon.end_datetime) > currentTime &&
                    data.hackathon.status === 'upcoming') {
                    try {
                        await updateHackathonStatus(data.hackathon._id, 'active');
                        console.log("Hackathon marked as active");
                        // Refresh data to get updated status
                        const updatedData = await getMyDashboard();
                        setDashboardData(updatedData);
                    } catch (error) {
                        console.error("Failed to update hackathon to active:", error);
                    }
                }

                // Check if hackathon should be marked as completed
                if (data.hackathon && new Date(data.hackathon.end_datetime) <= currentTime && data.hackathon.status !== 'completed') {
                    try {
                        await markHackathonAsCompleted(data.hackathon._id);
                        console.log("Hackathon marked as completed");
                        // Refresh data to get updated status
                        const updatedData = await getMyDashboard();
                        setDashboardData(updatedData);
                    } catch (error) {
                        console.error("Failed to update hackathon status:", error);
                    }
                }

                if (data.team?.mid_submission?.url) {
                    setMidGithubUrl(data.team.mid_submission.url);
                }
                if (data.team?.github_submission?.url) {
                    setFinalGithubUrl(data.team.github_submission.url);
                    setHasFinalSubmitted(true);
                }
            } catch (err) {
                setError(err.response?.data?.message || "An error occurred fetching your data.");
            } finally {
                setLoading(false);
            }
        };
        fetchTeamData();
    }, []);

    const handleMidProjectSubmit = async () => {
        if (!midGithubUrl) {
            toast({
                title: "Error",
                description: "Please enter a GitHub URL",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(prev => ({ ...prev, mid: true }));
        try {
            await submitMidProject({ githubUrl: midGithubUrl });
            toast({
                title: "Success! 🎉",
                description: "Mid-project submitted successfully!"
            });
            const data = await getMyDashboard();
            setDashboardData(data);
        } catch (err) {
            toast({
                title: "Submission Failed",
                description: err.response?.data?.message || "Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(prev => ({ ...prev, mid: false }));
        }
    };

    const handleFinalProjectSubmit = async () => {
        if (!finalGithubUrl) {
            toast({
                title: "Error",
                description: "Please enter a GitHub URL",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(prev => ({ ...prev, final: true }));
        try {
            await submitProject({ githubUrl: finalGithubUrl });
            toast({
                title: "Success! 🎉",
                description: "Final project submitted successfully!"
            });
            const data = await getMyDashboard();
            setDashboardData(data);
            setHasFinalSubmitted(true);
        } catch (err) {
            toast({
                title: "Submission Failed",
                description: err.response?.data?.message || "Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(prev => ({ ...prev, final: false }));
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/login";
    };

    const handleLeaveHackathon = () => {
        // Refresh the page to show registration screen
        window.location.reload();
    };

    const handleTimerEnd = async () => {
        try {
            // Mark hackathon as completed when timer ends
            if (dashboardData?.hackathon?._id) {
                await markHackathonAsCompleted(dashboardData.hackathon._id);
                console.log("Hackathon marked as completed");

                // Optionally refresh the dashboard data to reflect the status change
                const updatedData = await getMyDashboard();
                setDashboardData(updatedData);
            }
        } catch (error) {
            console.error("Failed to mark hackathon as completed:", error);
            // Don't show error to user as this is a background operation
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen text-xl font-semibold">Loading Your Dashboard...</div>;
    }

    if (error && !dashboardData) {
        return <WaitingForTeam userName={userName} error={error} onLogout={handleLogout} />;
    }

    if (!loading && dashboardData) {
        // Handle waiting for team assignment case
        if (dashboardData.waitingForTeamAssignment) {
            return <WaitingForActivation userName={userName} hackathon={dashboardData.hackathon} onLogout={handleLogout} />;
        }
        
        const { hackathon, stats, team } = dashboardData;
        
        // Show waiting screen if hackathon is not active yet (additional check)
        if (hackathon.status === 'upcoming') {
            return <WaitingForActivation userName={userName} hackathon={hackathon} onLogout={handleLogout} />;
        }
        const now = new Date();

        // Check if hackathon is active (started but not ended)
        const isHackathonActive = hackathon.status === 'active' ||
            (new Date(hackathon.start_datetime) <= now && new Date(hackathon.end_datetime) > now);

        const hasMidSubmitted = !!team.mid_submission?.url;
        const isMidDeadlinePassed = hackathon.mid_submission_datetime && new Date(hackathon.mid_submission_datetime) < now;

        const isFinalStage = hasMidSubmitted || isMidDeadlinePassed;
        const countdownTargetDate = isFinalStage ? hackathon.end_datetime : hackathon.mid_submission_datetime;
        const countdownTitle = isFinalStage ? "Final Submission Deadline" : "Mid-Submission Deadline";
        const isFinalDeadlinePassed = new Date(hackathon.end_datetime) < now;
        
        // Check if hackathon is completed (ended and has winners announced)
        const hasWinnersAnnounced = hackathon.winners && (
            hackathon.winners.firstPlace || 
            hackathon.winners.secondPlace || 
            hackathon.winners.thirdPlace
        );
        
        // Only show completed interface if hackathon has ended AND winners are announced
        const isHackathonCompleted = (hackathon.status === 'completed' || isFinalDeadlinePassed) && hasWinnersAnnounced;

        // Show completed hackathon interface if hackathon has ended and winners are announced
        if (isHackathonCompleted) {
            return (
                <CompletedHackathon
                    hackathon={hackathon}
                    team={team}
                    stats={stats}
                    userName={userName}
                    onLeaveHackathon={handleLeaveHackathon}
                    onLogout={handleLogout}
                />
            );
        }

        // Show "Wait for Results" if hackathon has ended but winners not announced yet
        if ((hackathon.status === 'completed' || isFinalDeadlinePassed) && !hasWinnersAnnounced) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 sm:p-6 lg:p-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="max-w-4xl mx-auto space-y-8"
                    >
                        {/* Header */}
                        <div className="flex flex-wrap justify-between items-center gap-4">
                            <div>
                                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                                    {hackathon.hackathon_name}
                                </h1>
                                <p className="text-gray-600 mt-3 text-lg">Welcome back, {userName}!</p>
                            </div>
                            <Button onClick={handleLogout} variant="outline" className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700">
                                <LogOut className="mr-2 h-4 w-4" /> Logout
                            </Button>
                        </div>

                        {/* Wait for Results Card */}
                        <Card className="shadow-2xl border-0 bg-gradient-to-br from-blue-50 to-indigo-100">
                            <CardContent className="p-12 text-center">
                                <motion.div
                                    animate={{ 
                                        scale: [1, 1.1, 1],
                                        rotate: [0, 5, -5, 0]
                                    }}
                                    transition={{ 
                                        repeat: Infinity, 
                                        duration: 3, 
                                        ease: "easeInOut" 
                                    }}
                                    className="mx-auto w-fit p-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg mb-6"
                                >
                                    <Clock className="h-16 w-16 text-white" />
                                </motion.div>
                                
                                <h2 className="text-4xl font-bold text-gray-800 mb-4">
                                    Hackathon Completed! 🎉
                                </h2>
                                
                                <p className="text-xl text-gray-600 mb-6">
                                    Thank you for participating in <strong>{hackathon.hackathon_name}</strong>
                                </p>
                                
                                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 mb-6">
                                    <h3 className="text-2xl font-semibold text-blue-800 mb-4">
                                        ⏳ Waiting for Results
                                    </h3>
                                    <p className="text-lg text-gray-700 mb-4">
                                        Our evaluators are currently reviewing all submissions. 
                                        Results will be announced soon!
                                    </p>
                                    <div className="flex items-center justify-center gap-2 text-blue-600">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                        >
                                            <Loader2 className="h-5 w-5" />
                                        </motion.div>
                                        <span className="font-medium">Evaluation in progress...</span>
                                    </div>
                                </div>

                                {/* Team Summary */}
                                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 mb-6">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Team Summary</h3>
                                    <div className="grid md:grid-cols-2 gap-4 text-left">
                                        <div>
                                            <p className="text-gray-600"><strong>Team:</strong> {team.team_name}</p>
                                            <p className="text-gray-600"><strong>Project:</strong> {team.project?.title || "No project assigned"}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600"><strong>Members:</strong></p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {team.members?.map((member, index) => (
                                                    <Badge key={index} variant="secondary" className="text-xs">
                                                        {member.user_name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    {team.github_submission?.url && (
                                        <div className="flex items-center justify-center gap-2 mt-4">
                                            <Github className="w-4 h-4" />
                                            <a 
                                                href={team.github_submission.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline flex items-center gap-1"
                                            >
                                                View Your Submission
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    )}
                                </div>

                                <p className="text-gray-500 text-sm">
                                    Please check back later or wait for an announcement. 
                                    You'll be able to see the results once they're published!
                                </p>
                            </CardContent>
                        </Card>

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
                                    <CheckCircle className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                                    <p className="text-2xl font-bold">Pending</p>
                                    <p className="text-sm text-gray-600">Results</p>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>
                </div>
            );
        }

        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 sm:p-6 lg:p-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="max-w-7xl mx-auto space-y-8">

                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">{hackathon.hackathon_name}</h1>
                            <p className="text-gray-600 mt-3 text-lg">Welcome back, {userName}!</p>
                        </div>
                        <Button onClick={handleLogout} variant="outline" className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700">
                            <LogOut className="mr-2 h-4 w-4" /> Logout
                        </Button>
                    </div>

                    {isHackathonActive && (
                        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-xl">
                            <CardContent className="p-6 text-center space-y-4">
                                <h2 className="text-2xl font-bold text-gray-800">{countdownTitle}</h2>
                                <CountdownTimer
                                    endTime={countdownTargetDate}
                                    onTimerEnd={isFinalStage ? handleTimerEnd : undefined}
                                />
                                <div className="flex justify-around flex-wrap text-sm text-gray-500 pt-4">
                                    {hackathon.mid_submission_datetime && <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-yellow-500" /> <strong>Mid-Review:</strong> {new Date(hackathon.mid_submission_datetime).toLocaleString()}</span>}
                                    <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-red-500" /> <strong>Final Deadline:</strong> {new Date(hackathon.end_datetime).toLocaleString()}</span>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {!isHackathonActive && (
                        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-xl border-yellow-500">
                            <CardContent className="p-6 text-center space-y-4">
                                <h2 className="text-2xl font-bold text-yellow-800">Hackathon Not Started Yet</h2>
                                <p className="text-lg text-gray-600">
                                    The hackathon will start on <strong>{new Date(hackathon.start_datetime).toLocaleString()}</strong>
                                </p>
                                <div className="flex justify-around flex-wrap text-sm text-gray-500 pt-4">
                                    <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-500" /> <strong>Start:</strong> {new Date(hackathon.start_datetime).toLocaleString()}</span>
                                    <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-red-500" /> <strong>End:</strong> {new Date(hackathon.end_datetime).toLocaleString()}</span>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Participants</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.total_participants || 0}</div></CardContent></Card>
                        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Projects</CardTitle><ClipboardList className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.total_projects || 0}</div></CardContent></Card>
                        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Teams</CardTitle><Trophy className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.total_teams || 0}</div></CardContent></Card>
                        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Coordinators</CardTitle><UserCheck className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.total_coordinators || 0}</div></CardContent></Card>
                    </div>

                    <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">{team.team_name}</CardTitle>
                            <CardDescription>Your project, team, and submission details.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-semibold text-lg flex items-center gap-2 mb-2"><FileText className="w-5 h-5 text-blue-600" />Project Details</h3>
                                    <div className="p-4 border rounded-lg bg-gray-50 space-y-2">
                                        <p><strong className="text-gray-600">Domain:</strong> {team.project?.domain || "N/A"}</p>
                                        <p><strong className="text-gray-600">Title:</strong> {team.project?.title || "Not assigned"}</p>
                                        <p><strong className="text-gray-600">Description:</strong> {team.project?.description || "No description."}</p>
                                        <p><strong className="text-gray-600">Criteria:</strong> {team.project?.criteria || "No criteria."}</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg flex items-center gap-2"><Users className="w-5 h-5 text-green-600" />Team Members</h3>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {(team.members || []).map(member => (
                                            <Badge key={member._id} className="text-sm bg-green-100 text-green-800 px-3 py-1">{member.user_name}</Badge>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg flex items-center gap-2"><UserCheck className="w-5 h-5 text-purple-600" />Your Coordinator</h3>
                                    <p className="text-gray-700 mt-1">{team.coordinator?.user_name || "Unavailable"}</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className={`p-6 border rounded-lg ${hasMidSubmitted ? 'bg-green-50' : 'bg-yellow-50'}`}>
                                    <h3 className="font-semibold text-xl flex items-center gap-2 mb-4"><Github className="w-6 h-6" />Mid-Hackathon Submission</h3>
                                    {hasMidSubmitted ? (
                                        <div className="text-center py-4">
                                            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                                            <p className="font-semibold text-lg text-green-800">Submitted!</p>
                                            <a href={team.mid_submission.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">View Submission</a>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <Label htmlFor="mid-github-url">GitHub Repository URL</Label>
                                            <Input
                                                id="mid-github-url"
                                                type="url"
                                                placeholder="https://github.com/your-repo"
                                                value={midGithubUrl}
                                                onChange={(e) => setMidGithubUrl(e.target.value)}
                                                disabled={!isHackathonActive || isMidDeadlinePassed || isSubmitting.mid}
                                            />
                                            <Button
                                                onClick={handleMidProjectSubmit}
                                                disabled={!isHackathonActive || isMidDeadlinePassed || isSubmitting.mid}
                                                className="w-full"
                                            >
                                                {isSubmitting.mid ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                                {!isHackathonActive ? "Hackathon Not Started" :
                                                    isMidDeadlinePassed ? "Deadline Passed" : "Submit for Mid-Review"}
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <div className={`p-6 border rounded-lg ${isFinalStage ? 'bg-blue-50' : 'bg-gray-100'}`}>
                                    <h3 className="font-semibold text-xl flex items-center gap-2 mb-4"><Trophy className="w-6 h-6" />Final Project Submission</h3>
                                    {!isFinalStage ? (
                                        <p className="text-center text-gray-500 italic">
                                            {!isHackathonActive ? "Hackathon not started yet." : "Complete mid-submission first."}
                                        </p>
                                    ) : (
                                        <div className="space-y-4">
                                            <Label htmlFor="final-github-url">GitHub Repository URL</Label>
                                            <Input
                                                id="final-github-url"
                                                type="url"
                                                placeholder="https://github.com/your-repo/final"
                                                value={finalGithubUrl}
                                                onChange={(e) => setFinalGithubUrl(e.target.value)}
                                                disabled={!isHackathonActive || isFinalDeadlinePassed || isSubmitting.final}
                                            />
                                            {hasFinalSubmitted ? (
                                                <div className="text-center py-4">
                                                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                                                    <p className="text-green-700 font-semibold">Final Project Submitted Successfully!</p>
                                                    <p className="text-sm text-gray-600 mt-1">Repository: {finalGithubUrl}</p>
                                                </div>
                                            ) : (
                                                <Button
                                                    onClick={handleFinalProjectSubmit}
                                                    disabled={!isHackathonActive || isFinalDeadlinePassed || isSubmitting.final}
                                                    className="w-full"
                                                >
                                                    {isSubmitting.final ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                                    {!isHackathonActive ? "Hackathon Not Started" :
                                                        isFinalDeadlinePassed ? "Final Deadline Passed" : "Submit Final Project"}
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return <div className="flex items-center justify-center min-h-screen">An unexpected error occurred. Please try logging in again.</div>;
};

export default ParticipantDashboard;