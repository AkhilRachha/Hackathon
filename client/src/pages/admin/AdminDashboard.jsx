import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Trophy, Plus, ClipboardList, CheckCircle, Clock, AlertCircle, Loader2, UserCheck, Trash2, Settings, ListPlus, UserCog } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import DefaultLayout from '@/components/DefaultLayout';
import { useToast } from '@/hooks/use-toast';
import { getAllUsers } from '@/api/userApi';
import { getAllHackathons } from '@/api/hackathonApi';
import { getAllTeams } from '@/api/teamApi';
import api from '@/api/axiosInstance';

// Utility function to determine status badge appearance
const getStatusBadge = (status) => {
    const statusConfig = {
        'Active': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
        'Pending': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
        'Inactive': { color: 'bg-red-100 text-red-800', icon: AlertCircle },
        'Completed': { color: 'bg-blue-100 text-blue-800', icon: Trophy }
    };
    const config = statusConfig[status] || statusConfig['Pending'];
    const Icon = config.icon;
    return (
        <Badge className={`${config.color} flex items-center gap-1.5 py-1 px-2 text-xs`}>
            <Icon className="w-3 h-3" />
            {status}
        </Badge>
    );
};

// Component to render the list of all participants
const ParticipantsTable = ({ participants, onSuspendParticipant }) => (
    <Table>
        <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead>User Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Action</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {(participants && participants.length > 0) ? (
                participants.map((participant) => (
                    <TableRow key={participant._id}>
                        <TableCell className="font-medium">{participant.user_name || 'N/A'}</TableCell>
                        <TableCell>{participant.user_email || 'No Email'}</TableCell>
                        <TableCell><Badge variant="secondary" className="capitalize">{participant.role_name || 'User'}</Badge></TableCell>
                        <TableCell>
                            <Button
                                onClick={() => onSuspendParticipant(participant._id, participant.user_name)}
                                variant="destructive"
                                size="sm"
                                title="Suspend and delete all user data from MongoDB"
                            >
                                <Trash2 className="w-3 h-3 mr-1" /> Suspend
                            </Button>
                        </TableCell>
                    </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500 py-6">
                        No participants found in MongoDB.
                    </TableCell>
                </TableRow>
            )}
        </TableBody>
    </Table>
);

// Component to render the list of all teams
const TeamTable = ({ teamList = [], onSuspendTeam }) => (
    <Table>
        <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead>Team Name</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {(teamList && teamList.length > 0) ? teamList.map((team) => (
                <TableRow key={team._id}>
                    <TableCell className="font-medium">{team.team_name || 'Untitled Team'}</TableCell>
                    <TableCell>
                        <span className="font-semibold text-gray-800">
                            {team.members ? team.members.length : 0}
                        </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(team.status || 'Pending')}</TableCell>
                    <TableCell>
                        <Button
                            onClick={() => onSuspendTeam(team._id, team.team_name)}
                            variant="destructive"
                            size="sm"
                            title="Suspend and delete all team data from MongoDB"
                        >
                            <Trash2 className="w-3 h-3 mr-1" /> Suspend
                        </Button>
                    </TableCell>
                </TableRow>
            )) : (
                <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500 py-6">
                        No teams found in MongoDB.
                    </TableCell>
                </TableRow>
            )}
        </TableBody>
    </Table>
);

const AdminDashboard = () => {
    // State for aggregated statistics
    const [stats, setStats] = useState({
        totalEvents: 0,
        totalTeams: 0,
        participants: 0,
        activeProjects: 0,
    });
    
    // State for detailed data lists
    const [projects, setProjects] = useState([]);
    const [allTeams, setAllTeams] = useState([]);
    const [allParticipants, setAllParticipants] = useState([]);
    const [hackathons, setHackathons] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    // --- SUSPENSION HANDLERS ---
    const handleSuspendTeam = async (teamId, teamName) => {
        try {
            await api.delete(`/api/teams/${teamId}`);
            
            setAllTeams(prevTeams => prevTeams.filter(team => team._id !== teamId));
            setStats(prev => ({ ...prev, totalTeams: prev.totalTeams - 1 }));
            
            toast({
                title: "Team Suspended",
                description: `Team "${teamName}" has been permanently removed.`,
                variant: "destructive"
            });
        } catch (error) {
            console.error("Error suspending team:", error);
            toast({
                title: "Suspension Failed",
                description: `Could not delete team "${teamName}". Check backend connection.`,
                variant: "destructive"
            });
        }
    };

    const handleSuspendParticipant = async (userId, userName) => {
        try {
            await api.delete(`/api/users/${userId}`);

            setAllParticipants(prevParticipants => prevParticipants.filter(p => p._id !== userId));
            setStats(prev => ({ ...prev, participants: prev.participants - 1 }));
            
            toast({
                title: "Participant Suspended",
                description: `Participant "${userName}" has been permanently removed.`,
                variant: "destructive"
            });
        } catch (error) {
            console.error("Error suspending participant:", error);
            toast({
                title: "Suspension Failed",
                description: `Could not delete participant "${userName}". Check backend connection.`,
                variant: "destructive"
            });
        }
    };

    // --- DATA FETCHING ---
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch data from real endpoints
                const [hackathonsRes, usersRes, questionsRes, teamsRes] = await Promise.all([
                    getAllHackathons(),
                    getAllUsers(),
                    api.get('/api/hackathons/domains-and-questions'),
                    getAllTeams()
                ]);

                const hackathonData = hackathonsRes.data;
                const userData = usersRes.data;
                const projectData = questionsRes.data;
                const teamsData = teamsRes.data;

                setHackathons(hackathonData);
                setAllParticipants(userData);
                setAllTeams(teamsData);
                setProjects(projectData);
                
                setStats({
                    totalEvents: hackathonData.length,
                    totalTeams: teamsData.length,
                    participants: userData.length,
                    activeProjects: projectData.length
                });

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                toast({ 
                    title: "Database Connection Failed", 
                    description: "Could not connect to the server. Displaying empty data.",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [toast]);

    if (loading) {
        return (
            <DefaultLayout userRole="admin">
                <div className="flex justify-center items-center min-h-[80vh]">
                    <Loader2 className="mr-2 h-6 w-6 animate-spin text-blue-600" />
                    <p className="text-xl text-gray-600">Loading Admin Dashboard...</p>
                </div>
            </DefaultLayout>
        );
    }

    return (
        <DefaultLayout userRole="admin">
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
                            Admin Dashboard
                        </h1>
                        <p className="text-gray-600 mt-3 text-lg">Centralized oversight for all hackathon resources</p>
                    </motion.div>

                    {/* Stats Overview */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="grid grid-cols-1 md:grid-cols-4 gap-6" 
                    >
                        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Teams</p>
                                        <p className="text-3xl font-bold text-emerald-600">{stats.totalTeams}</p>
                                    </div>
                                    <Users className="w-8 h-8 text-emerald-500" />
                                </div>
                                <p className="text-sm text-emerald-600 mt-2">Active and registered teams</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Participants</p>
                                        <p className="text-3xl font-bold text-indigo-600">{stats.participants}</p>
                                    </div>
                                    <UserCheck className="w-8 h-8 text-indigo-500" />
                                </div>
                                <p className="text-sm text-indigo-600 mt-2">Total users across all roles</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Events</p>
                                        <p className="text-3xl font-bold text-blue-600">{stats.totalEvents}</p>
                                    </div>
                                    <Trophy className="w-8 h-8 text-blue-500" />
                                </div>
                                <p className="text-sm text-blue-600 mt-2">All past and current events</p>
                            </CardContent>
                        </Card>
                        
                        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Active Projects</p>
                                        <p className="text-3xl font-bold text-purple-600">{stats.activeProjects}</p>
                                    </div>
                                    <ClipboardList className="w-8 h-8 text-purple-500" />
                                </div>
                                <p className="text-sm text-purple-600 mt-2">Available challenges</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                    
                    {/* Management Configuration Cards */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                            <Settings className="w-6 h-6 mr-2 text-blue-600" /> Configuration Settings
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            
                            <Card className="bg-white border-gray-200 shadow-md">
                                <CardHeader className="pb-4">
                                    <CardTitle>Teams</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-gray-700 text-lg font-semibold">{stats.totalTeams} Teams Registered</p>
                                    <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                                        <Users className="w-4 h-4 mr-2" /> View/Create Teams
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="bg-white border-gray-200 shadow-md">
                                <CardHeader className="pb-4">
                                    <CardTitle>Project Titles</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-gray-700 text-lg font-semibold">{stats.activeProjects} Titles Available</p>
                                    <Button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white">
                                        <ListPlus className="w-4 h-4 mr-2" /> Manage Titles and Criteria
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="bg-white border-gray-200 shadow-md">
                                <CardHeader className="pb-4">
                                    <CardTitle>Role Mapping</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-gray-700 text-lg font-semibold">Assign roles for coordinators, judges, etc.</p>
                                    <Button className="w-full bg-black hover:bg-gray-800 text-white">
                                        <UserCog className="w-4 h-4 mr-2" /> Map Coordinators & Evaluators
                                    </Button>
                                </CardContent>
                            </Card>

                        </div>
                    </motion.div>

                    {/* Detailed Team & User Management Tabs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 mt-8 flex items-center">
                            <Trash2 className="w-6 h-6 mr-2 text-red-600" /> Data Management & Details
                        </h2>
                        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                            <CardHeader>
                                <CardDescription>View detailed data from MongoDB and use the Suspend option to permanently delete records.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="teams" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2 bg-slate-200/60">
                                        <TabsTrigger value="teams">All Teams ({stats.totalTeams})</TabsTrigger>
                                        <TabsTrigger value="participants">All Participants ({stats.participants})</TabsTrigger>
                                    </TabsList>
                                    
                                    <TabsContent value="teams" className="mt-6">
                                        <div className="bg-white rounded-lg border border-gray-200/80 overflow-x-auto">
                                            <TeamTable teamList={allTeams} onSuspendTeam={handleSuspendTeam} />
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="participants" className="mt-6">
                                        <div className="bg-white rounded-lg border border-gray-200/80 overflow-x-auto">
                                            <ParticipantsTable participants={allParticipants} onSuspendParticipant={handleSuspendParticipant} />
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            </div>
        </DefaultLayout>
    );
};

export default AdminDashboard;