import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import DefaultLayout from '@/components/DefaultLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const RoleMapping = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);

    const roleMap = {
        '68d1f869ce0af1a5778f50bd': 'Admin',
        '68d1f878ce0af1a5778f50bf': 'Coordinator',
        '68d1f884ce0af1a5778f50c1': 'Participant',
        '68d1f88fce0af1a5778f50c3': 'Evaluator',
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, rolesRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/users'),
                    axios.get('http://localhost:5000/api/roles')
                ]);
                setUsers(usersRes.data);
                setRoles(rolesRes.data);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast({ title: "Error", description: "Could not fetch user data." });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleRoleChange = async (userId, newRoleId) => {
        try {
            await axios.put(`http://localhost:5000/api/users/${userId}/role`, { role_id: newRoleId });
            setUsers(users.map(user => user._id === userId ? { ...user, role_id: newRoleId } : user));
            toast({ title: "Success", description: "User role updated successfully." });
        } catch (error) {
            console.error("Error updating role:", error);
            toast({ title: "Error", description: "Failed to update role." });
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <DefaultLayout userRole="admin">
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">User Role Management</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Current Role</TableHead>
                                        <TableHead>Change Role</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map(user => (
                                        <TableRow key={user._id}>
                                            <TableCell>{user.user_name}</TableCell>
                                            <TableCell>{user.user_email}</TableCell>
                                            <TableCell>{roleMap[user.role_id] || 'N/A'}</TableCell>
                                            <TableCell>
                                                <Select onValueChange={(newRoleId) => handleRoleChange(user._id, newRoleId)}>
                                                    <SelectTrigger className="w-[180px]">
                                                        <SelectValue placeholder="Select a role" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {roles.map(role => (
                                                            <SelectItem key={role._id} value={role._id}>
                                                                {role.role_name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </DefaultLayout>
    );
};

export default RoleMapping;