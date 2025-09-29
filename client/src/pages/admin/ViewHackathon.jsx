import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import DefaultLayout from '../../components/DefaultLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Edit, Trash2, UserPlus, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const ViewHackathon = () => {
    const navigate = useNavigate();
    const [hackathon, setHackathon] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHackathonData = async () => {
            try {
                // Fetch all hackathons and display the first one for this example.
                // In a real app, you'd likely pass an ID in the URL.
                const response = await axios.get('http://localhost:5000/api/hackathons');
                if (response.data && response.data.length > 0) {
                    // For now, let's just pick the first hackathon from the list
                    const currentHackathon = response.data[0];
                    // Let's create some dummy stats as the backend doesn't provide them yet
                    currentHackathon.stats = {
                        participants: currentHackathon.teams.reduce((acc, team) => acc + (team.members ? team.members.length : 0), 0),
                        teams: currentHackathon.teams.length,
                        activeEvents: 1 // Assuming this view is for one active event
                    };
                    setHackathon(currentHackathon);
                } else {
                     toast({ title: "No Hackathons Found", description: "There are no hackathons to display." });
                }
            } catch (error) {
                console.error("Error fetching hackathon data:", error);
                toast({ title: "Error", description: "Could not fetch hackathon data." });
            } finally {
                setLoading(false);
            }
        };

        fetchHackathonData();
    }, []);

    if (loading) {
        return (
            <DefaultLayout userRole="admin">
                <div className="flex justify-center items-center min-h-screen">Loading Hackathon Details...</div>
            </DefaultLayout>
        );
    }

    if (!hackathon) {
        return (
            <DefaultLayout userRole="admin">
                <div className="flex justify-center items-center min-h-screen">
                     <Card className="w-full max-w-lg text-center">
                        <CardHeader>
                            <CardTitle>No Hackathon Data</CardTitle>
                            <CardDescription>Could not find any active hackathons to display.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={() => navigate('/admin/create-hackathon')}>Create One Now</Button>
                        </CardContent>
                    </Card>
                </div>
            </DefaultLayout>
        );
    }

    return (
        <DefaultLayout userRole="admin">
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
                >
                    <h1 className="text-4xl font-bold mb-8">{hackathon.title}</h1>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Card><CardHeader><CardTitle>Total Participants</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{hackathon.stats.participants}</p></CardContent></Card>
                        <Card><CardHeader><CardTitle>Total Teams</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{hackathon.stats.teams}</p></CardContent></Card>
                        <Card><CardHeader><CardTitle>Active Events</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{hackathon.stats.activeEvents}</p></CardContent></Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card>
                            <CardHeader><CardTitle>Teams</CardTitle></CardHeader>
                            <CardContent>
                                {hackathon.teams.length > 0 ? hackathon.teams.map(team => (
                                    <div key={team._id} className="flex justify-between items-center mb-4 p-2 rounded-lg hover:bg-gray-100">
                                        <p className="font-semibold">{team.team_name}</p>
                                        <div>
                                            <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="sm" className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    </div>
                                )) : <p className="text-gray-500">No teams have been created for this hackathon yet.</p>}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle>Project Titles</CardTitle></CardHeader>
                            <CardContent>
                                {/* This will need to be populated from the questions collection */}
                                <div className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer" onClick={() => navigate('/admin/titles')}>
                                    <p className="flex items-center"><FileText className="h-4 w-4 mr-2"/> Manage Titles and Criteria</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="mt-8">
                        <CardHeader><CardTitle>Role Mapping</CardTitle></CardHeader>
                        <CardContent className="flex gap-4">
                             <Button onClick={() => navigate('/admin/role-mapping')}>
                                <UserPlus className="mr-2 h-4 w-4" /> Map Coordinators & Evaluators
                            </Button>
                        </CardContent>
                    </Card>

                </motion.div>
            </div>
        </DefaultLayout>
    );
};

export default ViewHackathon;

