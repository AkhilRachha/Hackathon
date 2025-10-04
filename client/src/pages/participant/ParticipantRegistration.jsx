import { useEffect, useState } from 'react';
import DefaultLayout from '@/components/DefaultLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getAllHackathons, joinHackathon } from '@/api/hackathonApi'; 
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

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
            onRegistrationSuccess(); // Tell the parent to switch to the dashboard view
        } catch (error) {
            toast({ title: "Error Joining", description: error.response?.data?.message || "Failed to join.", variant: "destructive" });
        }
    };

    if (loading) {
        return <DefaultLayout><div className="p-8"><Skeleton className="h-64 w-full" /></div></DefaultLayout>;
    }
    
    if (availableHackathons.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
                <Card className="shadow-2xl border-yellow-500 border-2 w-full max-w-xl">
                    <CardHeader className="bg-yellow-50 p-6 rounded-t-lg">
                        <CardTitle className="text-3xl font-bold text-yellow-800 flex items-center"><XCircle className="w-8 h-8 mr-3" /> No Events Available</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <p className="text-lg text-gray-700">Hello, <strong>{userName}</strong>! There are no active or upcoming hackathons to join right now.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <DefaultLayout>
            <div className="min-h-screen bg-gray-50 p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                    <Card className="shadow-2xl">
                        <CardHeader className="p-8">
                            <CardTitle className="text-4xl font-bold text-blue-800">Available Hackathons</CardTitle>
                            <CardDescription className="text-lg text-gray-600 mt-2">Hello, <strong>{userName}</strong>! Select an event to join.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-4">
                            {availableHackathons.map((hackathon) => (
                                <div key={hackathon._id} className="flex flex-col md:flex-row justify-between items-center p-6 border rounded-lg shadow-sm hover:shadow-lg hover:border-blue-500 transition-all duration-300 bg-white">
                                    <div>
                                        <h3 className="text-2xl font-semibold text-gray-800">{hackathon.title}</h3>
                                        <p className="text-md text-gray-600 flex items-center gap-2 mt-1">
                                            <Clock className="w-4 h-4"/> Status: <strong className="capitalize">{hackathon.status}</strong> | Starts: {format(new Date(hackathon.startDate), 'MMM d, yyyy')}
                                        </p>
                                    </div>
                                    <Button size="lg" className="mt-4 md:mt-0 w-full md:w-auto" onClick={() => handleJoin(hackathon._id)}>
                                        Join Hackathon <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DefaultLayout>
    );
};

export default ParticipantRegistration;