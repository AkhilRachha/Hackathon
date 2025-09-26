import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, ClipboardList, CheckCircle, Clock, AlertCircle, PlusCircle, Link as LinkIcon } from 'lucide-react';

/**
 * A streamlined dashboard component focused only on displaying data.
 * It receives all data and navigation functions as props.
 * @param {object} props
 * @param {Array} props.myTeams - List of teams managed by the current coordinator.
 * @param {Array} props.allTeams - List of all teams in the system.
 * @param {Function} props.onNavigateToRegister - Function to switch to the registration view.
 */
const CoordinatorDashboard = ({ myTeams, allTeams, onNavigateToRegister }) => {
    
    const getStatusBadge = (status) => {
        const statusConfig = {
            'Active': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
            'Pending': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
            'Inactive': { color: 'bg-red-100 text-red-800', icon: AlertCircle }
        };
        const config = statusConfig[status] || statusConfig['Pending'];
        const Icon = config.icon;
        return (
            <Badge className={`${config.color} flex items-center gap-1`}>
                <Icon className="w-3 h-3" />
                {status}
            </Badge>
        );
    };

    const TeamTable = ({ teamList }) => (
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
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
        >
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-emerald-600 bg-clip-text text-transparent">Coordinator Dashboard</h1>
                    <p className="text-gray-600 mt-3 text-lg">Manage teams and assign projects</p>
                </div>
                <Button onClick={onNavigateToRegister}><PlusCircle className="mr-2 h-4 w-4"/> Register New Team</Button>
            </div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            </div>
            {/* Team Management Table */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl">Team Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="my-teams" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-gray-100/50">
                            <TabsTrigger value="my-teams">My Teams</TabsTrigger>
                            <TabsTrigger value="all-teams">All Teams</TabsTrigger>
                        </TabsList>
                        <TabsContent value="my-teams" className="mt-6">
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden"><TeamTable teamList={myTeams} /></div>
                        </TabsContent>
                        <TabsContent value="all-teams" className="mt-6">
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden"><TeamTable teamList={allTeams} /></div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default CoordinatorDashboard;
