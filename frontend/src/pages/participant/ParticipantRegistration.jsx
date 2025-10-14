import { useEffect, useState } from 'react';
import DefaultLayout from '@/components/DefaultLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { getAllHackathons, joinHackathon } from '@/api/hackathonApi';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, XCircle, Clock, AlertTriangle, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { getRegistrationStatus, getTimeUntilRegistrationDeadline } from '@/utils/hackathonUtils';

const ParticipantRegistration = ({ onRegistrationSuccess }) => {
    const [availableHackathons, setAvailableHackathons] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const userName = localStorage.getItem('userName') || 'Participant';

    useEffect(() => {
        const fetchHackathons = async () => {
            try {
                const data = await getAllHackathons();
                setAvailableHackathons(data || []);
            } catch (error) {
                toast({ title: "Error", description: "Failed to load hackathon data.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        fetchHackathons();
    }, [toast]);

    const handleJoin = async (hackathonId) => {
        try {
            await joinHackathon(hackathonId);
            localStorage.setItem('currentHackathonId', hackathonId);
            toast({ title: "Success! 🎉", description: "Successfully joined the hackathon." });
            onRegistrationSuccess();
        } catch (error) {
            toast({ title: "Error Joining", description: error.response?.data?.message || "Failed to join.", variant: "destructive" });
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/login";
    };

    if (loading) {
        return <DefaultLayout userRole="participant"><div className="p-8"><Skeleton className="h-64 w-full" /></div></DefaultLayout>;
    }

    if (availableHackathons.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center p-4 relative overflow-hidden">
                {/* Background elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
                    <div
                        className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"
                        style={{ animationDelay: '1s' }}
                    />
                </div>
                <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-xl w-full max-w-xl relative z-10">
                    <CardHeader className="bg-yellow-50 p-6 rounded-t-lg">
                        <CardTitle className="text-3xl font-bold text-yellow-800 flex items-center"><XCircle className="w-8 h-8 mr-3" /> No Events Available</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <p className="text-lg text-gray-700">Hello, <strong>{userName}</strong>! There are no active or upcoming hackathons to join right now.</p>
                        <p className="text-md text-gray-600">Please check back later or contact your administrator for more information.</p>
                        <div className="pt-4">
                            <Button
                                onClick={handleLogout}
                                variant="outline"
                                size="lg"
                                className="w-full flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700 shadow-lg"
                            >
                                <LogOut className="w-5 h-5" /> Logout
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <DefaultLayout userRole="participant">
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                    <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-xl">
                        <CardHeader className="p-8">
                            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">Available Hackathons</CardTitle>
                            <CardDescription className="text-lg text-gray-600 mt-2">
                                Hello, <strong>{userName}</strong>! Join active hackathons or register for upcoming events.
                                <span className="block text-sm text-blue-600 mt-2">
                                    💡 You can participate in multiple hackathons over time - complete one and join the next!
                                </span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-4">
                            {availableHackathons.map((hackathon) => {
                                const registrationStatus = getRegistrationStatus(hackathon);
                                const timeRemaining = getTimeUntilRegistrationDeadline(hackathon);

                                return (
                                    <div key={hackathon._id} className="flex flex-col md:flex-row justify-between items-center p-6 border rounded-lg shadow-sm hover:shadow-lg hover:border-blue-500 transition-all duration-300 bg-white">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-2xl font-semibold text-gray-800">{hackathon.hackathon_name}</h3>
                                                {hackathon.status === 'active' && (
                                                    <Badge className="bg-red-100 text-red-800 border-red-200 animate-pulse">
                                                        🔴 LIVE NOW
                                                    </Badge>
                                                )}
                                                <Badge
                                                    variant={registrationStatus.type === 'urgent' ? 'destructive' : 'default'}
                                                    className={
                                                        registrationStatus.type === 'open' ? 'bg-green-100 text-green-800' :
                                                            registrationStatus.type === 'urgent' ? 'bg-orange-100 text-orange-800' :
                                                                'bg-gray-100 text-gray-800'
                                                    }
                                                >
                                                    {registrationStatus.message}
                                                </Badge>
                                            </div>
                                            <p className="text-md text-gray-600 flex items-center gap-2 mt-1">
                                                <Clock className="w-4 h-4" /> Status: <strong className="capitalize">{hackathon.status}</strong> | Starts: {format(new Date(hackathon.start_datetime), 'MMM d, yyyy')}
                                            </p>
                                            {hackathon.registrationDeadline && (
                                                <p className="text-sm text-orange-600 flex items-center gap-2 mt-1">
                                                    <AlertTriangle className="w-4 h-4" /> Registration Deadline: {format(new Date(hackathon.registrationDeadline), 'MMM d, yyyy h:mm a')}
                                                    {timeRemaining && <span className="ml-2 font-semibold">({timeRemaining})</span>}
                                                </p>
                                            )}
                                        </div>
                                        <Button
                                            size="lg"
                                            className="mt-4 md:mt-0 w-full md:w-auto"
                                            onClick={() => handleJoin(hackathon._id)}
                                            disabled={!registrationStatus.canJoin}
                                        >
                                            {registrationStatus.canJoin ? 'Join Hackathon' : 'Registration Closed'}
                                            <ArrowRight className="w-5 h-5 ml-2" />
                                        </Button>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DefaultLayout>
    );
};

export default ParticipantRegistration;