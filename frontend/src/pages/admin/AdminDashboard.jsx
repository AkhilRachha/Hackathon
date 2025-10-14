import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Trophy, ClipboardList, CheckCircle, Clock, AlertCircle, Loader2, UserCheck, Trash2, Settings, ListPlus, UserCog } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DefaultLayout from '@/components/DefaultLayout';
import { useToast } from '@/hooks/use-toast';
import { getAllUsers, deleteUser } from '@/api/userApi';
import { getAllHackathonsForAdmin } from '@/api/hackathonApi';
import { getAllTeams, deleteTeam } from '@/api/teamApi';
import { getAllQuestions } from '@/api/questionApi';

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

const ParticipantsTable = ({ participants, onSuspendParticipant }) => (
    <Table>
        <TableHeader><TableRow><TableHead>User Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
        <TableBody>
            {(participants && participants.length > 0) ? (
                participants.map((participant) => (
                    <TableRow key={participant._id}>
                        <TableCell className="font-medium">{participant.user_name || 'N/A'}</TableCell>
                        <TableCell>{participant.user_email || 'No Email'}</TableCell>
                        <TableCell><Badge variant="secondary" className="capitalize">{participant.role_name || 'User'}</Badge></TableCell>
                        <TableCell>
                            <Button onClick={() => onSuspendParticipant(participant._id, participant.user_name)} variant="destructive" size="sm" title="Suspend and delete user data">
                                <Trash2 className="w-3 h-3 mr-1" /> Suspend
                            </Button>
                        </TableCell>
                    </TableRow>
                ))
            ) : (
                <TableRow><TableCell colSpan={4} className="text-center text-gray-500 py-6">No participants found.</TableCell></TableRow>
            )}
        </TableBody>
    </Table>
);

const TeamTable = ({ teamList = [], onSuspendTeam }) => (
    <Table>
        <TableHeader><TableRow><TableHead>Team Name</TableHead><TableHead>Members</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
        <TableBody>
            {(teamList && teamList.length > 0) ? teamList.map((team) => (
                <TableRow key={team._id}>
                    <TableCell className="font-medium">{team.team_name || 'Untitled Team'}</TableCell>
                    <TableCell><span className="font-semibold">{team.members ? team.members.length : 0}</span></TableCell>
                    <TableCell>{getStatusBadge(team.status || 'Pending')}</TableCell>
                    <TableCell>
                        <Button onClick={() => onSuspendTeam(team._id, team.team_name)} variant="destructive" size="sm" title="Suspend and delete team data">
                            <Trash2 className="w-3 h-3 mr-1" /> Suspend
                        </Button>
                    </TableCell>
                </TableRow>
            )) : (
                <TableRow><TableCell colSpan={4} className="text-center text-gray-500 py-6">No teams found.</TableCell></TableRow>
            )}
        </TableBody>
    </Table>
);

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalEvents: 0, totalTeams: 0, participants: 0, activeProjects: 0 });
    const [allTeams, setAllTeams] = useState([]);
    const [allParticipants, setAllParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const handleSuspendTeam = async (teamId, teamName) => {
        try {
            await deleteTeam(teamId);
            setAllTeams(prev => prev.filter(team => team._id !== teamId));
            setStats(prev => ({ ...prev, totalTeams: prev.totalTeams - 1 }));
            toast({ title: "Team Suspended", description: `Team "${teamName}" has been removed.`, variant: "destructive" });
        } catch (error) {
            toast({ title: "Suspension Failed", description: `Could not delete team "${teamName}".`, variant: "destructive" });
        }
    };

    const handleSuspendParticipant = async (userId, userName) => {
        try {
            await deleteUser(userId);
            setAllParticipants(prev => prev.filter(p => p._id !== userId));
            setStats(prev => ({ ...prev, participants: prev.participants - 1 }));
            toast({ title: "Participant Suspended", description: `User "${userName}" has been removed.`, variant: "destructive" });
        } catch (error) {
            toast({ title: "Suspension Failed", description: `Could not delete user "${userName}".`, variant: "destructive" });
        }
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [hackathonsData, usersData, questionsData, teamsData] = await Promise.all([
                    getAllHackathonsForAdmin(),
                    getAllUsers(),
                    getAllQuestions(),
                    getAllTeams()
                ]);

                // --- FIXED: Safely handle potentially undefined API responses ---
                setAllParticipants(usersData || []);
                setAllTeams(teamsData || []);
                
                setStats({
                    totalEvents: (hackathonsData || []).length,
                    totalTeams: (teamsData || []).length,
                    participants: (usersData || []).length,
                    activeProjects: (questionsData || []).length
                });

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                toast({ title: "Data Fetch Failed", description: "Could not connect to the server.", variant: "destructive" });
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
                <motion.div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                    <motion.div className="text-center lg:text-left">
                        <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">Admin Dashboard</h1>
                        <p className="text-gray-600 mt-3 text-lg">Centralized oversight for all hackathon resources</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium">Total Teams</p><p className="text-3xl font-bold">{stats.totalTeams}</p></div><Users className="w-8 h-8 text-emerald-500"/></div></CardContent></Card>
                        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium">Participants</p><p className="text-3xl font-bold">{stats.participants}</p></div><UserCheck className="w-8 h-8 text-indigo-500"/></div></CardContent></Card>
                        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium">Total Events</p><p className="text-3xl font-bold">{stats.totalEvents}</p></div><Trophy className="w-8 h-8 text-blue-500"/></div></CardContent></Card>
                        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium">Project Titles</p><p className="text-3xl font-bold">{stats.activeProjects}</p></div><ClipboardList className="w-8 h-8 text-purple-500"/></div></CardContent></Card>
                    </div>
                    
                    <motion.div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center"><Settings className="w-6 h-6 mr-2" /> Configuration</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* --- FIXED: Added navigation to buttons --- */}
                            <Card><CardHeader><CardTitle>Hackathons</CardTitle></CardHeader><CardContent><Button onClick={() => navigate('/admin/view-hackathon')} className="w-full"><Users className="w-4 h-4 mr-2" /> View/Create Events</Button></CardContent></Card>
                            <Card><CardHeader><CardTitle>Project Titles</CardTitle></CardHeader><CardContent><Button onClick={() => navigate('/admin/titles')} className="w-full"><ListPlus className="w-4 h-4 mr-2" /> Manage Titles</Button></CardContent></Card>
                            <Card><CardHeader><CardTitle>Role Mapping</CardTitle></CardHeader><CardContent><Button onClick={() => navigate('/admin/view-hackathon')} className="w-full"><UserCog className="w-4 h-4 mr-2" /> Map Staff Roles</Button></CardContent></Card>
                        </div>
                    </motion.div>

                    <motion.div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 mt-8 flex items-center"><Trash2 className="w-6 h-6 mr-2 text-red-600" /> Data Management</h2>
                        <Card>
                            <CardHeader><CardDescription>View detailed data and use the Suspend option to permanently delete records.</CardDescription></CardHeader>
                            <CardContent>
                                <Tabs defaultValue="teams" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="teams">All Teams ({stats.totalTeams})</TabsTrigger>
                                        <TabsTrigger value="participants">All Participants ({stats.participants})</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="teams" className="mt-6"><TeamTable teamList={allTeams} onSuspendTeam={handleSuspendTeam} /></TabsContent>
                                    <TabsContent value="participants" className="mt-6"><ParticipantsTable participants={allParticipants} onSuspendParticipant={handleSuspendParticipant} /></TabsContent>
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