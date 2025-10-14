// pages/coordinator/CoordinatorDashboard.jsx

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Users, ClipboardList, Calendar, MapPin, PlusCircle, Link as LinkIcon, LogOut, UserCheck, Edit } from 'lucide-react';

const CoordinatorDashboard = ({
    hackathon,
    myTeams = [],
    allTeams = [],
    availableParticipants = [],
    allUsers = [],
    onNavigateToRegister,
    onEditTeam
}) => {
    const [showListDialog, setShowListDialog] = useState({ open: false, type: "", data: [] });

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/login";
    };

    const handleEditTeam = (teamId) => {
        onEditTeam(teamId);
    };

    const handleShowList = (type) => {
        let data = [];
        let title = "";

        switch (type) {
            case 'participants':
                // Get all participants from teams
                const teamParticipants = allTeams.flatMap(team => team.members || []);

                // Create a unique list of all participants with complete user data
                const allParticipantsMap = new Map();

                // Add team participants - merge with full user data from allUsers
                teamParticipants.forEach(participant => {
                    const fullUserData = allUsers.find(user => user._id === participant._id);
                    if (fullUserData) {
                        allParticipantsMap.set(participant._id, fullUserData);
                    } else {
                        // Fallback to participant data if full user data not found
                        allParticipantsMap.set(participant._id, participant);
                    }
                });

                // Add available participants (these should already have complete data)
                availableParticipants.forEach(participant => {
                    allParticipantsMap.set(participant._id, participant);
                });

                data = Array.from(allParticipantsMap.values());
                title = "All Participants";
                break;
            case 'teams':
                data = allTeams;
                title = "All Teams";
                break;
            case 'myTeams':
                data = myTeams;
                title = "My Teams";
                break;
            case 'availableParticipants':
                data = availableParticipants;
                title = "Available Participants";
                break;
        }

        setShowListDialog({ open: true, type, data, title });
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const TeamTable = ({ teamList = [], isMyTeams = false }) => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Team Name</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Project Title</TableHead>
                    <TableHead>GitHub</TableHead>
                    {isMyTeams && <TableHead>Actions</TableHead>}
                </TableRow>
            </TableHeader>
            <TableBody>
                {teamList.length > 0 ? teamList.map((team) => (
                    <TableRow key={team._id}>
                        <TableCell className="font-medium">{team.team_name}</TableCell>
                        <TableCell>
                            <div className="flex flex-wrap gap-1">
                                {(team.members || []).map((member) => (
                                    <Badge key={member._id} variant="outline" className="text-xs">{member.user_name}</Badge>
                                ))}
                            </div>
                        </TableCell>
                        <TableCell>
                            {team.q_id?.q_title ? <Badge variant="secondary">{team.q_id.q_title}</Badge> : <span className="text-gray-500 italic">Not assigned</span>}
                        </TableCell>
                        <TableCell>
                            {team.user_github_url ? <a href={team.user_github_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1"><LinkIcon size={14} /> Link</a> : <span className="text-gray-500 italic">No repo</span>}
                        </TableCell>
                        {isMyTeams && (
                            <TableCell>
                                <Button variant="ghost" size="icon" onClick={() => handleEditTeam(team._id)}>
                                    <Edit className="h-4 w-4 text-gray-600" />
                                </Button>
                            </TableCell>
                        )}
                    </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={isMyTeams ? 5 : 4} className="text-center text-gray-500 py-8">
                            No teams to display.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );

    const ParticipantsTable = ({ participants }) => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>User Name</TableHead>
                    <TableHead>Email</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {participants.length > 0 ? (
                    participants.map((participant) => (
                        <TableRow key={participant._id}>
                            <TableCell className="font-medium">{participant.user_name}</TableCell>
                            <TableCell>{participant.user_email}</TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={2} className="text-center text-gray-500 py-8">
                            No available participants at the moment.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-xl">
                    <CardHeader>
                        <div className="flex flex-wrap justify-between items-start gap-4">
                            <div>
                                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">{hackathon?.hackathon_name || "Loading Hackathon..."}</CardTitle>
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-gray-600">
                                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><span>{formatDate(hackathon?.start_datetime)} to {formatDate(hackathon?.end_datetime)}</span></div>
                                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /><span>{hackathon?.venue || "N/A"}</span></div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button onClick={onNavigateToRegister} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 transition-all duration-200"><PlusCircle className="mr-2 h-4 w-4" /> Register New Team</Button>
                                <Button onClick={handleLogout} variant="outline"><LogOut className="mr-2 h-4 w-4" /> Logout</Button>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Participants"
                        value={hackathon?.counts?.participants || availableParticipants.length + allTeams.reduce((acc, team) => acc + team.members.length, 0) || 0}
                        icon={Users}
                        color="text-sky-600"
                        onClick={() => handleShowList('participants')}
                    />
                    <StatCard
                        title="Total Teams"
                        value={allTeams.length}
                        icon={ClipboardList}
                        color="text-emerald-600"
                        onClick={() => handleShowList('teams')}
                    />
                    <StatCard
                        title="My Teams"
                        value={myTeams.length}
                        icon={Users}
                        color="text-blue-600"
                        onClick={() => handleShowList('myTeams')}
                    />
                    <StatCard
                        title="Available Participants"
                        value={availableParticipants.length}
                        icon={UserCheck}
                        color="text-indigo-600"
                        onClick={() => handleShowList('availableParticipants')}
                    />
                </div>

                <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-xl">
                    <CardHeader><CardTitle className="text-xl">Team & Participant Management</CardTitle></CardHeader>
                    <CardContent>
                        <Tabs defaultValue="my-teams" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 bg-gray-100">
                                <TabsTrigger value="my-teams">My Teams</TabsTrigger>
                                <TabsTrigger value="all-teams">All Teams</TabsTrigger>
                                <TabsTrigger value="available-participants">Available Participants</TabsTrigger>
                            </TabsList>
                            <TabsContent value="my-teams" className="mt-4"><div className="rounded-lg border overflow-x-auto"><TeamTable teamList={myTeams} isMyTeams={true} /></div></TabsContent>
                            <TabsContent value="all-teams" className="mt-4"><div className="rounded-lg border overflow-x-auto"><TeamTable teamList={allTeams} /></div></TabsContent>
                            <TabsContent value="available-participants" className="mt-4"><div className="rounded-lg border overflow-x-auto"><ParticipantsTable participants={availableParticipants} /></div></TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* List Dialog */}
                <Dialog open={showListDialog.open} onOpenChange={(open) => setShowListDialog({ ...showListDialog, open })}>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-semibold">{showListDialog.title}</DialogTitle>
                            <DialogDescription>
                                {showListDialog.type === 'participants' && "List of all participants in the hackathon"}
                                {showListDialog.type === 'teams' && "List of all teams in the hackathon"}
                                {showListDialog.type === 'myTeams' && "List of teams you have registered"}
                                {showListDialog.type === 'availableParticipants' && "List of participants available for team registration"}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4">
                            {showListDialog.type === 'participants' && (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Team</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {showListDialog.data.map((participant, index) => {
                                            const team = allTeams.find(t => t.members?.some(m => m._id === participant._id));
                                            return (
                                                <TableRow key={participant._id || index}>
                                                    <TableCell className="font-medium">{participant.user_name}</TableCell>
                                                    <TableCell>{participant.user_email}</TableCell>
                                                    <TableCell>
                                                        {team ? (
                                                            <Badge variant="outline">{team.team_name}</Badge>
                                                        ) : (
                                                            <Badge variant="secondary">Available</Badge>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            )}

                            {(showListDialog.type === 'teams' || showListDialog.type === 'myTeams') && (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Team Name</TableHead>
                                            <TableHead>Members</TableHead>
                                            <TableHead>Project Title</TableHead>
                                            <TableHead>GitHub</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {showListDialog.data.map((team) => (
                                            <TableRow key={team._id}>
                                                <TableCell className="font-medium">{team.team_name}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {(team.members || []).map((member) => (
                                                            <Badge key={member._id} variant="outline" className="text-xs">
                                                                {member.user_name}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {team.q_id?.q_title ? (
                                                        <Badge variant="secondary">{team.q_id.q_title}</Badge>
                                                    ) : (
                                                        <span className="text-gray-500 italic">Not assigned</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {team.user_github_url ? (
                                                        <a
                                                            href={team.user_github_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:underline flex items-center gap-1"
                                                        >
                                                            <LinkIcon size={14} /> Link
                                                        </a>
                                                    ) : (
                                                        <span className="text-gray-500 italic">No repo</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}

                            {showListDialog.type === 'availableParticipants' && (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {showListDialog.data.map((participant) => (
                                            <TableRow key={participant._id}>
                                                <TableCell className="font-medium">{participant.user_name}</TableCell>
                                                <TableCell>{participant.user_email}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </motion.div>
        </div>
    );
};

const StatCard = ({ title, value, icon: Icon, color, onClick }) => (
    <Card
        className="shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105"
        onClick={onClick}
    >
        <CardContent className="p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className={`text-3xl font-bold ${color}`}>{value}</p>
                </div>
                <Icon className={`w-8 h-8 ${color}`} />
            </div>
            <p className={`text-sm ${color} mt-2 opacity-70`}>Click to view list</p>
        </CardContent>
    </Card>
);

export default CoordinatorDashboard;