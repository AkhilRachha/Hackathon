import { useEffect, useState } from 'react';
import DefaultLayout from '@/components/DefaultLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getAllHackathons, joinHackathon, leaveHackathon } from '@/api/hackathonApi'; 
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, ArrowRight, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

const ParticipantDashboard = () => {
    const [hackathons, setHackathons] = useState([]);
    const [loading, setLoading] = useState(true);
    // State stores the full object if the user is joined to one
    const [userHackathon, setUserHackathon] = useState(null); 
    const { toast } = useToast();

    const userRole = localStorage.getItem('userRole') || 'participant';
    const userName = localStorage.getItem('userName') || 'Participant';

    const fetchDashboardData = async () => {
        setLoading(true);
        
        const currentHackathonId = localStorage.getItem('currentHackathonId'); 
        
        try {
            // 1. Fetch all hackathons
            const response = await getAllHackathons();
            const allEvents = response.data;
            
            // Filter events that are active or upcoming
            const activeEvents = allEvents.filter(h => 
                h.status === 'active' || h.status === 'upcoming'
            );
            setHackathons(activeEvents);
            
            // 2. Check user's current status against the fetched list
            if (currentHackathonId) {
                const joinedEvent = allEvents.find(h => h._id === currentHackathonId);
                
                // Only set the state if the event is active or upcoming
                if (joinedEvent && (joinedEvent.status === 'active' || joinedEvent.status === 'upcoming')) {
                    setUserHackathon(joinedEvent);
                } else {
                    // If the joined hackathon is now completed/not found, clear participation state
                    localStorage.removeItem('currentHackathonId');
                    setUserHackathon(null);
                }
            } else {
                 setUserHackathon(null);
            }

        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load hackathons list.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleJoinHackathon = async (hackathonId, hackathonTitle) => {
        try {
            const response = await joinHackathon(hackathonId);
            
            toast({
                title: "Success! 🎉",
                description: response.data.message,
            });
            
            // Update UI state and local storage with the new participation
            const joinedEvent = hackathons.find(h => h._id === hackathonId);
            setUserHackathon(joinedEvent);
            localStorage.setItem('currentHackathonId', hackathonId);

        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to join hackathon.";
            toast({
                title: "Error Joining",
                description: errorMessage,
                variant: "destructive",
            });
        }
    };

    const handleLeaveHackathon = async () => {
        try {
            const response = await leaveHackathon();
            
            toast({
                title: "Left Hackathon",
                description: response.data.message,
            });
            
            // Clear UI state and local storage
            setUserHackathon(null);
            localStorage.removeItem('currentHackathonId');
            
            // Refresh the hackathons list
            fetchDashboardData();

        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to leave hackathon.";
            toast({
                title: "Error Leaving",
                description: errorMessage,
                variant: "destructive",
            });
        }
    };

    if (loading) {
        return (
            <DefaultLayout userRole={userRole}>
                <div className="p-8 max-w-4xl mx-auto"><Skeleton className="h-64 w-full" /></div>
            </DefaultLayout>
        );
    }
    
    // 1. User is already in an active/upcoming hackathon
    if (userHackathon) {
        return (
            <DefaultLayout userRole={userRole}>
                <div className="p-8 max-w-xl mx-auto">
                    <Card className="shadow-lg border-green-500 border-2">
                        <CardHeader className="bg-green-50 p-6 rounded-t-lg">
                            <CardTitle className="text-2xl text-green-700 flex items-center">
                                <CheckCircle className="w-6 h-6 mr-2" /> Current Hackathon
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <p className="text-lg mb-4">
                                Hello, **{userName}**! You are currently participating in:
                            </p>
                            <div className="font-bold text-xl text-gray-800 p-3 bg-gray-100 rounded-md">
                                {userHackathon.title}
                            </div>
                            <p className="text-sm text-gray-500 mt-4">
                                Status: **{userHackathon.status.toUpperCase()}** | Ends: {format(new Date(userHackathon.endDate), 'MMM d, yyyy')}
                            </p>
                            <div className="mt-4 space-y-2">
                                <Button className="w-full">Go to Hackathon Details / Team</Button>
                                <Button 
                                    variant="outline" 
                                    className="w-full text-red-600 border-red-300 hover:bg-red-50"
                                    onClick={handleLeaveHackathon}
                                >
                                    Leave Hackathon
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DefaultLayout>
        );
    }

    // 2. User is free and there are no active/upcoming hackathons
    if (hackathons.length === 0) {
        return (
            <DefaultLayout userRole={userRole}>
                <div className="p-8 max-w-xl mx-auto">
                    <Card className="shadow-lg border-yellow-500 border-2">
                        <CardHeader className="bg-yellow-50 p-6 rounded-t-lg">
                            <CardTitle className="text-2xl text-yellow-700 flex items-center">
                                <XCircle className="w-6 h-6 mr-2" /> No Active Events
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <p className="text-lg">
                                Hello, **{userName}**! There are no active or upcoming hackathons available to join right now. Your participation is currently clear.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </DefaultLayout>
        );
    }

    // 3. User is free and can choose a hackathon
    return (
        <DefaultLayout userRole={userRole}>
            <div className="p-8 max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold text-blue-700">Available Hackathons</CardTitle>
                        <CardDescription>
                            Hello, **{userName}**! Select one active or upcoming hackathon to join. You can only participate in one at a time.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {hackathons.map((hackathon) => (
                            <div key={hackathon._id} className="flex justify-between items-center p-4 border rounded-lg shadow-sm hover:shadow-md transition">
                                <div>
                                    <h3 className="text-xl font-semibold">{hackathon.title}</h3>
                                    <p className="text-sm text-gray-600 flex items-center gap-1">
                                        <Clock className="w-3 h-3"/> Status: **{hackathon.status.toUpperCase()}** | Starts: {format(new Date(hackathon.startDate), 'MMM d, yyyy')}
                                    </p>
                                </div>
                                <Button onClick={() => handleJoinHackathon(hackathon._id, hackathon.title)}>
                                    Join Hackathon <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </DefaultLayout>
    );
};

export default ParticipantDashboard;