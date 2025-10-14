import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DefaultLayout from '@/components/DefaultLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, User, UserCheck, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAllUsers, updateUserRole, getCoordinatorInfo } from '@/api/userApi';
import { getHackathonById } from '@/api/hackathonApi';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RoleChangeConfirmationDialog, UnassignConfirmationDialog } from '@/components/ui/confirmation-dialog';

const UserListBox = ({ users, selected, setSelected }) => (
    <div className="border rounded-md h-80 overflow-y-auto bg-gray-50/70 p-2 shadow-inner">
        {users.length === 0 ? (
            <p className="text-center text-gray-500 py-4 text-sm">No users to display.</p>
        ) : (
            users.map(user => (
                <div
                    key={user._id}
                    className={`p-2 cursor-pointer rounded-md mb-1 text-sm transition-all ${selected.includes(user._id)
                        ? 'bg-blue-200 border border-blue-500'
                        : 'hover:bg-gray-100'
                        }`}
                    onClick={() => {
                        setSelected(prev =>
                            prev.includes(user._id)
                                ? prev.filter(id => id !== user._id)
                                : [...prev, user._id]
                        );
                    }}
                >
                    <p className="font-medium">{user.user_name}</p>
                    <p className="text-xs text-gray-600">{user.user_email}</p>
                </div>
            ))
        )}
    </div>
);

