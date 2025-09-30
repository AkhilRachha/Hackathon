import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, ClipboardList, CheckCircle, Clock, AlertCircle, PlusCircle, Link as LinkIcon, LogOut, UserCheck } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react'; // <-- ADDED: Import useState and useEffect

/**
 * A redesigned dashboard component to match the admin theme.
 * It receives all data and navigation functions as props.
 * @param {object} props
 * @param {Array} props.myTeams - List of teams managed by the current coordinator.
 * @param {Array} props.allTeams - List of all teams in the system.
 * @param {Function} props.onNavigateToRegister - Function to switch to the registration view.
 */
const CoordinatorDashboard = ({ myTeams = [], allTeams = [], onNavigateToRegister }) => {
    const navigate = useNavigate();

    // --- ADDED: State to manage the available participants and loading status ---
    const [availableParticipants, setAvailableParticipants] = useState([]);
    const [loadingParticipants, setLoadingParticipants] = useState(true);
    const [error, setError] = useState(null);

    // --- ADDED: useEffect hook to fetch data on component mount ---
    useEffect(() => {
        const fetchAvailableParticipants = async () => {
            try {
                // Get the token from local storage (if your API requires it)
                const token = localStorage.getItem('token'); 

                const response = await fetch('http://localhost:5000/api/users/participants/available', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` // Pass the token in the header
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch available participants.');
                }
                
                const data = await response.json();
                setAvailableParticipants(data);
            } catch (err) {
                console.error("Error fetching participants:", err);
                setError(err.message);
            } finally {
                setLoadingParticipants(false);
            }
        };

        fetchAvailableParticipants();
    }, []); // Empty dependency array ensures this runs only once on mount

    const handleLogout = () => {
        localStorage.clear(); 
        navigate("/login"); 
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'Active': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
            'Pending': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
            'Inactive': { color: 'bg-red-100 text-red-800', icon: AlertCircle }
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

    // --- NEW: A reusable table component for participants ---
    const ParticipantsTable = ({ participants }) => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>User Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {participants.length > 0 ? (
                    participants.map((participant) => (
                        <TableRow key={participant._id}>
                            <TableCell className="font-medium">{participant.user_name}</TableCell>
                            <TableCell>{participant.user_email}</TableCell>
                            <TableCell><Badge variant="secondary" className="capitalize">{participant.role_name}</Badge></TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center text-gray-500">
                            No available participants at the moment.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );

    const TeamTable = ({ teamList = [] }) => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Team Name</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>GitHub</TableHead>
                    <TableHead>Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {teamList.map((team) => (
                    <TableRow key={team.id}>
                        <TableCell className="font-medium">{team.name}</TableCell>
                        <TableCell>
                            <div className="flex flex-wrap gap-1">
                                {team.members.slice(0, 2).map((member, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">{member}</Badge>
                                ))}
                                {team.members.length > 2 && (
                                    <Badge variant="outline" className="text-xs">+{team.members.length - 2} more</Badge>
                                )}
                            </div>
                        </TableCell>
                        <TableCell>
                            {team.project ? <Badge variant="secondary">{team.project}</Badge> : <span className="text-gray-500 italic">Not assigned</span>}
                        </TableCell>
                        <TableCell>
                            {team.github ? <a href={team.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1"><LinkIcon size={14}/> Link</a> : <span className="text-gray-500 italic">No repo</span>}
                        </TableCell>
                        <TableCell>{getStatusBadge(team.status)}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );

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
                            Coordinator Dashboard
                        </h1>
                        <p className="text-gray-600 mt-3 text-lg">Manage teams and assign projects</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button onClick={onNavigateToRegister} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-shadow">
                            <PlusCircle className="mr-2 h-4 w-4"/> Register New Team
                        </Button>
                        <Button onClick={handleLogout} variant="outline" className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700">
                            <LogOut className="mr-2 h-4 w-4"/> Logout
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6"> {/* Changed grid to 4 columns */}
                    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div><p className="text-sm font-medium text-gray-600">My Teams</p><p className="text-3xl font-bold text-blue-600">{myTeams.length}</p></div>
                                <Users className="w-8 h-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div><p className="text-sm font-medium text-gray-600">Projects Assigned</p><p className="text-3xl font-bold text-emerald-600">{myTeams.filter(team => team.project).length}</p></div>
                                <ClipboardList className="w-8 h-8 text-emerald-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div> <p className="text-sm font-medium text-gray-600">Pending Assignments</p><p className="text-3xl font-bold text-amber-600">{myTeams.filter(team => !team.project).length}</p></div>
                                <Clock className="w-8 h-8 text-amber-500" />
                            </div>
                        </CardContent>
                    </Card>
                    {/* --- ADDED: Card for Available Participants --- */}
                    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Available Participants</p>
                                    <p className="text-3xl font-bold text-indigo-600">{availableParticipants.length}</p>
                                </div>
                                <UserCheck className="w-8 h-8 text-indigo-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Team Management Table */}
                <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-xl">Team & Participant Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="my-teams" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 bg-slate-200/60"> {/* Adjusted to 3 columns */}
                                <TabsTrigger value="my-teams">My Teams</TabsTrigger>
                                <TabsTrigger value="all-teams">All Teams</TabsTrigger>
                                <TabsTrigger value="available-participants">Available Participants</TabsTrigger> {/* ADDED: New tab trigger */}
                            </TabsList>
                            <TabsContent value="my-teams" className="mt-6">
                                <div className="bg-white rounded-lg border border-gray-200/80 overflow-x-auto"><TeamTable teamList={myTeams} /></div>
                            </TabsContent>
                            <TabsContent value="all-teams" className="mt-6">
                                <div className="bg-white rounded-lg border border-gray-200/80 overflow-x-auto"><TeamTable teamList={allTeams} /></div>
                            </TabsContent>
                            
                            {/* --- ADDED: New TabsContent for Available Participants --- */}
                            <TabsContent value="available-participants" className="mt-6">
                                <div className="bg-white rounded-lg border border-gray-200/80 overflow-x-auto">
                                    {loadingParticipants ? (
                                        <div className="text-center py-8 text-gray-500">Loading participants...</div>
                                    ) : error ? (
                                        <div className="text-center py-8 text-red-500">Error: {error}</div>
                                    ) : (
                                        <ParticipantsTable participants={availableParticipants} />
                                    )}
                                </div>
                            </TabsContent>

                        </Tabs>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default CoordinatorDashboard;