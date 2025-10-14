// pages/coordinator/TeamRegistration.jsx

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getTeamById } from '@/api/teamApi';
import { getHackathonById } from '@/api/hackathonApi';
import DefaultLayout from '@/components/DefaultLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Save, ArrowRight, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Base schema - we'll validate team size separately
const teamSchema = z.object({
    team_name: z.string().min(1, 'Team name is required.').max(100, 'Team name is too long.'),
    q_id: z.string().min(1, 'Please select a project for the team.'),
    members: z.array(z.string()).min(1, 'Please select at least one member.'),
    user_github_url: z.string()
        .min(1, 'GitHub URL is required.')
        .refine((url) => {
            try {
                const parsedUrl = new URL(url);
                return parsedUrl.hostname === 'github.com';
            } catch {
                return false;
            }
        }, 'Please provide a valid GitHub URL (https://github.com/...)'),
});

const UserListBox = ({ users, selected, setSelected, title }) => (
    <div className="space-y-3">
        <h3 className="text-xl font-semibold flex items-center gap-2 text-gray-700">
            <Users className="w-5 h-5" />
            {title}
        </h3>
        <p className="text-sm text-gray-500">
            {title.includes('Available') ? 'Participants who can be added to the team.' : 'Current team members.'}
        </p>
        <div className="border rounded-md h-80 overflow-y-auto bg-gray-50/70 p-2 shadow-inner">
            {users.length === 0 ? (
                <p className="text-center text-gray-500 py-4 text-sm">No users to display.</p>
            ) : (
                users.map(user => (
                    <div
                        key={user._id}
                        className={`p-2 cursor-pointer rounded-md mb-1 text-sm transition-all ${
                            selected.includes(user._id)
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
                        {user.user_email && (
                            <p className="text-xs text-gray-600">{user.user_email}</p>
                        )}
                    </div>
                ))
            )}
        </div>
    </div>
);

const TeamRegistration = ({ availableParticipants = [], questions = [], teamId, onSubmitTeam, onFinish }) => {
    const isEditMode = Boolean(teamId);
    const [loading, setLoading] = useState(true);
    const [hackathon, setHackathon] = useState(null);
    const [maxTeamSize, setMaxTeamSize] = useState(4); // Default fallback
    const [allQuestions] = useState(questions);
    const [selectedDomain, setSelectedDomain] = useState('');
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [availableMembers, setAvailableMembers] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [selectedFromAvailable, setSelectedFromAvailable] = useState([]);
    const [selectedFromTeam, setSelectedFromTeam] = useState([]);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [pendingFormData, setPendingFormData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Member assignment confirmation dialogs
    const [showAssignDialog, setShowAssignDialog] = useState(false);
    const [showUnassignDialog, setShowUnassignDialog] = useState(false);
    
    const { toast } = useToast();
    
    // Initialize form with base schema
    const form = useForm({ 
        resolver: zodResolver(teamSchema), 
        defaultValues: { team_name: '', user_github_url: '', q_id: '', members: [] } 
    });

    useEffect(() => {
        const initializeForm = async () => {
            setLoading(true);
            try {
                const hackathonId = localStorage.getItem('currentHackathonId');
                if (hackathonId) {
                    const hackathonData = await getHackathonById(hackathonId);
                    setHackathon(hackathonData);
                    
                    // Set max team size from hackathon limits
                    const maxMembers = hackathonData.limits?.maxMembersPerTeam || 4;
                    setMaxTeamSize(maxMembers);
                }

                if (isEditMode && teamId) {
                    const teamData = await getTeamById(teamId);
                    form.reset({
                        team_name: teamData.team_name,
                        q_id: teamData.q_id?._id || teamData.q_id,
                        user_github_url: teamData.user_github_url,
                        members: teamData.members.map(m => m._id)
                    });
                    setTeamMembers(teamData.members);
                    const teamMemberIds = new Set(teamData.members.map(m => m._id));
                    setAvailableMembers(availableParticipants.filter(p => !teamMemberIds.has(p._id)));
                } else {
                    form.reset({ team_name: '', user_github_url: '', q_id: '', members: [] });
                    setTeamMembers([]);
                    setAvailableMembers(availableParticipants);
                }
            } catch (err) {
                console.error("ERROR initializing form:", err);
                toast({ title: "Error", description: "Failed to initialize form.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        initializeForm();
    }, [teamId, isEditMode, availableParticipants, questions, form]);

    useEffect(() => {
        if (selectedDomain && hackathon) {
            const projectsInDomain = allQuestions.filter(q => q.domain === selectedDomain);
            setFilteredProjects(projectsInDomain);
        } else {
            setFilteredProjects(allQuestions);
        }
    }, [selectedDomain, allQuestions, hackathon]);

    useEffect(() => {
        const currentQuestionId = form.getValues('q_id');
        if (currentQuestionId && !filteredProjects.some(p => p._id === currentQuestionId)) {
            form.setValue('q_id', '');
        }
    }, [filteredProjects, form]);
    
    const handleAssignClick = () => {
        if (selectedFromAvailable.length === 0) return;
        
        if (teamMembers.length + selectedFromAvailable.length > maxTeamSize) {
            toast({ 
                title: "Team Size Limit", 
                description: `You cannot add more than ${maxTeamSize} members. Current: ${teamMembers.length}, Trying to add: ${selectedFromAvailable.length}`, 
                variant: "destructive" 
            });
            return;
        }
        
        setShowAssignDialog(true);
    };

    const handleUnassignClick = () => {
        if (selectedFromTeam.length === 0) return;
        setShowUnassignDialog(true);
    };

    const handleAssignConfirm = () => {
        const toAssign = availableMembers.filter(m => selectedFromAvailable.includes(m._id));
        setTeamMembers(prev => [...prev, ...toAssign]);
        setAvailableMembers(prev => prev.filter(m => !selectedFromAvailable.includes(m._id)));
        setSelectedFromAvailable([]);
        setShowAssignDialog(false);
        
        toast({
            title: "Members Added",
            description: `${toAssign.length} member(s) added to the team.`,
        });
    };

    const handleUnassignConfirm = () => {
        const toUnassign = teamMembers.filter(m => selectedFromTeam.includes(m._id));
        setAvailableMembers(prev => [...prev, ...toUnassign]);
        setTeamMembers(prev => prev.filter(m => !selectedFromTeam.includes(m._id)));
        setSelectedFromTeam([]);
        setShowUnassignDialog(false);
        
        toast({
            title: "Members Removed",
            description: `${toUnassign.length} member(s) removed from the team.`,
        });
    };

    useEffect(() => {
        form.setValue('members', teamMembers.map(m => m._id), { shouldValidate: true });
    }, [teamMembers, form]);

    const uniqueDomains = [...new Set(allQuestions.map(q => q.domain))];
    
    // Check if no questions are available for this hackathon
    const hasNoQuestions = allQuestions.length === 0;

    const onSubmit = async (data) => {
        console.log('Form submitted with data:', data);
        console.log('Team members:', teamMembers);
        console.log('Available questions:', allQuestions);
        
        // Custom validation for team size
        if (data.members.length > maxTeamSize) {
            toast({
                title: "Team Size Error",
                description: `You can select a maximum of ${maxTeamSize} members.`,
                variant: "destructive"
            });
            return;
        }
        
        // Validate that we have all required data
        const hackathonId = localStorage.getItem('currentHackathonId');
        const coordinatorId = localStorage.getItem('userId');
        
        if (!hackathonId) {
            toast({
                title: "Error",
                description: "No hackathon selected. Please refresh and try again.",
                variant: "destructive"
            });
            return;
        }
        
        if (!coordinatorId) {
            toast({
                title: "Error", 
                description: "User not authenticated. Please log in again.",
                variant: "destructive"
            });
            return;
        }
        
        // Store form data and show confirmation dialog
        const payload = { 
            ...data, 
            hackathon_id: hackathonId, 
            coordinator_id: coordinatorId 
        };
        
        console.log('Prepared payload:', payload);
        setPendingFormData(payload);
        setShowConfirmDialog(true);
    };

    const handleConfirmSubmit = async () => {
        if (!pendingFormData || isSubmitting) return;
        
        try {
            setIsSubmitting(true);
            setShowConfirmDialog(false);
            console.log('Submitting team data:', pendingFormData);
            
            // Validate required fields before submission
            if (!pendingFormData.team_name || !pendingFormData.members || pendingFormData.members.length === 0) {
                throw new Error('Missing required team information');
            }
            
            await onSubmitTeam(pendingFormData);
            setPendingFormData(null);
            
            toast({
                title: "Success",
                description: `Team "${pendingFormData.team_name}" ${isEditMode ? 'updated' : 'registered'} successfully!`,
            });
        } catch (error) {
            console.error('Team submission error:', error);
            toast({
                title: "Error",
                description: error.response?.data?.message || error.message || "Failed to save team. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelSubmit = () => {
        setShowConfirmDialog(false);
        setPendingFormData(null);
    };
    
    if (loading) return <div className="p-8"><Skeleton className="h-96" /></div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent flex items-center gap-3"><Users/> {isEditMode ? 'Edit Team' : 'Register New Team'}</CardTitle>
                    <CardDescription>For hackathon: <strong className="text-blue-600">{hackathon?.hackathon_name}</strong></CardDescription>
                </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                <FormField control={form.control} name="team_name" render={({ field }) => ( <FormItem><FormLabel>1. Team Name</FormLabel><FormControl><Input placeholder="e.g., The Code Crusaders" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                {hasNoQuestions ? (
                                    <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Projects Available</h3>
                                        <p className="text-yellow-700 mb-3">
                                            No projects have been assigned to this hackathon yet. Please contact an administrator to:
                                        </p>
                                        <ul className="list-disc list-inside text-sm text-yellow-600 space-y-1">
                                            <li>Create projects in the "Manage Titles" section</li>
                                            <li>Assign projects to this hackathon using "Manage Questions"</li>
                                        </ul>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormItem>
                                            <FormLabel>2. Select Project Domain</FormLabel>
                                            <Select onValueChange={setSelectedDomain} value={selectedDomain}><FormControl><SelectTrigger><SelectValue placeholder="Choose a domain..." /></SelectTrigger></FormControl><SelectContent>{uniqueDomains.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>
                                        </FormItem>
                                        <FormField control={form.control} name="q_id" render={({ field }) => ( <FormItem><FormLabel>3. Assign Project</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={!selectedDomain && filteredProjects.length === 0}><FormControl><SelectTrigger><SelectValue placeholder="Select a project..." /></SelectTrigger></FormControl><SelectContent>{filteredProjects.length > 0 ? (filteredProjects.map(p => <SelectItem key={p._id} value={p._id}>{p.q_title}</SelectItem>)) : (<div className="p-4 text-sm text-center text-gray-500">No projects in this domain.</div>)}</SelectContent></Select><FormMessage /></FormItem> )}/>
                                    </div>
                                )}
                                <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-xl">
                                    <CardHeader>
                                        <CardTitle className="text-xl font-bold text-gray-800">
                                            4. Team Member Assignment
                                        </CardTitle>
                                        <CardDescription>
                                            Current team size: <span className="font-semibold text-blue-600">{teamMembers.length} / {maxTeamSize}</span> members
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                                            <UserListBox 
                                                title="Available Participants" 
                                                users={availableMembers} 
                                                selected={selectedFromAvailable} 
                                                setSelected={setSelectedFromAvailable} 
                                            />
                                            
                                            <div className="flex lg:flex-col justify-center gap-4">
                                                <Button 
                                                    type="button" 
                                                    onClick={handleAssignClick} 
                                                    disabled={selectedFromAvailable.length === 0}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    Add to Team <ArrowRight className="w-4 h-4 ml-2" />
                                                </Button>
                                                <Button 
                                                    type="button" 
                                                    onClick={handleUnassignClick} 
                                                    disabled={selectedFromTeam.length === 0} 
                                                    variant="destructive"
                                                    className="bg-red-600 hover:bg-red-700"
                                                >
                                                    <ArrowLeft className="w-4 h-4 mr-2" /> Remove from Team
                                                </Button>
                                            </div>
                                            
                                            <UserListBox 
                                                title="Team Members" 
                                                users={teamMembers} 
                                                selected={selectedFromTeam} 
                                                setSelected={setSelectedFromTeam} 
                                            />
                                        </div>
                                        <FormMessage className="mt-4">{form.formState.errors.members?.message}</FormMessage>
                                    </CardContent>
                                </Card>
                                <FormField control={form.control} name="user_github_url" render={({ field }) => ( <FormItem><FormLabel>5. Team GitHub URL</FormLabel><FormControl><Input placeholder="https://github.com/team/repo" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                <div className="flex justify-end space-x-4 pt-4">
                                    <Button type="button" variant="outline" onClick={onFinish} disabled={isSubmitting}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={form.formState.isSubmitting || hasNoQuestions || isSubmitting}>
                                        <Save className="w-4 h-4 mr-2" /> 
                                        {hasNoQuestions ? "No Projects Available" : 
                                         (form.formState.isSubmitting || isSubmitting) ? (isEditMode ? "Saving..." : "Registering...") : 
                                         (isEditMode ? "Save Changes" : "Register Team")}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                {/* Confirmation Dialog */}
                <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                    <AlertDialogContent className="max-w-md">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                                Confirm Team {isEditMode ? 'Update' : 'Registration'}
                            </AlertDialogTitle>
                            <AlertDialogDescription className="space-y-3">
                                <div>
                                    Are you sure you want to {isEditMode ? 'update' : 'register'} the team{' '}
                                    <span className="font-semibold text-blue-600">
                                        "{pendingFormData?.team_name}"
                                    </span>?
                                </div>
                                
                                <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                                    <p className="text-sm text-blue-800 font-medium mb-2">
                                        📋 Team Details:
                                    </p>
                                    <ul className="text-sm text-blue-700 space-y-1">
                                        <li><strong>Team Name:</strong> {pendingFormData?.team_name}</li>
                                        <li><strong>Members:</strong> {teamMembers.length} selected</li>
                                        <li><strong>Project:</strong> {
                                            pendingFormData?.q_id ? 
                                            allQuestions.find(q => q._id === pendingFormData.q_id)?.q_title || 'Selected' 
                                            : 'None selected'
                                        }</li>
                                        <li><strong>GitHub URL:</strong> {pendingFormData?.user_github_url}</li>
                                    </ul>
                                </div>

                                {teamMembers.length > 0 && (
                                    <div className="bg-green-50 p-3 rounded-md border border-green-200">
                                        <p className="text-sm text-green-800 font-medium mb-2">
                                            👥 Team Members:
                                        </p>
                                        <div className="text-sm text-green-700">
                                            {teamMembers.map((member, index) => (
                                                <span key={member._id}>
                                                    {member.user_name}
                                                    {index < teamMembers.length - 1 ? ', ' : ''}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={handleCancelSubmit}>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction onClick={handleConfirmSubmit} disabled={isSubmitting}>
                                {isSubmitting ? 'Processing...' : (isEditMode ? 'Update Team' : 'Register Team')}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Member Assignment Confirmation Dialog */}
                <AlertDialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
                    <AlertDialogContent className="max-w-md">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-green-500" />
                                Confirm Member Assignment
                            </AlertDialogTitle>
                            <AlertDialogDescription className="space-y-3">
                                <div>
                                    Are you sure you want to add{' '}
                                    <span className="font-semibold text-green-600">
                                        {selectedFromAvailable.length === 1 
                                            ? availableMembers.find(u => u._id === selectedFromAvailable[0])?.user_name
                                            : `${selectedFromAvailable.length} members`
                                        }
                                    </span>{' '}
                                    to the team?
                                </div>
                                
                                <div className="bg-green-50 p-3 rounded-md border border-green-200">
                                    <p className="text-sm text-green-800 font-medium mb-2">
                                        👥 Members to Add:
                                    </p>
                                    <div className="text-sm text-green-700 space-y-1">
                                        {selectedFromAvailable.map(userId => {
                                            const user = availableMembers.find(u => u._id === userId);
                                            return (
                                                <div key={userId} className="flex justify-between">
                                                    <span>{user?.user_name}</span>
                                                    {user?.user_email && (
                                                        <span className="text-xs text-green-600">{user.user_email}</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                                    <p className="text-sm text-blue-800">
                                        <strong>Team Size:</strong> {teamMembers.length} + {selectedFromAvailable.length} = {teamMembers.length + selectedFromAvailable.length} / {maxTeamSize}
                                    </p>
                                </div>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleAssignConfirm}>
                                Add to Team
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Member Removal Confirmation Dialog */}
                <AlertDialog open={showUnassignDialog} onOpenChange={setShowUnassignDialog}>
                    <AlertDialogContent className="max-w-md">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                                Confirm Member Removal
                            </AlertDialogTitle>
                            <AlertDialogDescription className="space-y-3">
                                <div>
                                    Are you sure you want to remove{' '}
                                    <span className="font-semibold text-red-600">
                                        {selectedFromTeam.length === 1 
                                            ? teamMembers.find(u => u._id === selectedFromTeam[0])?.user_name
                                            : `${selectedFromTeam.length} members`
                                        }
                                    </span>{' '}
                                    from the team?
                                </div>
                                
                                <div className="bg-red-50 p-3 rounded-md border border-red-200">
                                    <p className="text-sm text-red-800 font-medium mb-2">
                                        👥 Members to Remove:
                                    </p>
                                    <div className="text-sm text-red-700 space-y-1">
                                        {selectedFromTeam.map(userId => {
                                            const user = teamMembers.find(u => u._id === userId);
                                            return (
                                                <div key={userId} className="flex justify-between">
                                                    <span>{user?.user_name}</span>
                                                    {user?.user_email && (
                                                        <span className="text-xs text-red-600">{user.user_email}</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                                    <p className="text-sm text-blue-800">
                                        <strong>New Team Size:</strong> {teamMembers.length} - {selectedFromTeam.length} = {teamMembers.length - selectedFromTeam.length} / {maxTeamSize}
                                    </p>
                                </div>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleUnassignConfirm} className="bg-red-600 hover:bg-red-700">
                                Remove from Team
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
};

export default TeamRegistration;