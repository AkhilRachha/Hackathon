import { useEffect, useState } from 'react';
import DefaultLayout from '@/components/DefaultLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Calendar, CheckCircle, Award, Star } from 'lucide-react';
// Assuming getHackathonWinners exists in hackathonApi.js
import { getHackathonWinners } from '@/api/hackathonApi'; 
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const HackathonWinners = () => {
    const [completedHackathons, setCompletedHackathons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { toast } = useToast();

    useEffect(() => {
        const fetchWinners = async () => {
            try {
                // ➡️ Call the API to fetch completed hackathons with populated winner fields
                const response = await getHackathonWinners();
                // Ensure the data is an array before setting
                if (Array.isArray(response.data)) {
                    setCompletedHackathons(response.data);
                } else {
                    setCompletedHackathons([]);
                    console.warn("API did not return an array for winners:", response.data);
                }
            } catch (err) {
                console.error("Error fetching winners:", err);
                setError('Failed to fetch hackathon winners list.');
                toast({
                    title: "Error",
                    description: "Failed to load past winners data.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchWinners();
    }, [toast]);

    const getWinnerBadge = (team, place) => {
        if (!team) {
            return <Badge variant="secondary" className="bg-gray-200 text-gray-700">TBD</Badge>;
        }
        
        let color = '';
        if (place === 1) color = 'bg-yellow-500 hover:bg-yellow-600';
        else if (place === 2) color = 'bg-slate-400 hover:bg-slate-500';
        else if (place === 3) color = 'bg-amber-700 hover:bg-amber-800';

        return (
            <Badge className={`${color} text-white font-semibold flex items-center gap-1`}>
                <Star className="w-4 h-4" /> {team.team_name}
            </Badge>
        );
    };

    if (loading) {
        return (
            <DefaultLayout userRole="admin">
                <div className="p-8"><Skeleton className="h-40 w-full" /></div>
            </DefaultLayout>
        );
    }

    if (error) {
        return (
            <DefaultLayout userRole="admin">
                <div className="p-8">
                    <Card className="border-red-500">
                        <CardHeader><CardTitle className="text-red-600">Error</CardTitle></CardHeader>
                        <CardContent>{error}</CardContent>
                    </Card>
                </div>
            </DefaultLayout>
        );
    }

    return (
        <DefaultLayout userRole="admin">
            <div className="p-8 max-w-7xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                            <Award className="w-8 h-8 text-yellow-600"/> Past Hackathon Winners
                        </CardTitle>
                        <CardDescription>
                            Review the results and winning teams for all completed hackathon events.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {completedHackathons.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-xl font-semibold text-gray-700 mb-2">No Completed Hackathons Found</p>
                                <p className="text-gray-500">Winners can only be displayed for events marked as 'completed'.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50">
                                        <TableHead className="w-[30%]">Hackathon Title</TableHead>
                                        <TableHead className="text-center">End Date</TableHead>
                                        <TableHead className="w-[15%]">1st Place</TableHead>
                                        <TableHead className="w-[15%]">2nd Place</TableHead>
                                        <TableHead className="w-[15%]">3rd Place</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {completedHackathons.map((hackathon) => (
                                        <TableRow key={hackathon._id}>
                                            <TableCell className="font-medium text-lg text-blue-800">
                                                {hackathon.title}
                                            </TableCell>
                                            <TableCell className="text-center text-gray-600 flex items-center justify-center gap-1">
                                                <Calendar className="w-4 h-4"/> 
                                                {format(new Date(hackathon.endDate), 'MMM d, yyyy')}
                                            </TableCell>
                                            <TableCell>
                                                {getWinnerBadge(hackathon.winners.firstPlace, 1)}
                                            </TableCell>
                                            <TableCell>
                                                {getWinnerBadge(hackathon.winners.secondPlace, 2)}
                                            </TableCell>
                                            <TableCell>
                                                {getWinnerBadge(hackathon.winners.thirdPlace, 3)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DefaultLayout>
    );
};

export default HackathonWinners;