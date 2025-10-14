import { useEffect, useState } from 'react';
import DefaultLayout from '@/components/DefaultLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams, useNavigate } from 'react-router-dom';
import { getHackathonById } from '@/api/hackathonApi';
import { makeAllTeamsEvaluationReady, getTeamsEvaluationStatus } from '@/api/teamApi';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { MapPin, Users, User, Clock, Code, Mail, Phone, Hash, ArrowLeft, ClipboardList, Award, CheckCircle, AlertCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';


// --- Helper Components (Full code included for completeness) ---

const ManagementCard = ({ title, count, icon: Icon, color }) => (
    <Card className={`shadow-lg border-l-4 ${color}`}>
        <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-3xl font-bold text-gray-800">{count}</p>
            </div>
            <Icon className={`w-8 h-8 text-${color.split('-')[1]}-500`} />
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
                <span className={`px-2 py-0.5 rounded-full capitalize ${user.role_name === 'coordinator' ? 'bg-indigo-100 text-indigo-800' :
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
                <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className="text-sm flex items-center gap-1">
                        <Hash className="w-3 h-3" /> {team._id.slice(-4)}
                    </Badge>
                    {/* Evaluation Readiness Badge */}
                    {team.ready_for_evaluation !== undefined && (
                        <Badge 
                            variant={team.ready_for_evaluation ? "default" : "secondary"}
                            className={`text-xs ${team.ready_for_evaluation ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'}`}
                        >
                            {team.ready_for_evaluation ? '✓ Ready' : '⏳ Not Ready'}
                        </Badge>
                    )}
                </div>
            </div>
            
            {/* Coordinator Information */}
            {team.coordinator_id && (
                <div className="space-y-1">
                    <p className="text-sm font-semibold text-indigo-700">Coordinator:</p>
                    <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                        {team.coordinator_id.user_name}
                    </span>
                </div>
            )}
            
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
            
            {/* Submission Status */}
            <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-700">Submissions:</p>
                <div className="flex flex-wrap gap-2 text-xs">
                    <span className={`px-2 py-1 rounded-full ${team.github_submission?.url ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        Final: {team.github_submission?.url ? '✓ Submitted' : '✗ Not Submitted'}
                    </span>
                    <span className={`px-2 py-1 rounded-full ${team.mid_submission?.url ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                        Mid: {team.mid_submission?.url ? '✓ Submitted' : '✗ Not Submitted'}
                    </span>
                </div>
            </div>
        </div>
    </Card>
);



// --- Main Component ---
const HackathonManagement = () => {
    const { hackathonId } = useParams();
    const navigate = useNavigate();
    const [hackathonData, setHackathonData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [evaluationStatus, setEvaluationStatus] = useState(null);
    const [loadingEvaluation, setLoadingEvaluation] = useState(false);
    const { toast } = useToast();

    const fetchHackathonDetails = async () => {
        if (!loading) setLoading(true);
        try {
            const data = await getHackathonById(hackathonId);
            setHackathonData(data);
        } catch (error) {
            toast({ title: "Error", description: "Failed to fetch management details.", variant: "destructive" });
            navigate('/admin/view-hackathon');
        } finally {
            setLoading(false);
        }
    };

    const fetchEvaluationStatus = async () => {
        try {
            const data = await getTeamsEvaluationStatus(hackathonId);
            setEvaluationStatus(data);
        } catch (error) {
            console.error('Failed to fetch evaluation status:', error);
        }
    };

    const handleMakeTeamsEvaluationReady = async () => {
        setLoadingEvaluation(true);
        try {
            const result = await makeAllTeamsEvaluationReady(hackathonId);
            toast({
                title: "Success",
                description: result.message,
                variant: "default",
            });
            // Refresh evaluation status
            await fetchEvaluationStatus();
        } catch (error) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to make teams evaluation ready",
                variant: "destructive",
            });
        } finally {
            setLoadingEvaluation(false);
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchHackathonDetails();
        fetchEvaluationStatus();
        
        // Auto-refresh every 30 seconds for real-time status updates
        const interval = setInterval(() => {
            fetchHackathonDetails();
            fetchEvaluationStatus();
        }, 30000);
        
        return () => clearInterval(interval);
    }, [hackathonId]);

    if (loading || !hackathonData) {
        return <DefaultLayout userRole="admin"><Skeleton className="h-[600px] m-8" /></DefaultLayout>;
    }

    // --- ⬇️ FIXED: Using correct property names from the backend response ---
    const { hackathon_name, start_datetime, end_datetime, mid_submission_datetime, venue, status, counts, managementLists, winners, completedReason, completedAt } = hackathonData;
    const { coordinators, evaluators, participants, teams } = managementLists;

    // Check if hackathon is completed
    const isCompleted = status === 'completed';

    // Helper function to get completion reason display text
    const getCompletionReasonText = (reason) => {
        switch (reason) {
            case 'insufficient_participants':
                return 'Event was cancelled due to insufficient participants (requires at least 3 teams, 1 coordinator, and 1 evaluator)';
            case 'time_ended':
                return 'Event completed naturally at the scheduled end time';
            case 'winners_announced':
                return 'Event completed with winners announced';
            default:
                return 'Event has been completed';
        }
    };

    return (
        <DefaultLayout userRole="admin">
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
                <div className="p-8 max-w-7xl mx-auto space-y-8">
                    <div className="flex justify-between items-center">
                        <Button onClick={() => navigate('/admin/view-hackathon')} variant="outline"><ArrowLeft className="w-4 h-4 mr-2" /> Back to List</Button>
                        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                            {isCompleted ? 'Hackathon Overview' : 'Hackathon Management'}
                        </h1>
                    </div>

                    <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-xl">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">{hackathon_name}</CardTitle>
                                    <CardDescription className="text-lg">
                                        Status: <span className={`font-semibold capitalize ${status === 'active' ? 'text-green-600' :
                                            status === 'completed' ? 'text-gray-600' :
                                                'text-blue-600'
                                            }`}>{status}</span>
                                        {isCompleted && (
                                            <span className="ml-4 text-sm text-gray-500">
                                                • Management features are disabled for completed events
                                            </span>
                                        )}
                                    </CardDescription>
                                </div>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => fetchHackathonDetails()}
                                    disabled={loading}
                                >
                                    {loading ? 'Refreshing...' : 'Refresh Status'}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-green-600" /> Start: {format(new Date(start_datetime), 'MMM d, yyyy @ h:mm a')}</p>
                                <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-yellow-600" /> Mid-Review: {mid_submission_datetime ? format(new Date(mid_submission_datetime), 'MMM d, yyyy @ h:mm a') : 'Not Set'}</p>
                                <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-red-600" /> End: {format(new Date(end_datetime), 'MMM d, yyyy @ h:mm a')}</p>
                                <p className="flex items-center gap-2 col-span-full md:col-span-1"><MapPin className="w-4 h-4" /> Venue: {venue}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <ManagementCard 
                            title={status === 'active' && counts?.teams > 0 ? "Available Participants" : "Participants"} 
                            count={counts?.participants || 0} 
                            icon={User} 
                            color="border-yellow-500" 
                        />
                        <ManagementCard title="Teams" count={counts?.teams || 0} icon={Code} color="border-blue-500" />
                        <ManagementCard 
                            title="Coordinators" 
                            count={counts?.coordinators || 0} 
                            icon={Users} 
                            color="border-indigo-500" 
                        />
                        <ManagementCard title="Evaluators" count={counts?.evaluators || 0} icon={ClipboardList} color="border-red-500" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader><CardTitle>Registered Coordinators , Evaluators & Teams</CardTitle></CardHeader>
                                <CardContent>
                                    <Accordion type="multiple" className="w-full">
                                        <AccordionItem value="coordinators">
                                            <AccordionTrigger>
                                                Coordinators ({counts?.coordinators || 0})
                                            </AccordionTrigger>
                                            <AccordionContent className="p-4 grid md:grid-cols-2 gap-4">
                                                {coordinators?.length > 0 ? (
                                                    <>
                                                        {status === 'active' && counts?.teams > 0 && (
                                                            <div className="col-span-full mb-2 p-2 bg-blue-50 rounded text-sm text-blue-700">
                                                                <strong>Note:</strong> Showing all coordinators in this hackathon. 
                                                                Those assigned to teams are also shown in their respective team cards.
                                                            </div>
                                                        )}
                                                        {coordinators.map(user => <UserDetailCard key={user._id} user={user} />)}
                                                    </>
                                                ) : (
                                                    <p>No coordinators.</p>
                                                )}
                                            </AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="teams">
                                            <AccordionTrigger>Teams ({counts?.teams || 0})</AccordionTrigger>
                                            <AccordionContent className="p-4 grid md:grid-cols-2 gap-4">{teams?.length > 0 ? teams.map(team => <TeamDetailCard key={team._id} team={team} />) : <p>No teams.</p>}</AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="evaluators">
                                            <AccordionTrigger>Evaluators ({counts?.evaluators || 0})</AccordionTrigger>
                                            <AccordionContent className="p-4 grid md:grid-cols-2 gap-4">{evaluators?.length > 0 ? evaluators.map(user => <UserDetailCard key={user._id} user={user} />) : <p>No evaluators.</p>}</AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="participants">
                                            <AccordionTrigger>
                                                {status === 'active' && counts?.teams > 0 
                                                    ? `Available Participants (${counts?.participants || 0})` 
                                                    : `Participants (${counts?.participants || 0})`
                                                }
                                            </AccordionTrigger>
                                            <AccordionContent className="p-4 grid md:grid-cols-2 gap-4">
                                                {participants?.length > 0 ? (
                                                    <>
                                                        {status === 'active' && counts?.teams > 0 && (
                                                            <div className="col-span-full mb-2 p-2 bg-yellow-50 rounded text-sm text-yellow-700">
                                                                <strong>Note:</strong> Showing participants not yet assigned to teams. 
                                                                Team members are shown in their respective team cards.
                                                            </div>
                                                        )}
                                                        {participants.map(user => <UserDetailCard key={user._id} user={user} />)}
                                                    </>
                                                ) : (
                                                    <p>{status === 'active' && counts?.teams > 0 ? 'All participants are assigned to teams.' : 'No participants.'}</p>
                                                )}
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-xl">
                                        {isCompleted ? 'Event Information' : 'Management Actions'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {isCompleted ? (
                                        <div className="space-y-4">
                                            <div className={`p-4 rounded-lg border ${completedReason === 'insufficient_participants'
                                                ? 'bg-red-50 border-red-200'
                                                : 'bg-gray-50 border-gray-200'
                                                }`}>
                                                <h4 className={`font-semibold mb-2 ${completedReason === 'insufficient_participants'
                                                    ? 'text-red-700'
                                                    : 'text-gray-700'
                                                    }`}>
                                                    {completedReason === 'insufficient_participants' ? 'Event Cancelled' : 'Event Completed'}
                                                </h4>
                                                <p className={`text-sm mb-3 ${completedReason === 'insufficient_participants'
                                                    ? 'text-red-600'
                                                    : 'text-gray-600'
                                                    }`}>
                                                    {getCompletionReasonText(completedReason)}
                                                </p>
                                                {completedAt && (
                                                    <p className="text-xs text-gray-500 mb-3">
                                                        Completed on: {format(new Date(completedAt), 'MMM d, yyyy @ h:mm a')}
                                                    </p>
                                                )}
                                                <div className="space-y-2 text-sm">
                                                    <p><strong>Total Participants:</strong> {counts?.totalParticipants || counts?.participants || 0}</p>
                                                    <p><strong>Total Teams:</strong> {counts?.teams || 0}</p>
                                                    <p><strong>Total Coordinators:</strong> {counts?.totalCoordinators || counts?.coordinators || 0}</p>
                                                    <p><strong>Total Evaluators:</strong> {counts?.evaluators || 0}</p>
                                                </div>

                                                {completedReason === 'insufficient_participants' && (
                                                    <div className="mt-3 p-3 bg-red-100 rounded border border-red-300">
                                                        <p className="text-xs text-red-700">
                                                            <strong>Note:</strong> Events require at least 3 teams, 1 coordinator, and 1 evaluator to be active.
                                                            This event was automatically cancelled when it started without meeting these requirements.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {winners && (winners.firstPlace || winners.secondPlace || winners.thirdPlace) && (
                                                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                                    <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                                                        <Award className="w-4 h-4" />
                                                        Winners Announced
                                                    </h4>
                                                    <div className="text-sm text-yellow-700 space-y-1">
                                                        {winners.firstPlace && <p>🥇 First Place: Team {winners.firstPlace.team_name}</p>}
                                                        {winners.secondPlace && <p>🥈 Second Place: Team {winners.secondPlace.team_name}</p>}
                                                        {winners.thirdPlace && <p>🥉 Third Place: Team {winners.thirdPlace.team_name}</p>}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            <Button
                                                onClick={() => navigate(`/admin/manage-hackathon/${hackathonId}/role-mapping`)}
                                                className="w-full justify-start"
                                            >
                                                <User className="w-4 h-4 mr-2" /> Assign Coordinators and Evaluators
                                            </Button>
                                            <Button
                                                onClick={() => navigate(`/admin/hackathon/${hackathonId}/questions`)}
                                                className="w-full justify-start"
                                            >
                                                <ClipboardList className="w-4 h-4 mr-2" /> Manage Questions
                                            </Button>
                                            
                                            {/* Evaluation Readiness Section */}
                                            {evaluationStatus && (
                                                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                    <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                                        <CheckCircle className="w-4 h-4" />
                                                        Evaluation Readiness
                                                    </h4>
                                                    <div className="text-sm text-blue-700 space-y-2 mb-3">
                                                        <p><strong>Total Teams:</strong> {evaluationStatus.stats.totalTeams}</p>
                                                        <p><strong>Ready for Evaluation:</strong> {evaluationStatus.stats.readyForEvaluation}</p>
                                                        <p><strong>Not Ready:</strong> {evaluationStatus.stats.notReady}</p>
                                                        <p><strong>With Submissions:</strong> {evaluationStatus.stats.withSubmissions}</p>
                                                        <p><strong>Without Submissions:</strong> {evaluationStatus.stats.withoutSubmissions}</p>
                                                    </div>
                                                    
                                                    {evaluationStatus.stats.notReady > 0 && (
                                                        <div className="mb-3 p-2 bg-yellow-100 rounded border border-yellow-300">
                                                            <p className="text-xs text-yellow-700 flex items-center gap-1">
                                                                <AlertCircle className="w-3 h-3" />
                                                                <strong>Note:</strong> Teams become evaluation-ready automatically when registration ends or when they submit their final project.
                                                            </p>
                                                        </div>
                                                    )}
                                                    
                                                    <Button
                                                        onClick={handleMakeTeamsEvaluationReady}
                                                        disabled={loadingEvaluation || evaluationStatus.stats.notReady === 0}
                                                        className="w-full"
                                                        variant={evaluationStatus.stats.notReady > 0 ? "default" : "outline"}
                                                    >
                                                        {loadingEvaluation ? 'Processing...' : 
                                                         evaluationStatus.stats.notReady === 0 ? 'All Teams Ready' : 
                                                         `Make ${evaluationStatus.stats.notReady} Teams Ready`}
                                                    </Button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </DefaultLayout>
    );
};

export default HackathonManagement;