const RoleMapping = () => {
    const { hackathonId } = useParams();
    const navigate = useNavigate();
    const [allUsers, setAllUsers] = useState([]);
    const [hackathon, setHackathon] = useState(null);
    const [targetRole, setTargetRole] = useState('coordinator');
    const [loading, setLoading] = useState(true);
    const [selectedAvailable, setSelectedAvailable] = useState([]);
    const [selectedAssigned, setSelectedAssigned] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();

    // Confirmation dialog states
    const [showAssignDialog, setShowAssignDialog] = useState(false);
    const [showUnassignDialog, setShowUnassignDialog] = useState(false);
    const [coordinatorInfo, setCoordinatorInfo] = useState(null);
    const [selectedNewCoordinator, setSelectedNewCoordinator] = useState('');

    const resetDialogStates = () => {
        setShowAssignDialog(false);
        setShowUnassignDialog(false);
        setCoordinatorInfo(null);
        setSelectedNewCoordinator('');
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersData, hackathonData] = await Promise.all([
                    getAllUsers(),
                    getHackathonById(hackathonId)
                ]);
                setAllUsers(usersData);
                setHackathon(hackathonData);
                
                // Check if hackathon is completed and show warning
                if (hackathonData.status === 'completed') {
                    toast({
                        title: "Event Completed",
                        description: "This hackathon has been completed. Role assignments are no longer allowed.",
                        variant: "destructive"
                    });
                }
            } catch (error) {
                toast({ title: "Error", description: "Failed to load initial data.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [hackathonId, toast]);

    const handleAssignClick = async () => {
        if (selectedAvailable.length === 0) return;
        setShowAssignDialog(true);
    };

    const handleUnassignClick = async () => {
        if (selectedAssigned.length === 0) return;

        // Check if any selected users are coordinators
        const coordinatorUsers = selectedAssigned.filter(userId => {
            const user = allUsers.find(u => u._id === userId);
            return user && user.role_name === 'coordinator';
        });

        if (coordinatorUsers.length > 1) {
            toast({
                title: "Multiple Coordinators Selected",
                description: "Please unassign coordinators one at a time to ensure proper team management.",
                variant: "destructive"
            });
            return;
        }

        if (coordinatorUsers.length === 1) {
            const coordinatorId = coordinatorUsers[0];
            try {
                const info = await getCoordinatorInfo(coordinatorId);
                setCoordinatorInfo(info);
            } catch (error) {
                console.error('Error getting coordinator info:', error);
                toast({
                    title: "Error",
                    description: "Failed to get coordinator information.",
                    variant: "destructive"
                });
                return;
            }
        } else {
            setCoordinatorInfo(null);
        }

        setShowUnassignDialog(true);
    };

    const handleAssignConfirm = async (newCoordinatorId = null) => {
        if (selectedAvailable.length === 0) return;

        const promises = selectedAvailable.map(userId =>
            updateUserRole(userId, {
                role: targetRole,
                current_hackathon: hackathonId,
                newCoordinatorId
            })
        );

        try {
            await Promise.all(promises);
            const updatedUsers = allUsers.map(u => selectedAvailable.includes(u._id) ? { ...u, role_name: targetRole } : u);
            setAllUsers(updatedUsers);
            
            // Refresh hackathon data to get updated team information
            const updatedHackathon = await getHackathonById(hackathonId);
            setHackathon(updatedHackathon);
            
            setSelectedAvailable([]);
            resetDialogStates();
            toast({ title: "Success", description: `${selectedAvailable.length} user(s) assigned as ${targetRole}.` });
        } catch (error) {
            console.error('Assignment error:', error);
            toast({ title: "Error", description: error.response?.data?.message || "Failed to assign one or more users.", variant: "destructive" });
        }
    };

    const handleUnassignConfirm = async (newCoordinatorId = null) => {
        if (selectedAssigned.length === 0) return;

        const promises = selectedAssigned.map(userId =>
            updateUserRole(userId, {
                role: 'participant',
                current_hackathon: hackathonId,
                newCoordinatorId
            })
        );

        try {
            await Promise.all(promises);
            const updatedUsers = allUsers.map(u => selectedAssigned.includes(u._id) ? { ...u, role_name: 'participant' } : u);
            setAllUsers(updatedUsers);
            
            // Refresh hackathon data to get updated team information
            const updatedHackathon = await getHackathonById(hackathonId);
            setHackathon(updatedHackathon);
            
            setSelectedAssigned([]);
            resetDialogStates();
            toast({ title: "Success", description: `${selectedAssigned.length} user(s) unassigned.` });
        } catch (error) {
            console.error('Unassignment error:', error);
            toast({ title: "Error", description: error.response?.data?.message || "Failed to unassign one or more users.", variant: "destructive" });
        }
    };

    // Use the pre-filtered participants from backend (already excludes team members)
    const availableUsers = hackathon?.managementLists?.participants || [];

    // Use the pre-filtered coordinators/evaluators from backend
    const assignedUsers = targetRole === 'coordinator' 
        ? (hackathon?.managementLists?.coordinators || [])
        : (hackathon?.managementLists?.evaluators || []);

    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filteredAvailableUsers = availableUsers.filter(u => u.user_name.toLowerCase().includes(lowerCaseSearchTerm) || u.user_email.toLowerCase().includes(lowerCaseSearchTerm));
    const filteredAssignedUsers = assignedUsers.filter(u => u.user_name.toLowerCase().includes(lowerCaseSearchTerm) || u.user_email.toLowerCase().includes(lowerCaseSearchTerm));

    if (loading) {
        return <DefaultLayout userRole="admin"><Skeleton className="h-[600px] m-8" /></DefaultLayout>;
    }

    // Check if hackathon is completed
    const isCompleted = hackathon?.status === 'completed';

    return (
        <DefaultLayout userRole="admin">
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
                <div className="p-8 max-w-7xl mx-auto space-y-8">
                    <Button onClick={() => navigate(`/admin/manage-hackathon/${hackathonId}`)} variant="outline">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Management
                    </Button>
                    <h1 className="text-4xl font-extrabold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent border-b pb-2">
                        {isCompleted ? 'Staff Roles Overview' : 'Staff Role Mapping'} for "{hackathon?.hackathon_name}"
                    </h1>

                    {isCompleted && (
                        <Card className="shadow-lg border-red-200 bg-red-50">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 text-red-700">
                                    <AlertTriangle className="w-6 h-6" />
                                    <div>
                                        <h3 className="font-semibold">Event Completed</h3>
                                        <p className="text-sm">This hackathon has been completed. Role assignments and modifications are no longer allowed.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-xl">
                        <CardContent className="p-6">
                            <Label>Select Target Role to Assign</Label>
                            <Select onValueChange={setTargetRole} value={targetRole}>
                                <SelectTrigger className="w-full md:w-1/3 mt-1"><SelectValue placeholder="Select Role" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="coordinator">Coordinator</SelectItem>
                                    <SelectItem value="evaluator">Evaluator</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-xl">
                        <CardContent className="p-6">
                            <Label htmlFor="search-user">Search User by Name or Email</Label>
                            <Input id="search-user" placeholder="Start typing to filter users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                        <div className="space-y-3">
                            <h3 className="text-xl font-semibold flex items-center gap-2 text-green-700">
                                <User className="w-5 h-5" /> 
                                {hackathon?.teams && hackathon.teams.length > 0 ? 'Available Participants' : 'Participants in Hackathon'}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {hackathon?.teams && hackathon.teams.length > 0 
                                    ? 'Participants not yet assigned to teams who can be promoted.'
                                    : 'Users who have joined this hackathon and can be promoted.'
                                }
                            </p>
                            <UserListBox users={filteredAvailableUsers} selected={selectedAvailable} setSelected={setSelectedAvailable} />
                        </div>

                        <div className="flex lg:flex-col justify-center gap-4">
                            <Button 
                                onClick={handleAssignClick} 
                                disabled={selectedAvailable.length === 0 || isCompleted} 
                                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
                            >
                                Assign <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                            <Button 
                                onClick={handleUnassignClick} 
                                disabled={selectedAssigned.length === 0 || isCompleted} 
                                variant="destructive" 
                                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" /> Unassign
                            </Button>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-xl font-semibold flex items-center gap-2 text-indigo-700">
                                <UserCheck className="w-5 h-5" /> 
                                {targetRole === 'coordinator' ? 'All Coordinators' : `Assigned ${targetRole}s`}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {targetRole === 'coordinator' 
                                    ? 'All coordinators in this event (including those assigned to teams).'
                                    : `Users assigned as ${targetRole} for this event.`
                                }
                            </p>
                            <UserListBox users={filteredAssignedUsers} selected={selectedAssigned} setSelected={setSelectedAssigned} />
                        </div>
                    </div>

                    {/* Confirmation Dialogs */}
                    <RoleChangeConfirmationDialog
                        open={showAssignDialog}
                        onOpenChange={(open) => {
                            if (!open) resetDialogStates();
                            setShowAssignDialog(open);
                        }}
                        onConfirm={handleAssignConfirm}
                        userNames={selectedAvailable.map(id => allUsers.find(u => u._id === id)?.user_name).filter(Boolean)}
                        currentRole="participant"
                        newRole={targetRole}
                        isCoordinatorChange={false}
                        coordinatorInfo={null}
                        selectedNewCoordinator={selectedNewCoordinator}
                        setSelectedNewCoordinator={setSelectedNewCoordinator}
                    />

                    <UnassignConfirmationDialog
                        open={showUnassignDialog}
                        onOpenChange={(open) => {
                            if (!open) resetDialogStates();
                            setShowUnassignDialog(open);
                        }}
                        onConfirm={handleUnassignConfirm}
                        userNames={selectedAssigned.map(id => allUsers.find(u => u._id === id)?.user_name).filter(Boolean)}
                        currentRole={targetRole}
                        isCoordinatorChange={coordinatorInfo?.isCoordinator && coordinatorInfo?.teamsCount > 0}
                        coordinatorInfo={coordinatorInfo}
                        selectedNewCoordinator={selectedNewCoordinator}
                        setSelectedNewCoordinator={setSelectedNewCoordinator}
                    />
                </div>
            </div>
        </DefaultLayout>
    );
};

export default RoleMapping;