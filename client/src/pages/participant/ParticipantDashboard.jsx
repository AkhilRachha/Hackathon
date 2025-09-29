import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Trophy, Upload, Calendar, LogOut, Star, BarChart3, Clock, FileText, UserCheck } from 'lucide-react'; 

const ParticipantDashboard = () => {
    const [myTeam, setMyTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const fetchTeamData = async () => {
            try {
                const userId = localStorage.getItem('userId');
                const storedUserName = localStorage.getItem('userName');
                if (!userId || !storedUserName) {
                    throw new Error("User not found. Please log in again.");
                }
                setUserName(storedUserName);

                const response = await axios.get(`http://localhost:5000/api/my-team/${userId}`);
                setMyTeam(response.data);

            } catch (err) {
                if (err.response && err.response.status === 404) {
                    // This is the expected 404 error when a participant is not yet assigned a team
                    setError(err.response.data.message);
                } else {
                    setError("An error occurred while fetching your data.");
                }
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTeamData();
    }, []);

    const handleLogout = () => {
        // Clear user data from local storage
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        // Redirect to the login page
        window.location.href = '/login';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 text-xl font-semibold text-gray-700">
                Loading Your Dashboard...
            </div>
        );
    }

    // --- Participant not allocated team UI ---
    if (error && !myTeam) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center p-4 bg-gradient-to-br from-slate-50 to-indigo-100">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    transition={{ duration: 0.5, ease: "easeOut" }}
                >
                    <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm shadow-2xl p-8 rounded-2xl border-none">
                        <CardHeader>
                            <motion.div 
                                initial={{ scale: 0.8 }} 
                                animate={{ scale: [0.9, 1.1, 0.9] }} 
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                className="mx-auto w-fit p-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg"
                            >
                                <Clock className="h-12 w-12 text-white" />
                            </motion.div>

                            <motion.h1 
                                initial={{ y: -20, opacity: 0 }} 
                                animate={{ y: 0, opacity: 1 }} 
                                transition={{ delay: 0.2, duration: 0.5 }} 
                                className="mt-4 text-4xl font-bold bg-gradient-to-r from-blue-700 to-indigo-500 bg-clip-text text-transparent"
                            >
                                Welcome, {userName}!
                            </motion.h1>
                        </CardHeader>
                        <CardContent className="mt-4 space-y-4">
                            <p className="text-lg font-medium text-gray-800">{error}</p>
                            <p className="text-md text-gray-600">Your coordinator will assign you to a team soon. Check back later!</p>
                            
                            <div className="pt-4">
                                <Button onClick={handleLogout} variant="outline" size="lg" className="w-full flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700 shadow-lg">
                                    <LogOut className="w-5 h-5" />
                                    Logout
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }
    
    // --- Main Dashboard UI ---
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
            >
                {/* Header */}
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <div>
                        <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                            Participant Dashboard
                        </h1>
                        <p className="text-gray-600 mt-3 text-lg">Hello, {userName}!</p>
                    </div>
                    <Button onClick={handleLogout} variant="outline" className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700">
                        <LogOut className="mr-2 h-4 w-4"/> Logout
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div><p className="text-sm font-medium text-gray-600">Team Progress</p><p className="text-3xl font-bold text-blue-600">65%</p></div>
                                <BarChart3 className="w-8 h-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div><p className="text-sm font-medium text-gray-600">Deadline</p><p className="text-3xl font-bold text-emerald-600">10 Days</p></div>
                                <Calendar className="w-8 h-8 text-emerald-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                               <div> <p className="text-sm font-medium text-gray-600">Submission</p><p className="text-3xl font-bold text-amber-600">Pending</p></div>
                                <Upload className="w-8 h-8 text-amber-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                     {/* Team & Project Details */}
                    <Card className="lg:col-span-2 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                                <Users className="text-blue-600"/>
                                {myTeam?.team_name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <div>
                                <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2"><Trophy size={18} className="text-amber-500" />Your Project</h3>
                                <div className="p-4 bg-slate-100/50 rounded-lg border">
                                    <p className="text-lg font-medium text-gray-900">{myTeam?.q_id?.q_title}</p>
                                    <p className="text-sm text-gray-600 mt-1">{myTeam?.q_id?.q_description}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2"><Users size={18} className="text-blue-500" />Team Members</h3>
                                <div className="flex flex-wrap gap-2">
                                    {myTeam?.members.map(member => (
                                        <Badge key={member._id} variant="secondary" className="px-3 py-1 text-sm font-medium bg-gray-200 text-gray-800">
                                            {member.user_name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                             <div className="pt-4 border-t">
                                <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2"><UserCheck size={18} className="text-emerald-500" />Coordinator</h3>
                                <p className="text-sm font-medium text-gray-700">{myTeam?.coordinator?.user_name}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submission & Evaluation */}
                    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <FileText className="text-gray-600"/>
                                Submission & Evaluation
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="font-semibold text-gray-700 mb-2">GitHub Repository</h3>
                                <a href={myTeam?.user_github_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all text-sm">
                                    {myTeam?.user_github_url}
                                </a>
                                <Button size="sm" variant="outline" className="w-full mt-3">
                                    <Upload className="w-4 h-4 mr-2" /> Upload New Version
                                </Button>
                            </div>
                            <div className="border-t pt-4">
                                <h3 className="font-semibold text-gray-700 mb-2">Evaluation Score</h3>
                                {myTeam?.score ? (
                                    <div className="flex items-center space-x-2">
                                        <Star size={24} className="text-yellow-400 fill-yellow-400" />
                                        <p className="text-2xl font-bold text-gray-900">{myTeam.score}/10</p>
                                    </div>
                                ) : (
                                    <p className="text-sm italic text-gray-500">Not evaluated yet.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </motion.div>
        </div>
    );
};

export default ParticipantDashboard;

