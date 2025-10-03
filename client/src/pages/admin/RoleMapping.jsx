import React, { useState, useEffect } from 'react';
import DefaultLayout from '@/components/DefaultLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Save, User, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAllUsers, updateUserRole } from '@/api/userApi'; 
import { getAllHackathons } from '@/api/hackathonApi'; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

// ------------------------------------------------------------------
// TRANSFER LIST UI COMPONENT (ListBox)
// ------------------------------------------------------------------

const UserListBox = ({ users, selected, setSelected }) => (
    <div className="border rounded-md h-80 overflow-y-auto bg-gray-50/70 p-2 shadow-inner">
        {users.length === 0 ? (
            <p className="text-center text-gray-500 py-4 text-sm">No users found.</p>
        ) : (
            users.map(user => (
                <div
                    key={user._id}
                    className={`p-2 cursor-pointer rounded-md mb-1 text-sm transition-all ${
                        selected.includes(user._id) 
                            ? 'bg-blue-200 border border-blue-500 shadow-md' 
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

// ------------------------------------------------------------------
// MAIN ROLE MAPPING COMPONENT
// ------------------------------------------------------------------

const RoleMapping = () => {
    const [allUsers, setAllUsers] = useState([]); 
    const [hackathons, setHackathons] = useState([]);
    
    const [selectedHackathon, setSelectedHackathon] = useState('');
    const [targetRole, setTargetRole] = useState('coordinator'); 
    const [loading, setLoading] = useState(true);
    const [selectedAvailable, setSelectedAvailable] = useState([]);
    const [selectedAssigned, setSelectedAssigned] = useState([]);
    const { toast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, hackathonRes] = await Promise.all([
                    getAllUsers(), 
                    getAllHackathons()
                ]);
                
                const usersArray = userRes.data || userRes.users || userRes;
                setAllUsers(usersArray); 
                
                setHackathons(hackathonRes.data);
            } catch (error) {
                toast({ title: "Error", description: "Failed to load initial data.", variant: "destructive" });
                console.error("Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [toast]);

    // Derived State: Filtering logic for the Transfer List
    const availableUsers = allUsers.filter(user => 
        user.role_name === 'participant' && 
        (user.current_hackathon === null || user.current_hackathon === undefined)
    );
    
    const assignedUsers = allUsers.filter(user => 
        user.role_name === targetRole && 
        user.current_hackathon === selectedHackathon
    );


    // ------------------------------------------------------------------
    // MAPPING HANDLERS
    // ------------------------------------------------------------------

    const handleAssign = async () => {
        if (!selectedHackathon) {
            return toast({ title: "Error", description: "Please select a hackathon first.", variant: "destructive" });
        }
        if (selectedAvailable.length === 0) return;

        setLoading(true);
        const userIdsToUpdate = selectedAvailable;
        let successCount = 0;

        for (const userId of userIdsToUpdate) {
            try {
                // Payload: Set the new role and link them to the hackathon
                await updateUserRole(userId, { 
                    role: targetRole, 
                    current_hackathon: selectedHackathon 
                });
                successCount++;
            } catch (error) {
                toast({ title: "Error", description: `Failed to assign user ID ${userId}.`, variant: "destructive" });
            }
        }

        // 2. Optimistic UI Update: Update the local state
        if (successCount > 0) {
            const updatedUsers = allUsers.map(u => 
                userIdsToUpdate.includes(u._id) 
                    ? { ...u, role_name: targetRole, current_hackathon: selectedHackathon } 
                    : u
            );
            setAllUsers(updatedUsers);
            setSelectedAvailable([]); 
            toast({ title: "Success", description: `${successCount} user(s) successfully assigned as ${targetRole}.` });
        }
        setLoading(false);
    };

    const handleUnassign = async () => {
        if (!selectedHackathon) {
            return toast({ title: "Error", description: "Please select a hackathon first.", variant: "destructive" });
        }
        if (selectedAssigned.length === 0) return;

        setLoading(true);
        const userIdsToUpdate = selectedAssigned;
        let successCount = 0;
        
        for (const userId of userIdsToUpdate) {
            try {
                // Payload: Revert user to 'participant' role and clear current_hackathon (passing null clears the field)
                await updateUserRole(userId, { 
                    role: 'participant', 
                    current_hackathon: null 
                });
                successCount++;
            } catch (error) {
                toast({ title: "Error", description: `Failed to unassign user ID ${userId}.`, variant: "destructive" });
            }
        }

        // 2. Optimistic UI Update: Update the local state
        if (successCount > 0) {
            const updatedUsers = allUsers.map(u => 
                userIdsToUpdate.includes(u._id) 
                    ? { ...u, role_name: 'participant', current_hackathon: null } 
                    : u
            );
            setAllUsers(updatedUsers);
            setSelectedAssigned([]); 
            toast({ title: "Success", description: `${successCount} user(s) unassigned.` });
        }
        setLoading(false);
    };


    if (loading) {
        return (
            <DefaultLayout userRole="admin">
                <div className="p-8 max-w-7xl mx-auto"><Skeleton className="h-[600px] w-full" /></div>
            </DefaultLayout>
        );
    }
    
    const selectedHackathonTitle = hackathons.find(h => h._id === selectedHackathon)?.title;

    return (
        <DefaultLayout userRole="admin">
            <div className="p-8 max-w-7xl mx-auto space-y-8">
                <h1 className="text-4xl font-extrabold text-gray-800 border-b pb-2">
                    Coordinator & Evaluator Mapping
                </h1>

                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl">Configuration</CardTitle>
                        <CardDescription>Use the transfer list to assign or unassign staff roles for the selected hackathon.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Hackathon Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Hackathon</label>
                            <Select onValueChange={setSelectedHackathon} value={selectedHackathon}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Choose Hackathon" />
                                </SelectTrigger>
                                <SelectContent>
                                    {hackathons.map(h => (
                                        <SelectItem key={h._id} value={h._id}>
                                            {h.title} ({h.status.toUpperCase()})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Target Role Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Target Role</label>
                            <Select onValueChange={setTargetRole} value={targetRole}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="coordinator">Coordinator</SelectItem>
                                    <SelectItem value="evaluator">Evaluator</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Status Display */}
                        <div className="flex flex-col justify-end">
                            <p className="text-sm font-semibold text-gray-700">Target Mapping:</p>
                            <p className="text-md font-bold text-indigo-600">
                                {targetRole.toUpperCase()} for {selectedHackathonTitle || '...'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                
                {/* ➡️ TRANSFER LIST UI */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                    
                    {/* Available Users List */}
                    <div className="space-y-3">
                        <h3 className="text-xl font-semibold flex items-center gap-2 text-green-700"><User className="w-5 h-5" /> Available Participants</h3>
                        <p className="text-sm text-gray-500">Users available for assignment. (Role: Participant, Hackathon: None).</p>
                        <UserListBox 
                            users={availableUsers} 
                            selected={selectedAvailable} 
                            setSelected={setSelectedAvailable} 
                        />
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex lg:flex-col justify-center gap-4 lg:gap-2">
                        <Button 
                            onClick={handleAssign} 
                            disabled={selectedAvailable.length === 0 || !selectedHackathon || loading} 
                            className="bg-green-600 hover:bg-green-700"
                        >
                            Assign <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                        <Button 
                            onClick={handleUnassign} 
                            disabled={selectedAssigned.length === 0 || !selectedHackathon || loading} 
                            variant="destructive"
                            className="bg-red-600 hover:bg-red-700"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Unassign
                        </Button>
                    </div>

                    {/* Assigned Users List */}
                    <div className="space-y-3">
                        <h3 className="text-xl font-semibold flex items-center gap-2 text-indigo-700"><UserCheck className="w-5 h-5" /> Assigned {targetRole}s</h3>
                        <p className="text-sm text-gray-500">Users currently assigned as **{targetRole}** for this event.</p>
                        <UserListBox 
                            users={assignedUsers} 
                            selected={selectedAssigned} 
                            setSelected={setSelectedAssigned} 
                        />
                    </div>
                </div>

                <div className="pt-6 flex justify-center">
                    <Button onClick={() => toast({ title: "Note", description: "Mapping changes are applied instantly on Assign/Unassign." })} variant="outline">
                        <Save className="w-4 h-4 mr-2" /> Changes Applied Instantly
                    </Button>
                </div>
            </div>
        </DefaultLayout>
    );
};

export default RoleMapping;