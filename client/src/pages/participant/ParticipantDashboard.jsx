import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, FileText, Github, UserCheck, Wind } from 'lucide-react';

const ParticipantDashboard = () => {
    const [myTeam, setMyTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTeamData = async () => {
            try {
                // Get the logged-in user's ID from localStorage
                const userId = localStorage.getItem('userId');
                if (!userId) {
                    throw new Error("User not found. Please log in again.");
                }

                const response = await axios.get(`http://localhost:5000/api/my-team/${userId}`);
                setMyTeam(response.data);

            } catch (err) {
                // If the server sends a 404, it means the user hasn't been assigned to a team
                if (err.response && err.response.status === 404) {
                    setError(err.response.data.message);
                } else {
                    setError("An error occurred while fetching your data.");
                }
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTeamData();
    }, []);

    // Loading State UI
    if (loading) {
        return <div className="flex items-center justify-center h-screen text-xl font-semibold">Loading Your Dashboard...</div>;
    }

    // Unassigned User UI
    if (error && !myTeam) {
        return (
            <div className="flex flex-col items-center justify-center h-screen text-center p-4">
                 <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }}>
                    <Card className="w-full max-w-md p-6">
                        <CardHeader>
                            <Wind className="mx-auto h-12 w-12 text-gray-400" />
                            <CardTitle className="mt-4 text-2xl">Welcome!</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">{error}</p>
                            <p className="mt-2 text-sm text-gray-500">Your coordinator will add you to a team soon.</p>
                        </CardContent>
                    </Card>
                 </motion.div>
            </div>
        );
    }

    // Main Dashboard UI
    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto"
            >
                <header className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800">Welcome, {localStorage.getItem('userName') || 'Participant'}!</h1>
                    <p className="text-lg text-gray-500">Here are your team and project details.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Team Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-2xl">
                                <Users /> {myTeam.team_name}
                            </CardTitle>
                            <CardDescription>Managed by: {myTeam.coordinator.user_name}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <h3 className="font-semibold mb-2 flex items-center gap-2"><UserCheck size={18} />Your Teammates:</h3>
                            <div className="flex flex-wrap gap-2">
                                {myTeam.members.map(member => (
                                    <Badge key={member._id} variant="secondary" className="text-base px-3 py-1">{member.user_name}</Badge>
                                ))}
                            </div>
                            <a
                                href={myTeam.user_github_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:underline"
                            >
                                <Github size={16} /> View GitHub Repository
                            </a>
                        </CardContent>
                    </Card>

                    {/* Project Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-2xl">
                                <FileText /> Your Project
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <h2 className="text-xl font-bold text-gray-900">{myTeam.q_id.q_title}</h2>
                            <p className="mt-2 text-gray-600">{myTeam.q_id.q_description}</p>
                        </CardContent>
                    </Card>
                </div>
            </motion.div>
        </div>
    );
};

export default ParticipantDashboard;
