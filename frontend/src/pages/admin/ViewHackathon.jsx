import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllHackathonsForAdmin } from '@/api/hackathonApi';
import DefaultLayout from '@/components/DefaultLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const HackathonStatusBadge = ({ status, completedReason }) => {
    let colorClass = 'bg-gray-400';
    let icon = null;
    let displayText = status;
    
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
            if (completedReason === 'insufficient_participants') {
                colorClass = 'bg-red-500 hover:bg-red-600';
                displayText = 'cancelled';
            } else {
                colorClass = 'bg-gray-500 hover:bg-gray-600';
            }
            icon = <XCircle className="w-3 h-3 mr-1.5" />;
            break;
    }
    return (
        <Badge className={`${colorClass} text-white capitalize`}>
            {icon}
            {displayText}
        </Badge>
    );
};

const ViewHackathon = () => {
    const [hackathons, setHackathons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        const fetchAllHackathonsForAdmin = async () => {
            try {
                const data = await getAllHackathonsForAdmin();
                if (Array.isArray(data)) {
                    setHackathons(data);
                    setLastUpdated(new Date());
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
        
        // Initial fetch
        fetchAllHackathonsForAdmin();
        
        // Auto-refresh every 30 seconds to show real-time status updates
        const interval = setInterval(() => {
            fetchAllHackathonsForAdmin();
        }, 30000);
        
        return () => clearInterval(interval);
    }, [toast]);
    
    if (loading) {
        return <DefaultLayout userRole="admin"><Skeleton className="h-80 m-8" /></DefaultLayout>;
    }

    return (
        <DefaultLayout userRole="admin">
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
                <div className="p-4 md:p-8">
                <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-xl">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">Hackathon Management</CardTitle>
                                <CardDescription className="text-md text-gray-600">
                                    View all hackathons (past, present, and future) to manage details and results.
                                    {lastUpdated && (
                                        <span className="block text-xs text-gray-500 mt-1">
                                            Last updated: {format(lastUpdated, 'h:mm:ss a')} • Auto-refreshes every 30s
                                        </span>
                                    )}
                                </CardDescription>
                            </div>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                    setLoading(true);
                                    const fetchData = async () => {
                                        try {
                                            const data = await getAllHackathonsForAdmin();
                                            if (Array.isArray(data)) {
                                                setHackathons(data);
                                            }
                                        } catch (err) {
                                            console.error("Error refreshing:", err);
                                        } finally {
                                            setLoading(false);
                                        }
                                    };
                                    fetchData();
                                }}
                                disabled={loading}
                            >
                                {loading ? 'Refreshing...' : 'Refresh'}
                            </Button>
                        </div>
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
                                            {/* --- ⬇️ FIXED: Using correct object properties from the backend --- */}
                                            <TableCell className="font-medium">{hackathon.hackathon_name}</TableCell>
                                            <TableCell>{format(new Date(hackathon.start_datetime), 'MMM d, yyyy')}</TableCell>
                                            <TableCell>{format(new Date(hackathon.end_datetime), 'MMM d, yyyy')}</TableCell>
                                            <TableCell className="text-center">
                                                <HackathonStatusBadge 
                                                    status={hackathon.status} 
                                                    completedReason={hackathon.completedReason} 
                                                />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant={hackathon.status === 'completed' ? 'outline' : 'default'}
                                                    size="sm"
                                                    onClick={() => navigate(`/admin/manage-hackathon/${hackathon._id}`)}
                                                >
                                                    <Edit className="w-4 h-4 mr-1" /> 
                                                    {hackathon.status === 'completed' ? 'View' : 'View/Manage'}
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
            </div>
        </DefaultLayout>
    );
};

export default ViewHackathon;