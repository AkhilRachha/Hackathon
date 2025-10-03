import { useEffect, useState } from 'react';
import DefaultLayout from '@/components/DefaultLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Clock, CheckCircle, XCircle } from 'lucide-react';
import { getAllHackathons } from '@/api/hackathonApi'; // ⬅️ This call is now fixed in hackathonApi.js
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

// Helper component for status badge display
const HackathonStatusBadge = ({ status }) => {
    let colorClass = '';
    let icon = null;

    switch (status) {
        case 'upcoming':
            colorClass = 'bg-blue-500 hover:bg-blue-600';
            icon = <Clock className="w-3 h-3 mr-1" />;
            break;
        case 'active':
            colorClass = 'bg-green-500 hover:bg-green-600';
            icon = <CheckCircle className="w-3 h-3 mr-1" />;
            break;
        case 'completed':
            colorClass = 'bg-gray-500 hover:bg-gray-600';
            icon = <XCircle className="w-3 h-3 mr-1" />;
            break;
        default:
            colorClass = 'bg-yellow-500 hover:bg-yellow-600';
            break;
    }

    return (
        <Badge className={`${colorClass} text-white capitalize`}>
            {icon}
            {status}
        </Badge>
    );
};


const ViewHackathon = () => {
    const [hackathons, setHackathons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        const fetchHackathons = async () => {
            try {
                // The fixed API call will now resolve successfully
                const response = await getAllHackathons();
                
                // The server now returns an array directly, not inside a 'data' property
                // If your backend *does* wrap the array in 'data', change this line:
                // const hackathonArray = response.data.data; 
                const hackathonArray = response.data; 

                if (!Array.isArray(hackathonArray)) {
                    throw new Error("API returned unexpected data format.");
                }

                // Filter to show only active and upcoming hackathons (not completed)
                const activeHackathons = hackathonArray.filter(hackathon => 
                    hackathon.status === 'active' || hackathon.status === 'upcoming'
                );

                const sortedHackathons = activeHackathons.sort((a, b) => {
                    if (a.status === 'active') return -1;
                    if (b.status === 'active') return 1;
                    if (a.status === 'upcoming' && b.status !== 'active') return -1;
                    return 0;
                });
                
                setHackathons(sortedHackathons);
                setLoading(false);
            } catch (err) {
                console.error("Error loading hackathons:", err); 
                // This error handler is what produced the UI messages you saw
                setError('Failed to fetch hackathons. Check network console for API error.');
                toast({
                    title: "Error",
                    description: "Failed to load hackathons list. Is the backend running? (Check for 404 or CORS issues)",
                    variant: "destructive",
                });
                setLoading(false);
            }
        };

        fetchHackathons();
    }, [toast]);

    // ➡️ Redirects to the new dedicated management page
    const handleEditClick = (hackathonId) => {
        navigate(`/admin/manage-hackathon/${hackathonId}`);
    };


    if (loading) {
        return (
            <DefaultLayout userRole="admin">
                <div className="p-8">
                    <Card>
                        <CardHeader><CardTitle>Loading Hackathons</CardTitle></CardHeader>
                        <CardContent>
                            <Skeleton className="h-10 w-full mb-4" />
                            <Skeleton className="h-8 w-full mb-2" />
                            <Skeleton className="h-8 w-full mb-2" />
                            <Skeleton className="h-8 w-full mb-2" />
                        </CardContent>
                    </Card>
                </div>
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
            <div className="p-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold">Hackathon Selection</CardTitle>
                        <CardDescription>
                            Select an active or upcoming hackathon to view details and manage participants, teams, and staff. Completed hackathons are not shown here.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {hackathons.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="mb-4">There are currently no active or upcoming hackathons.</p>
                                <Button onClick={() => navigate('/admin/create-hackathon')}>
                                    Create New Hackathon
                                </Button>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Start Date</TableHead>
                                        <TableHead>End Date</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {hackathons.map((hackathon) => (
                                        <TableRow key={hackathon._id}>
                                            <TableCell className="font-medium">
                                                {hackathon.title}
                                            </TableCell>
                                            <TableCell>
                                                {format(new Date(hackathon.startDate), 'MMM d, yyyy')}
                                            </TableCell>
                                            <TableCell>
                                                {format(new Date(hackathon.endDate), 'MMM d, yyyy')}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <HackathonStatusBadge status={hackathon.status} />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    onClick={() => handleEditClick(hackathon._id)}
                                                >
                                                    <Edit className="w-4 h-4 mr-1" /> View/Manage
                                                </Button>
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

export default ViewHackathon;