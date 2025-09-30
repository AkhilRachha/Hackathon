import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
// NOTE: DefaultLayout component import has been removed to fix compilation errors.
// It is replaced by a simple <div> container below.
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';
import { User, RefreshCw, Save, Users, Zap, BookOpen } from 'lucide-react';

const RoleMapping = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeRoleFilter, setActiveRoleFilter] = useState('participant'); 

    const roles = ['coordinator', 'evaluator', 'participant'];
    const allKnownRoles = [...roles, 'admin']; 

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/users');
            
            const mappedUsers = response.data
                // Exclude 'admin' users
                .filter(user => user.role_name && user.role_name.toLowerCase() !== 'admin')
                
                .map(user => {
                    let currentRole = user.role_name 
                                     ? user.role_name.toLowerCase() 
                                     : 'participant';

                    if (!allKnownRoles.includes(currentRole)) {
                        currentRole = 'participant'; 
                    }

                    return {
                        ...user,
                        role: currentRole, 
                        isChanged: false 
                    };
                });

            setUsers(mappedUsers);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast({ title: "Error", description: `Failed to fetch user list. Check console for API error.` });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = (userId, newRole) => {
        setUsers(prevUsers => 
            prevUsers.map(user => 
                user._id === userId ? { ...user, role: newRole, isChanged: true } : user
            )
        );
    };

    const handleSaveRole = async (user) => {
        setSaving(true);
        try {
            // Step 1: API call. Pauses until the change is saved in the database.
            await axios.put(`http://localhost:5000/api/users/${user._id}/role`, { role: user.role });
            
            // Step 2: Update the client state (Moves the card)
            setUsers(prevUsers => 
                prevUsers.map(u => {
                    if (u._id === user._id) {
                        // Card moves instantly to the new filter tab upon this state update
                        return { ...u, role: user.role, isChanged: false };
                    }
                    return u;
                })
            );
            
            // Step 3: Show success message (Only executed after successful save and state update)
            toast({ 
                title: "Success", 
                description: `Role for ${user.user_name || user.user_email} successfully updated to ${user.role}.` 
            });
        } catch (error) {
            console.error("Error updating role:", error);
            toast({ title: "Error", description: `Failed to update role for ${user.user_name || user.user_email}.` });
        } finally {
            setSaving(false);
        }
    };

    const filteredUsers = useMemo(() => {
        if (!users) return [];
        return users.filter(user => user.role && user.role.toLowerCase() === activeRoleFilter);
    }, [users, activeRoleFilter]);
    
    const getAvailableNewRoles = (currentRole) => {
        return roles.filter(role => role !== currentRole);
    };

    const roleTabMapping = [
        { name: 'participant', label: 'Participants', Icon: Users, color: 'text-blue-600', hover: 'hover:bg-blue-50' },
        { name: 'coordinator', label: 'Coordinators', Icon: Zap, color: 'text-yellow-600', hover: 'hover:bg-yellow-50' },
        { name: 'evaluator', label: 'Evaluators', Icon: BookOpen, color: 'text-green-600', hover: 'hover:bg-green-50' },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen p-8 bg-gray-50">Loading User Data...</div>
        );
    }

    return (
        // Replaced DefaultLayout with a simple div for compilation
        <div className="min-h-screen p-8 bg-gray-50">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
            >
                <h1 className="text-4xl font-bold mb-6 flex items-center">
                    <User className="w-8 h-8 mr-3 text-indigo-600" />
                    User Role Mapping
                </h1>
                
                {/* Role Filter Tabs */}
                <div className="flex space-x-4 border-b pb-2 mb-6">
                    {roleTabMapping.map(tab => (
                        <Button
                            key={tab.name}
                            variant={activeRoleFilter === tab.name ? 'default' : 'ghost'}
                            className={`capitalize ${activeRoleFilter === tab.name ? 'bg-indigo-600 text-white shadow-md' : tab.hover} text-lg`}
                            onClick={() => setActiveRoleFilter(tab.name)}
                        >
                            <tab.Icon className={`h-5 w-5 mr-2 ${activeRoleFilter !== tab.name ? tab.color : 'text-white'}`} />
                            {tab.label} ({users.filter(u => u.role && u.role.toLowerCase() === tab.name).length})
                        </Button>
                    ))}
                    <Button variant="outline" onClick={fetchUsers}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh All
                    </Button>
                </div>
                
                <h2 className="text-2xl font-semibold mb-4 capitalize">
                    {roleTabMapping.find(tab => tab.name === activeRoleFilter)?.label} List
                </h2>

                <div className="space-y-4">
                    {filteredUsers.length === 0 ? (
                        <Card><CardContent className="p-4 text-gray-500">No {activeRoleFilter}s found.</CardContent></Card>
                    ) : (
                        filteredUsers.map((user) => (
                            <Card key={user._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 shadow-sm border-l-4 border-indigo-400">
                                <CardHeader className="p-0 mb-2 sm:mb-0">
                                    <CardTitle className="text-lg font-bold">{user.user_name || 'N/A Name'}</CardTitle>
                                    <p className="text-sm text-gray-500">{user.user_email || 'N/A Email'}</p>
                                    <p className="text-xs text-gray-400">ID: {user._id}</p>
                                </CardHeader>
                                <CardContent className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 p-0">
                                    <div className="flex flex-col space-y-1">
                                        <label className="text-xs font-medium text-gray-700">Change Role:</label>
                                        <Select 
                                            value={user.role} 
                                            onValueChange={(newRole) => handleRoleChange(user._id, newRole)}
                                        >
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Select New Role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {/* Display the CURRENT role first (disabled/unselectable) */}
                                                <SelectItem 
                                                    key={user.role + '_current'} 
                                                    value={user.role} 
                                                    disabled
                                                    className="font-semibold"
                                                >
                                                    Current: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                                </SelectItem>
                                                
                                                {/* Only show roles they can be changed TO */}
                                                {getAvailableNewRoles(user.role).map(role => (
                                                    <SelectItem key={role} value={role}>
                                                        {role.charAt(0).toUpperCase() + role.slice(1)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button 
                                        onClick={() => handleSaveRole(user)}
                                        disabled={!user.isChanged || saving}
                                        className="mt-2 sm:mt-0 bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        {user.isChanged ? 'Save Role Change' : 'Role Saved'}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default RoleMapping;
