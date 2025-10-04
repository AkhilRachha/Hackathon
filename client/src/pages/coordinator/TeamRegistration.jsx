import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import DefaultLayout from '@/components/DefaultLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Save, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createTeam } from '@/api/teamApi';
import { getAllUsers } from '@/api/userApi';
import { getHackathonById } from '@/api/hackathonApi';
import { getAllQuestions } from '@/api/questionApi';

const teamSchema = z.object({
    team_name: z.string().min(1, 'Team name is required'),
    members: z.array(z.string()).min(1, 'Please select at least one member'),
    q_id: z.string().min(1, 'Please select a project for the team'),
});

const TeamRegistration = ({ onRegisterTeam, onCancel }) => {
    const [loading, setLoading] = useState(true);
    const [hackathon, setHackathon] = useState(null);
    const [availableProjects, setAvailableProjects] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const { toast } = useToast();
    const navigate = useNavigate();

    const form = useForm({
        resolver: zodResolver(teamSchema),
        defaultValues: { team_name: '', members: [], q_id: '' }
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const currentHackathonId = localStorage.getItem('currentHackathonId');
                if (!currentHackathonId) {
                    toast({ title: "Error", description: "No active hackathon selected for context.", variant: "destructive" });
                    navigate('/coordinator');
                    return;
                }

                const [hackathonData, allQuestions, allUsers] = await Promise.all([
                    getHackathonById(currentHackathonId),
                    getAllQuestions(),
                    getAllUsers(),
                ]);

                setHackathon(hackathonData);
                
                const participants = allUsers.filter(u => u.role_name === 'participant' && !u.current_hackathon);
                setAvailableUsers(participants);

                // --- ⬇️ KEY LOGIC HERE ⬇️ ---
                // Get the array of mapped question IDs from the hackathon data
                const mappedQuestionIds = new Set(hackathonData.questions || []);

                // Filter the master list of all questions to get only the mapped ones
                const filteredProjects = allQuestions.filter(q => mappedQuestionIds.has(q._id));
                setAvailableProjects(filteredProjects);
                // --- ⬆️ END OF KEY LOGIC ⬆️ ---

            } catch (error) {
                toast({ title: "Error", description: "Failed to load necessary data.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [toast, navigate]);
    
    const handleMemberToggle = (userId) => {
        const newSelected = selectedMembers.includes(userId)
            ? selectedMembers.filter(id => id !== userId)
            : [...selectedMembers, userId];
        
        setSelectedMembers(newSelected);
        form.setValue('members', newSelected, { shouldValidate: true });
    };

    const onSubmit = (data) => {
        onRegisterTeam(data);
    };
    
    if (loading) {
        return <DefaultLayout><Skeleton className="h-96 m-8" /></DefaultLayout>;
    }

    return (
        <DefaultLayout userRole="coordinator">
            <div className="p-4 md:p-8 max-w-4xl mx-auto">
                <Card className="shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold flex items-center gap-3">
                            <Users/> Register New Team
                        </CardTitle>
                        <CardDescription>
                            Creating a team for the hackathon: <strong className="text-blue-600">{hackathon?.title}</strong>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField control={form.control} name="team_name" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Team Name</FormLabel>
                                        <FormControl><Input placeholder="e.g., The Code Crusaders" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                
                                <FormField control={form.control} name="q_id" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Assign Project</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Choose from projects mapped to this hackathon..." /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {availableProjects.length > 0 ? (
                                                    availableProjects.map(project => (
                                                        <SelectItem key={project._id} value={project._id}>{project.q_title}</SelectItem>
                                                    ))
                                                ) : (
                                                    <div className="p-4 text-sm text-center text-gray-500">
                                                        No projects have been mapped to this hackathon.
                                                        <br />
                                                        An admin must assign questions first.
                                                    </div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <div>
                                    <Label>Select Members ({selectedMembers.length} selected)</Label>
                                    <div className="mt-2 border rounded-md h-60 overflow-y-auto p-2 space-y-1 bg-gray-50 shadow-inner">
                                        {availableUsers.length > 0 ? availableUsers.map(user => (
                                            <div key={user._id} onClick={() => handleMemberToggle(user._id)} 
                                                 className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${selectedMembers.includes(user._id) ? 'bg-blue-100 text-blue-800 font-semibold' : 'hover:bg-gray-100'}`}>
                                                {selectedMembers.includes(user._id) && <Check className="w-4 h-4 mr-2 text-blue-600"/>}
                                                <span>{user.user_name} ({user.user_email})</span>
                                            </div>
                                        )) : <p className="text-center text-gray-500 p-4">No available participants found.</p>}
                                    </div>
                                    <FormMessage className="mt-2">{form.formState.errors.members?.message}</FormMessage>
                                </div>

                                <div className="flex justify-end space-x-4 pt-4">
                                    <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                                    <Button type="submit" disabled={form.formState.isSubmitting}>
                                        <Save className="w-4 h-4 mr-2" /> 
                                        {form.formState.isSubmitting ? "Registering..." : "Register Team"}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </DefaultLayout>
    );
};

export default TeamRegistration;