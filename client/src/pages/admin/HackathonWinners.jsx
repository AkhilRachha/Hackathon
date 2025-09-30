import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import DefaultLayout from '@/components/DefaultLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import { toast } from '@/hooks/use-toast'; // Assuming toast is available via the hook

const HackathonWinners = () => {
    // Replaced Mock data with state and added loading
    const [pastHackathons, setPastHackathons] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWinners = async () => {
            try {
                // Fetch past winners from the backend
                const response = await axios.get('http://localhost:5000/api/hackathon-winners');
                setPastHackathons(response.data);
            } catch (error) {
                console.error("Error fetching hackathon winners:", error);
                toast({ title: "Error", description: "Failed to fetch hackathon winners." });
            } finally {
                setLoading(false);
            }
        };
        fetchWinners();
    }, []);

    if (loading) {
        return (
            <DefaultLayout userRole="admin">
                <div className="flex justify-center items-center min-h-screen">Loading Winners Data...</div>
            </DefaultLayout>
        );
    }

    return (
        <DefaultLayout userRole="admin">
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50/30">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
                >
                    <h1 className="text-4xl font-bold mb-8">Hackathon Winners</h1>

                    {pastHackathons.length > 0 ? (
                        pastHackathons.map(hackathon => (
                            <Card key={hackathon.id} className="mb-8">
                                <CardHeader>
                                    <CardTitle className="text-2xl">{hackathon.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center text-xl">
                                        <Trophy className="h-6 w-6 mr-2 text-yellow-500" />
                                        <span className="font-bold">Winner:</span>&nbsp;{hackathon.winner}
                                    </div>
                                    <div className="flex items-center text-lg">
                                        <Trophy className="h-5 w-5 mr-2 text-gray-400" />
                                        <span>1st Runner-up:</span>&nbsp;{hackathon.firstRunnerUp}
                                    </div>
                                    <div className="flex items-center text-lg">
                                        <Trophy className="h-5 w-5 mr-2 text-orange-400" />
                                        <span>2nd Runner-up:</span>&nbsp;{hackathon.secondRunnerUp}
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card>
                            <CardContent className="p-8 text-center text-gray-500">
                                No past hackathons to display.
                            </CardContent>
                        </Card>
                    )}
                </motion.div>
            </div>
        </DefaultLayout>
    );
};

export default HackathonWinners;