import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Plus, Trash2, Save } from 'lucide-react';
import DefaultLayout from '@/components/DefaultLayout';
import { useToast } from '@/hooks/use-toast';
import { createTeam } from '@/api/teamApi';
import { getAllUsers } from '@/api/userApi';
import api from '@/api/axiosInstance';

// Validation schema
const teamSchema = z.object({
    team_name: z.string().min(1, 'Team name is required'),
    max_members: z.number().min(2, 'Team must have at least 2 members').max(6, 'Team cannot have more than 6 members'),
    user_github_url: z.string().url('Please enter a valid GitHub URL'),
    q_id: z.string().min(1, 'Please select a project'),
    members: z.array(z.string()).min(1, 'Team must have at least one member')
});

const TeamRegistration = () => {
    const [loading, setLoading] = useState(true);
    const [domains, setDomains] = useState([]);
    const [selectedDomain, setSelectedDomain] = useState('');
    const [availableProjects, setAvailableProjects] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const { toast } = useToast();
    const navigate = useNavigate();

    const form = useForm({
        resolver: zodResolver(teamSchema),
        defaultValues: {
            team_name: '',
            max_members: 4,
            user_github_url: '',
            q_id: '',
            members: []
        }
    });

    // Fetch domains and projects
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [domainsRes, usersRes] = await Promise.all([
                    api.get('/api/hackathons/domains-and-questions'),
                    api.get('/api/users/participants/available')
                ]);

                setDomains(domainsRes.data);
                setAvailableUsers(usersRes.data);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast({
                    title: "Error",
                    description: "Failed to load data. Please try again.",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [toast]);

    // Update available projects when domain changes
    useEffect(() => {
        if (selectedDomain) {
            const domain = domains.find(d => d.name === selectedDomain);
            setAvailableProjects(domain ? domain.projects : []);
        } else {
            setAvailableProjects([]);
        }
    }, [domains, selectedDomain]);

    const handleAddMember = (userId) => {
        if (!selectedMembers.includes(userId)) {
            const newMembers = [...selectedMembers, userId];
            setSelectedMembers(newMembers);
            form.setValue('members', newMembers);
        }
    };

    const handleRemoveMember = (userId) => {
        const newMembers = selectedMembers.filter(id => id !== userId);
        setSelectedMembers(newMembers);
        form.setValue('members', newMembers);
    };

    const onSubmit = async (data) => {
        try {
            const currentHackathonId = localStorage.getItem('currentHackathonId');
            if (!currentHackathonId) {
                toast({
                    title: "Error",
                    description: "No active hackathon found. Please join a hackathon first.",
                    variant: "destructive"
                });
                return;
            }

            const teamData = {
                ...data,
                hackathon_id: currentHackathonId,
                members: selectedMembers
            };

            await createTeam(teamData);

            toast({
                title: "Success",
                description: "Team registered successfully!"
            });

            navigate('/coordinator');
        } catch (error) {
            console.error('Error creating team:', error);
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to create team. Please try again.",
                variant: "destructive"
            });
        }
    };

    if (loading) {
        return (
            <DefaultLayout userRole="coordinator">
                <div className="p-8 max-w-4xl mx-auto">
                    <Skeleton className="h-64 w-full" />
                </div>
            </DefaultLayout>
        );
    }

    return (
        <DefaultLayout userRole="coordinator">
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-4xl mx-auto"
                >
                    <Card className="shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-3xl font-bold text-blue-700 flex items-center">
                                <Users className="w-8 h-8 mr-3" />
                                Team Registration
                            </CardTitle>
                            <CardDescription className="text-lg">
                                Create and register your hackathon team
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    {/* Team Name */}
                                    <FormField
                                        control={form.control}
                                        name="team_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Team Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter team name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Max Members */}
                                    <FormField
                                        control={form.control}
                                        name="max_members"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Maximum Members</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        type="number" 
                                                        min="2" 
                                                        max="6" 
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* GitHub URL */}
                                    <FormField
                                        control={form.control}
                                        name="user_github_url"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>GitHub Repository URL</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="https://github.com/username/repo" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Domain Selection */}
                                    <div className="space-y-2">
                                        <Label>Select Domain</Label>
                                        <Select onValueChange={setSelectedDomain} value={selectedDomain}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose a domain" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {domains.map((domain) => (
                                                    <SelectItem key={domain.name} value={domain.name}>
                                                        {domain.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Project Selection */}
                                    <FormField
                                        control={form.control}
                                        name="q_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Select Project</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value} disabled={!selectedDomain}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Choose a project" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {availableProjects.map((project) => (
                                                            <SelectItem key={project._id} value={project._id}>
                                                                {project.title}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Team Members */}
                                    <div className="space-y-4">
                                        <Label>Team Members</Label>
                                        
                                        {/* Available Users */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <h4 className="font-semibold mb-2">Available Participants</h4>
                                                <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
                                                    {availableUsers.filter(user => !selectedMembers.includes(user._id)).map((user) => (
                                                        <div key={user._id} className="flex justify-between items-center p-2 border rounded">
                                                            <div>
                                                                <p className="font-medium">{user.user_name}</p>
                                                                <p className="text-sm text-gray-500">{user.user_email}</p>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                onClick={() => handleAddMember(user._id)}
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Selected Members */}
                                            <div>
                                                <h4 className="font-semibold mb-2">Selected Members ({selectedMembers.length})</h4>
                                                <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
                                                    {selectedMembers.map((memberId) => {
                                                        const user = availableUsers.find(u => u._id === memberId);
                                                        return user ? (
                                                            <div key={user._id} className="flex justify-between items-center p-2 border rounded bg-blue-50">
                                                                <div>
                                                                    <p className="font-medium">{user.user_name}</p>
                                                                    <p className="text-sm text-gray-500">{user.user_email}</p>
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    onClick={() => handleRemoveMember(user._id)}
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        ) : null;
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex justify-end space-x-4">
                                        <Button type="button" variant="outline" onClick={() => navigate('/coordinator')}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                            <Save className="w-4 h-4 mr-2" />
                                            Register Team
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </DefaultLayout>
    );
};

export default TeamRegistration;