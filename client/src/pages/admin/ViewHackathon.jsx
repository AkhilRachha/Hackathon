import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllHackathonsForAdmin } from '@/api/hackathonApi'; // Use the new admin-specific function
import DefaultLayout from '@/components/DefaultLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

// Helper component for status badge display
const HackathonStatusBadge = ({ status }) => {
    let colorClass = 'bg-gray-400';
    let icon = null;
    switch (status) {
        case 'upcoming':
            colorClass = 'bg-blue-500 hover:bg-blue-600';
            icon = <Clock className="w-3 h-3 mr-1.5" />;
            break;
        case 'active':
            colorClass = 'bg-green-500 hover:bg-green-600';
            icon = <CheckCircle className="w-3 h-3 mr-1.5" />;
            break;
        case 'completed':
            colorClass = 'bg-gray-500 hover:bg-gray-600';
            icon = <XCircle className="w-3 h-3 mr-1.5" />;
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
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        const fetchAllHackathons = async () => {
            try {
                // Call the correct API function for admins
                const data = await getAllHackathonsForAdmin();
                
                // Ensure data is an array before setting state
                if (Array.isArray(data)) {
                    setHackathons(data);
                } else {
                    throw new Error("API did not return an array.");
                }
            } catch (err) {
                console.error("Error loading hackathons for admin:", err); 
                toast({
                    title: "Error",
                    description: "Failed to load hackathons list. Please check the backend server.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchAllHackathons();
    }, [toast]);
    
    if (loading) {
        return (
            <DefaultLayout>
                <div className="p-8"><Skeleton className="h-80 w-full" /></div>
            </DefaultLayout>
        );
    }

    return (
        <DefaultLayout>
            <div className="p-4 md:p-8">
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold">Hackathon Management</CardTitle>
                        <CardDescription className="text-md text-gray-600">
                            View all hackathons (past, present, and future) to manage details, participants, and results.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {hackathons.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="mb-4 text-gray-500">No hackathons found in the system.</p>
                                <Button onClick={() => navigate('/admin/create-hackathon')}>
                                    Create Your First Hackathon
                                </Button>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[40%]">Title</TableHead>
                                        <TableHead>Start Date</TableHead>
                                        <TableHead>End Date</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {hackathons.map((hackathon) => (
                                        <TableRow key={hackathon._id}>
                                            <TableCell className="font-medium">{hackathon.title}</TableCell>
                                            <TableCell>{format(new Date(hackathon.startDate), 'MMM d, yyyy')}</TableCell>
                                            <TableCell>{format(new Date(hackathon.endDate), 'MMM d, yyyy')}</TableCell>
                                            <TableCell className="text-center">
                                                <HackathonStatusBadge status={hackathon.status} />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    onClick={() => navigate(`/admin/manage-hackathon/${hackathon._id}`)}
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