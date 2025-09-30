import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'; 
import { Users, Trophy, Plus, ClipboardList, CheckCircle, Clock, AlertCircle, Link as LinkIcon, Loader2, UserCheck, Trash2, Settings, ListPlus, UserCog } from 'lucide-react'

// === MOCK EXTERNAL DEPENDENCIES (To allow single-file execution) ===
// NOTE: These components replace unavailable external imports like shadcn/ui components.

const toast = ({ title, description, variant }) => console.log(`TOAST - ${variant}: ${title} - ${description}`);

// --- SHADCN/UI MOCKS ---
const Badge = ({ children, className = "", variant }) => {
    let baseStyle = "px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500";
    if (variant === "secondary") baseStyle = "bg-gray-100 text-gray-800 border border-gray-200";
    if (variant === "outline") baseStyle = "text-gray-600 border border-gray-300";
    if (variant === "default") baseStyle = "bg-blue-600 text-white";
    return <span className={`${baseStyle} ${className}`}>{children}</span>;
};

const Button = ({ children, onClick, className = "", variant = "default", disabled = false }) => {
    let baseStyle = "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none p-3 shadow-md";
    if (variant === "outline") baseStyle = "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50";
    if (variant === "destructive") baseStyle = "bg-red-600 text-white hover:bg-red-700 shadow-md";
    if (variant === "default") baseStyle = "bg-gray-900 text-white hover:bg-gray-800";
    return <button onClick={onClick} className={`${baseStyle} ${className}`} disabled={disabled}>{children}</button>;
};

const Card = ({ children, className = "" }) => <div className={`rounded-xl border bg-card text-card-foreground shadow-sm ${className}`}>{children}</div>;
const CardHeader = ({ children, className = "" }) => <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>;
const CardTitle = ({ children, className = "" }) => <h3 className={`font-semibold tracking-tight text-xl ${className}`}>{children}</h3>;
const CardDescription = ({ children, className = "" }) => <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>;
const CardContent = ({ children, className = "" }) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;

const Table = ({ children }) => <div className="w-full"><table className="w-full caption-bottom text-sm">{children}</table></div>;
const TableHeader = ({ children }) => <thead className="[&_tr]:border-b">{children}</thead>;
const TableBody = ({ children }) => <tbody className="[&_tr:last-child]:border-0">{children}</tbody>;
const TableRow = ({ children, className = "" }) => <tr className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${className}`}>{children}</tr>;
const TableHead = ({ children, className = "" }) => <th className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className}`}>{children}</th>;
const TableCell = ({ children, className = "" }) => <td className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}>{children}</td>;

