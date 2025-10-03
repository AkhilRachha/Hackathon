import { useEffect, useState } from 'react';
import DefaultLayout from '@/components/DefaultLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams, useNavigate } from 'react-router-dom';
import { getHackathonById, declareWinners } from '@/api/hackathonApi'; 
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { 
    MapPin, Users, User, Clock, 
    Code, Mail, Phone, Hash, 
    ArrowLeft, ClipboardList, CheckCircle, Award
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge'; 
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';

// ------------------------------------------------------------------
// Helper Components (ManagementCard, UserDetailCard, TeamDetailCard)
// ------------------------------------------------------------------

const ManagementCard = ({ title, count, icon: Icon, color }) => (
    <Card className={`shadow-lg border-l-4 ${color}`}>
        <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-3xl font-bold text-gray-800">{count}</p>
            </div>
            <Icon className={`w-8 h-8 ${color.replace('border-l-4', '').replace('border-', 'text-')}`} />
        </CardContent>
    </Card>
);

const UserDetailCard = ({ user }) => (
    <Card className="p-3 shadow-sm border">
        <div className="flex justify-between items-center">
            <div className="space-y-0.5">
                <p className="font-semibold text-gray-800">{user.user_name}</p>
                <div className="flex items-center text-sm text-gray-600 space-x-2">
                    <Mail className="w-3 h-3" />
                    <a href={`mailto:${user.user_email}`} className="hover:underline">{user.user_email}</a>
                </div>
                {user.user_phoneno && (
                    <div className="flex items-center text-sm text-gray-600 space-x-2">
                        <Phone className="w-3 h-3" />
                        <span>{user.user_phoneno}</span>
                    </div>
                )}
            </div>
            <div className="text-xs font-medium text-right">
                <span className={`px-2 py-0.5 rounded-full capitalize ${
                    user.role_name === 'coordinator' ? 'bg-indigo-100 text-indigo-800' : 
                    user.role_name === 'evaluator' ? 'bg-red-100 text-red-800' : 
                    'bg-green-100 text-green-800'
                }`}>
                    {user.role_name}
                </span>
                {user.team_name && <p className="text-xs text-gray-500 mt-1">Team: {user.team_name}</p>}
            </div>
        </div>
    </Card>
);

const TeamDetailCard = ({ team }) => (
    <Card className="p-4 shadow-sm border border-blue-200 bg-blue-50/50">
        <div className="space-y-3">
            <div className="flex justify-between items-start">
                <p className="font-bold text-lg text-blue-800">{team.team_name}</p>
                <Badge variant="outline" className="text-sm flex items-center gap-1">
                    <Hash className="w-3 h-3" /> {team._id.slice(-4)}
                </Badge>
            </div>
            <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700">Members ({team.members.length}):</p>
                <div className="flex flex-wrap gap-2">
                    {team.members.map(member => (
                        <span key={member._id} className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                            {member.user_name}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    </Card>
);

// ➡️ NEW: Declare Winners Modal Component
const DeclareWinnersModal = ({ hackathonId, teams, currentWinners, onSuccess }) => {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    
    // Default values are set to the current populated winner IDs
    const form = useForm({
        defaultValues: {
            firstPlace: currentWinners?.firstPlace?._id || '',
            secondPlace: currentWinners?.secondPlace?._id || '',
            thirdPlace: currentWinners?.thirdPlace?._id || '',
        }
    });

    const onSubmit = async (data) => {
        try {
            if (data.firstPlace === data.secondPlace && data.firstPlace !== '') {
                return toast({ title: "Validation Error", description: "First and second place must be unique.", variant: 'destructive' });
            }
            if (data.firstPlace === data.thirdPlace && data.firstPlace !== '') {
                return toast({ title: "Validation Error", description: "First and third place must be unique.", variant: 'destructive' });
            }
            if (data.secondPlace === data.thirdPlace && data.secondPlace !== '') {
                return toast({ title: "Validation Error", description: "Second and third place must be unique.", variant: 'destructive' });
            }
            
            const response = await declareWinners(hackathonId, {
                firstPlace: data.firstPlace || null,
                secondPlace: data.secondPlace || null,
                thirdPlace: data.thirdPlace || null,
            });

            toast({
                title: "Success",
                description: response.data.message,
            });
            setIsOpen(false);
            onSuccess(); // Trigger parent component to re-fetch data
        } catch (error) {
            toast({
                title: "Error Declaring Winners",
                description: error.response?.data?.message || "Failed to submit winner data.",
                variant: 'destructive'
            });
        }
    };

    const teamOptions = teams.map(team => ({
        id: team._id,
        name: team.team_name,
    }));
    
    // Add "No Winner" option
    teamOptions.unshift({ id: '', name: '--- No Winner / Clear Selection ---' });


    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button 
                    className="w-full justify-start bg-red-600 hover:bg-red-700"
                >
                    <Award className="w-4 h-4 mr-2" /> Declare / Edit Winners
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Declare Hackathon Winners</DialogTitle>
                    <CardDescription>Select the top three teams for this completed event.</CardDescription>
                </DialogHeader>
                
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                    {['firstPlace', 'secondPlace', 'thirdPlace'].map((place, index) => (
                        <div key={place}>
                            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                                {index + 1}{index === 0 ? 'st' : index === 1 ? 'nd' : 'rd'} Place Team
                            </label>
                            <Select 
                                onValueChange={(value) => form.setValue(place, value)} 
                                // Use the populated value if available, otherwise use the form state
                                defaultValue={currentWinners?.[place]?._id || form.watch(place) || ''}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={`Select ${place} team`} />
                                </SelectTrigger>
                                <SelectContent>
                                    {teamOptions.map(option => (
                                        <SelectItem key={option.id} value={option.id}>
                                            {option.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ))}
                    
                    <DialogFooter className="pt-4">
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? 'Submitting...' : 'Confirm Winners'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};


const HackathonManagement = () => {
    const { hackathonId } = useParams();
    const navigate = useNavigate();
    const [hackathonData, setHackathonData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    // Function to fetch data and refresh the component
    const fetchHackathonDetails = async () => {
        setLoading(true);
        try {
            const response = await getHackathonById(hackathonId);
            setHackathonData(response.data);
        } catch (error) {
            toast({
                title: "Error",
                description: `Failed to fetch management details for Hackathon ID: ${hackathonId}.`,
                variant: "destructive",
            });
            navigate('/admin/view-hackathon'); 
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHackathonDetails();
    }, [hackathonId]);


    if (loading) {
        return (
            <DefaultLayout userRole="admin">
                <div className="p-8 max-w-7xl mx-auto"><Skeleton className="h-[600px] w-full" /></div>
            </DefaultLayout>
        );
    }

    if (!hackathonData) {
        return null; 
    }

    const { title, startDate, endDate, venue, status, counts, managementLists, winners } = hackathonData;
    const { coordinators, evaluators, participants, teams } = managementLists;

    return (
        <DefaultLayout userRole="admin">
            <div className="p-8 max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <Button onClick={() => navigate('/admin/view-hackathon')} variant="outline">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Hackathon List
                    </Button>
                    <h1 className="text-4xl font-extrabold text-gray-800">
                        Hackathon Management
                    </h1>
                </div>

                <Card className="shadow-xl">
                    <CardHeader className="bg-gray-50/70">
                        <CardTitle className="text-3xl font-bold text-blue-700">{title}</CardTitle>
                        <CardDescription className="text-lg">
                            Status: <span className={`font-semibold capitalize ${status === 'active' ? 'text-green-600' : status === 'upcoming' ? 'text-blue-600' : 'text-gray-600'}`}>{status}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700 font-medium">
                            <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500" /> Start: {format(new Date(startDate), 'MMM d, yyyy @ h:mm a')}</p>
                            <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-red-500" /> End: {format(new Date(endDate), 'MMM d, yyyy @ h:mm a')}</p>
                            <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-indigo-500" /> Venue: {venue}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* COUNTS SECTION */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <ManagementCard title="Total Participants" count={counts.participants} icon={User} color="border-yellow-500" />
                    <ManagementCard title="Total Teams" count={counts.teams} icon={Code} color="border-blue-500" />
                    <ManagementCard title="Coordinators" count={counts.coordinators} icon={Users} color="border-indigo-500" />
                    <ManagementCard title="Evaluators" count={counts.evaluators} icon={ClipboardList} color="border-red-500" />
                </div>
                
                {/* DETAILED LISTS & ACTIONS SECTION */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT COLUMN: Lists */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader><CardTitle>Registered Staff & Teams</CardTitle></CardHeader>
                            <CardContent>
                                <Accordion type="multiple" className="w-full">
                                    {/* COORDINATORS LIST */}
                                    <AccordionItem value="item-1">
                                        <AccordionTrigger className="font-semibold text-lg text-indigo-700">
                                            Coordinators ({counts.coordinators})
                                        </AccordionTrigger>
                                        <AccordionContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {coordinators.length > 0 ? coordinators.map(user => (
                                                <UserDetailCard key={user._id} user={user} />
                                            )) : <p className="text-gray-500">No coordinators registered for this event.</p>}
                                        </AccordionContent>
                                    </AccordionItem>

                                    {/* TEAMS LIST */}
                                    <AccordionItem value="item-2">
                                        <AccordionTrigger className="font-semibold text-lg text-blue-700">
                                            Teams ({counts.teams})
                                        </AccordionTrigger>
                                        <AccordionContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {teams.length > 0 ? teams.map(team => (
                                                <TeamDetailCard key={team._id} team={team} />
                                            )) : <p className="text-gray-500">No teams registered yet.</p>}
                                        </AccordionContent>
                                    </AccordionItem>

                                    {/* EVALUATORS LIST */}
                                    <AccordionItem value="item-3">
                                        <AccordionTrigger className="font-semibold text-lg text-red-700">
                                            Evaluators ({counts.evaluators})
                                        </AccordionTrigger>
                                        <AccordionContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {evaluators.length > 0 ? evaluators.map(user => (
                                                <UserDetailCard key={user._id} user={user} />
                                            )) : <p className="text-gray-500">No evaluators assigned yet.</p>}
                                        </AccordionContent>
                                    </AccordionItem>

                                    {/* PARTICIPANTS LIST (Full List) */}
                                    <AccordionItem value="item-4">
                                        <AccordionTrigger className="font-semibold text-lg text-yellow-700">
                                            All Participants ({counts.participants})
                                        </AccordionTrigger>
                                        <AccordionContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {participants.length > 0 ? participants.map(user => (
                                                <UserDetailCard key={user._id} user={user} />
                                            )) : <p className="text-gray-500">No participants found in teams.</p>}
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN: Action Links */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader><CardTitle className="text-xl">Hackathon Actions</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                <Button 
                                    onClick={() => navigate('/admin/role-mapping')} 
                                    className="w-full justify-start bg-indigo-600 hover:bg-indigo-700"
                                >
                                    <User className="w-4 h-4 mr-2" /> Coordinator/Evaluator Mapping
                                </Button>
                                <Button 
                                    onClick={() => navigate('/admin/titles')} 
                                    className="w-full justify-start bg-blue-600 hover:bg-blue-700"
                                >
                                    <ClipboardList className="w-4 h-4 mr-2" /> View/Edit Domains & Criteria
                                </Button>
                                {/* WINNER DECLARATION BUTTON (MODAL) */}
                                {status === 'completed' ? (
                                    <DeclareWinnersModal 
                                        hackathonId={hackathonId}
                                        teams={teams}
                                        currentWinners={winners}
                                        onSuccess={fetchHackathonDetails} // Refresh data after submission
                                    />
                                ) : (
                                    <Button 
                                        variant="outline"
                                        disabled
                                        className="w-full justify-start text-gray-500 border-gray-300"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" /> Winner Declaration (Event {status})
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DefaultLayout>
    );
};

export default HackathonManagement;