const Tabs = ({ children, defaultValue, className = "" }) => <div data-state={defaultValue} className={className}>{children}</div>;
const TabsList = ({ children, className = "" }) => <div className={`inline-flex items-center justify-center whitespace-nowrap rounded-lg bg-gray-100 p-1 text-muted-foreground ${className}`}>{children}</div>;
const TabsTrigger = ({ children, value, className = "" }) => <button data-state={value} className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm ${className}`}>{children}</button>;
const TabsContent = ({ children, value, className = "" }) => <div data-state={value} className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}>{children}</div>;

const DefaultLayout = ({ children, userRole }) => (
    <div className="flex flex-col min-h-screen font-inter">
        <header className="p-4 bg-white shadow-md flex justify-between items-center px-8 lg:px-12">
            <h2 className="text-xl font-bold text-gray-900">Hackathon Management System</h2>
            <Badge className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">Role: {userRole}</Badge>
        </header>
        <main className="flex-grow">
            {children}
        </main>
    </div>
);
// === END MOCK EXTERNAL DEPENDENCIES ===


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

// Component to render the list of all participants with a suspend option (Role Mapping Criteria)
const ParticipantsTable = ({ participants, onSuspendParticipant }) => (
    <Table>
        <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead>User Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead> {/* Role Mapping Column */}
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
                                className="h-8 px-3 py-1 text-xs"
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

// Component to render the list of all teams with participant count and suspend option (Team Criteria)
const TeamTable = ({ teamList = [], onSuspendTeam }) => (
    <Table>
        <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead>Team Name</TableHead>
                <TableHead>Participants</TableHead> {/* Participant Count Column */}
                <TableHead>Project Assigned</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Coordinator</TableHead>
                <TableHead>Action</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {(teamList && teamList.length > 0) ? teamList.map((team) => (
                <TableRow key={team._id}>
                    <TableCell className="font-medium">{team.team_name || 'Untitled Team'}</TableCell>
                    
                    {/* Display Participant Count */}
                    <TableCell>
                        <div className="flex flex-wrap gap-1 items-center">
                            <span className="font-semibold text-gray-800">
                                {team.team_members ? team.team_members.length : 0}
                            </span>
                        </div>
                    </TableCell>

                    <TableCell>
                        {team.project_assigned ? <Badge variant="secondary">{team.project_assigned}</Badge> : <span className="text-gray-500 italic">Not assigned</span>}
                    </TableCell>
                    <TableCell>{getStatusBadge(team.status || 'Pending')}</TableCell>
                    <TableCell>
                        <span className="text-gray-700 font-medium">{team.coordinator_name || 'N/A'}</span>
                    </TableCell>
                    <TableCell>
                        <Button
                            onClick={() => onSuspendTeam(team._id, team.team_name)}
                            variant="destructive"
                            className="h-8 px-3 py-1 text-xs"
                            title="Suspend and delete all team data from MongoDB"
                        >
                            <Trash2 className="w-3 h-3 mr-1" /> Suspend
                        </Button>
                    </TableCell>
                </TableRow>
            )) : (
                <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-6">
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

    const [loading, setLoading] = useState(true);

    // --- SUSPENSION HANDLERS (STRICT MongoDB deletion) ---

    const handleSuspendTeam = async (teamId, teamName) => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            
            // ATTEMPT MongoDB DELETE operation
            await axios.delete(`http://localhost:5000/api/teams/${teamId}`, config);
            
            // ONLY Update local state if the DELETE was successful
            setAllTeams(prevTeams => prevTeams.filter(team => team._id !== teamId));
            setStats(prev => ({ ...prev, totalTeams: prev.totalTeams - 1 }));
            
            toast({
                title: "Team Suspended (MongoDB)",
                description: `Team "${teamName}" and its data have been permanently removed.`,
                variant: "destructive"
            });
        } catch (error) {
            console.error("Error suspending team:", error);
            // Show error toast on failure, DO NOT update local state
            toast({
                title: "Suspension Failed",
                description: `Could not delete team "${teamName}" from MongoDB. Check backend connection.`,
                variant: "destructive"
            });
        }
    };

    const handleSuspendParticipant = async (userId, userName) => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            
            // ATTEMPT MongoDB DELETE operation
            await axios.delete(`http://localhost:5000/api/users/${userId}`, config);

            // ONLY Update local state if the DELETE was successful
            setAllParticipants(prevParticipants => prevParticipants.filter(p => p._id !== userId));
            setStats(prev => ({ ...prev, participants: prev.participants - 1 }));
            
            toast({
                title: "Participant Suspended (MongoDB)",
                description: `Participant "${userName}" and their data have been permanently removed.`,
                variant: "destructive"
            });
        } catch (error) {
            console.error("Error suspending participant:", error);
            // Show error toast on failure, DO NOT update local state
            toast({
                title: "Suspension Failed",
                description: `Could not delete participant "${userName}" from MongoDB. Check backend connection.`,
                variant: "destructive"
            });
        }
    };

    // --- DATA FETCHING (MongoDB only) ---

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token'); 
                const config = { headers: { 'Authorization': `Bearer ${token}` } };

                // Fetch data from MongoDB endpoints
                const [statsRes, projectsRes, teamsRes, participantsRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/dashboard/stats', config),
                    axios.get('http://localhost:5000/api/projects', config),
                    axios.get('http://localhost:5000/api/teams', config),
                    axios.get('http://localhost:5000/api/users/participants', config),
                ]);

                // Set data only if all requests succeed
                setStats(prev => ({
                    ...prev,
                    ...statsRes.data.stats, 
                    participants: participantsRes.data.length,
                    totalTeams: teamsRes.data.length
                })); 
                setProjects(projectsRes.data);
                setAllTeams(teamsRes.data);
                setAllParticipants(participantsRes.data);

            } catch (error) {
                // If any connection fails, the state will remain empty ([]), and the stats will be 0.
                console.error("Error fetching dashboard data:", error);
                
                toast({ 
                    title: "Database Connection Failed", 
                    description: "Could not connect to MongoDB server at localhost:5000. Displaying empty data (0 counts).",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const getDifficultyColor = (difficulty) => {
        const colors = {
            'Easy': 'bg-emerald-50 text-emerald-700 border-emerald-200',
            'Medium': 'bg-amber-50 text-amber-700 border-amber-200',
            'Hard': 'bg-red-50 text-red-700 border-red-200'
        }
        return colors[difficulty] || 'bg-gray-50 text-gray-700 border-gray-200'
    }

    if (loading) {
        return (
            <DefaultLayout userRole="admin">
                <div className="flex justify-center items-center min-h-[80vh]">
                    <Loader2 className="mr-2 h-6 w-6 animate-spin text-blue-600" />
                    <p className="text-xl text-gray-600">Loading Admin Dashboard data from MongoDB...</p>
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
                                        <p className="text-3xl font-bold text-emerald-600">{allTeams.length}</p>
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
                                        <p className="text-3xl font-bold text-indigo-600">{allParticipants.length}</p>
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
                                        <p className="text-3xl font-bold text-purple-600">{projects.length}</p>
                                    </div>
                                    <ClipboardList className="w-8 h-8 text-purple-500" />
                                </div>
                                <p className="text-sm text-purple-600 mt-2">Available challenges</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                    
                    {/* Management Configuration Cards (Matching Screenshot) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                            <Settings className="w-6 h-6 mr-2 text-blue-600" /> Configuration Settings
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            
                            {/* Card 1: Teams Summary (Matching Screenshot) */}
                            <Card className="bg-white border-gray-200 shadow-md">
                                <CardHeader className="pb-4">
                                    <CardTitle>Teams</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {allTeams.length > 0 ? (
                                        <p className="text-gray-700 text-lg font-semibold">{allTeams.length} Teams Registered</p>
                                    ) : (
                                        <p className="text-gray-500">No teams have been created for this hackathon yet.</p>
                                    )}
                                    <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white" onClick={() => console.log('Simulating navigation to detailed team creation/view')}>
                                        <Users className="w-4 h-4 mr-2" /> View/Create Teams
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Card 2: Project Titles & Criteria (Matching Screenshot) */}
                            <Card className="bg-white border-gray-200 shadow-md">
                                <CardHeader className="pb-4">
                                    <CardTitle>Project Titles</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-gray-700 text-lg font-semibold">{projects.length} Titles Available</p>
                                    <Button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white" onClick={() => console.log('Simulating navigation to Project Titles and Criteria form')}>
                                        <ListPlus className="w-4 h-4 mr-2" /> Manage Titles and Criteria
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Card 3: Role Mapping (Matching Screenshot) */}
                            <Card className="bg-white border-gray-200 shadow-md">
                                <CardHeader className="pb-4">
                                    <CardTitle>Role Mapping</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-gray-700 text-lg font-semibold">Assign roles for coordinators, judges, etc.</p>
                                    <Button className="w-full bg-black hover:bg-gray-800 text-white" onClick={() => console.log('Simulating navigation to Role Mapping form')}>
                                        <UserCog className="w-4 h-4 mr-2" /> Map Coordinators & Evaluators
                                    </Button>
                                </CardContent>
                            </Card>

                        </div>
                    </motion.div>


                    {/* Detailed Team & User Management Tabs (For Suspension/MongoDB Data) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 mt-8 flex items-center">
                            <Trash2 className="w-6 h-6 mr-2 text-red-600" /> Data Suspension & Details
                        </h2>
                        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                            <CardHeader>
                                <CardDescription>View detailed data from **MongoDB** and use the **Suspend** option to permanently delete records.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="teams" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2 bg-slate-200/60">
                                        <TabsTrigger value="teams">Detailed All Teams ({allTeams.length})</TabsTrigger>
                                        <TabsTrigger value="participants">Detailed All Participants ({allParticipants.length})</TabsTrigger>
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
                    
                    {/* Available Projects (Detailed View) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 mt-8 flex items-center">
                            <ClipboardList className="w-6 h-6 mr-2 text-purple-600" /> Detailed Project Criteria
                        </h2>
                        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                            <CardHeader>
                                <CardDescription className="text-base">
                                    Detailed view of available challenges, categorized by **difficulty** and **category**.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {projects.length > 0 ? projects.map((project, index) => (
                                        <motion.div
                                            key={project._id || index}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1, duration: 0.5 }}
                                            whileHover={{ y: -5, scale: 1.02 }}
                                            className="group relative"
                                        >
                                            <div className="relative p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 h-full">
                                                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                
                                                <div className="relative z-10">
                                                    <h3 className="font-bold text-lg mb-3 group-hover:text-blue-700 transition-colors">
                                                        {project.title}
                                                    </h3>
                                                    
                                                    <div className="flex items-center justify-between mb-4">
                                                        <Badge variant="outline" className="text-xs bg-white">
                                                            {project.category || 'N/A'}
                                                        </Badge>
                                                        <Badge variant="outline" className={`text-xs font-medium ${getDifficultyColor(project.difficulty)}`}>
                                                            {project.difficulty || 'N/A'}
                                                        </Badge>
                                                    </div>
                                                    
                                                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                                                        {project.description || 'No description provided.'}
                                                    </p>

                                                    <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
                                                        <div className="flex items-center">
                                                            <LinkIcon className="w-4 h-4 mr-1 text-gray-400" />
                                                            <a href={project.repo_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Repo</a>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Trophy className="w-4 h-4 mr-1 text-yellow-500" />
                                                            <span className="font-semibold">{project.rating || 'New'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )) : (
                                        <div className="md:col-span-3 text-center py-4 text-gray-500">No project problems loaded from MongoDB.</div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            </div>
        </DefaultLayout>
    )
}

export default AdminDashboard
