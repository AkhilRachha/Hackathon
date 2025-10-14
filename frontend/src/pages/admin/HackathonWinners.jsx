import { useEffect, useState, useCallback, useRef } from 'react';
import DefaultLayout from '@/components/DefaultLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Calendar, Award, Star, RefreshCw, MapPin } from 'lucide-react';
import { getHackathonWinners } from '@/api/hackathonApi';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const HackathonWinners = () => {
    const [completedHackathons, setCompletedHackathons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [autoRefresh] = useState(true); // Keep auto-refresh enabled but hidden
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const { toast } = useToast();
    const intervalRef = useRef(null);

    // Request notification permission on component mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                setNotificationsEnabled(permission === 'granted');
            });
        } else if ('Notification' in window && Notification.permission === 'granted') {
            setNotificationsEnabled(true);
        }
    }, []);

    const fetchWinners = useCallback(async (showRefreshingState = false) => {
        try {
            if (showRefreshingState) {
                setRefreshing(true);
            }

            const data = await getHackathonWinners();
            if (Array.isArray(data)) {
                // Check if there are new winners
                const newWinnersCount = data.length;
                const oldWinnersCount = completedHackathons.length;

                setCompletedHackathons(data);
                setLastUpdated(new Date());
                setError(null);

                // Show notification if new winners were announced
                if (oldWinnersCount > 0 && newWinnersCount > oldWinnersCount) {
                    const newWinners = newWinnersCount - oldWinnersCount;
                    const message = `${newWinners} new hackathon winner(s) have been announced.`;

                    // Show toast notification
                    toast({
                        title: "New Winners Announced! 🎉",
                        description: message,
                    });

                    // Show browser notification if enabled
                    if (notificationsEnabled && 'Notification' in window) {
                        new Notification('🏆 New Hackathon Winners!', {
                            body: message,
                            icon: '/favicon.ico',
                            tag: 'hackathon-winners'
                        });
                    }
                }
            } else {
                setCompletedHackathons([]);
                console.warn("API did not return an array for winners:", data);
            }
        } catch (err) {
            console.error("Error fetching winners:", err);
            setError('Failed to fetch hackathon winners list.');
            if (showRefreshingState) {
                toast({
                    title: "Error",
                    description: "Failed to refresh winners data.",
                    variant: "destructive",
                });
            }
        } finally {
            setLoading(false);
            if (showRefreshingState) {
                setRefreshing(false);
            }
        }
    }, [completedHackathons.length, toast]);

    // Initial load
    useEffect(() => {
        fetchWinners();
    }, []);

    // Auto-refresh every 30 seconds when enabled
    useEffect(() => {
        if (autoRefresh) {
            intervalRef.current = setInterval(() => {
                fetchWinners();
            }, 30000); // 30 seconds
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [autoRefresh, fetchWinners]);

    const handleManualRefresh = () => {
        fetchWinners(true);
    };



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

    if (loading) { /* ... loading skeleton ... */ }
    if (error) { /* ... error card ... */ }

    return (
        <DefaultLayout userRole="admin">
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
                <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-yellow-500 rounded-full shadow-lg">
                                    <Trophy className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-yellow-800">{completedHackathons.length}</p>
                                    <p className="text-sm font-medium text-yellow-700">Completed Hackathons</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-500 rounded-full shadow-lg">
                                    <Award className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-green-800">
                                        {completedHackathons.filter(h =>
                                            h.winnersAnnouncedAt &&
                                            new Date() - new Date(h.winnersAnnouncedAt) < 24 * 60 * 60 * 1000
                                        ).length}
                                    </p>
                                    <p className="text-sm font-medium text-green-700">Winners Announced Today</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-500 rounded-full shadow-lg">
                                    <Calendar className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-purple-800">
                                        {completedHackathons.filter(h =>
                                            h.winnersAnnouncedAt &&
                                            new Date() - new Date(h.winnersAnnouncedAt) < 7 * 24 * 60 * 60 * 1000
                                        ).length}
                                    </p>
                                    <p className="text-sm font-medium text-purple-700">Winners This Week</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-xl">
                    <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50 border-b border-yellow-100">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
                                    <Award className="w-8 h-8 text-yellow-600" /> Hackathon Winners & Results
                                </CardTitle>
                                <CardDescription className="mt-3 text-gray-700">
                                    Complete overview of all hackathon events with detailed winner information, venues, and timelines.
                                    {lastUpdated && (
                                        <span className="block mt-2 text-sm text-gray-600 bg-white/50 px-2 py-1 rounded-md inline-block">
                                            📅 Last updated: {format(lastUpdated, 'MMM d, yyyy h:mm:ss a')}
                                        </span>
                                    )}
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleManualRefresh}
                                    disabled={refreshing}
                                    className="hover:bg-blue-50"
                                >
                                    <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
                                    {refreshing ? 'Refreshing...' : 'Refresh'}
                                </Button>
                            </div>
                        </div>
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
                                        <TableHead className="w-[20%]">Hackathon Details</TableHead>
                                        <TableHead className="text-center">Duration</TableHead>
                                        <TableHead className="text-center">Venue</TableHead>
                                        <TableHead className="text-center">Winners Announced</TableHead>
                                        <TableHead className="w-[12%]">1st Place</TableHead>
                                        <TableHead className="w-[12%]">2nd Place</TableHead>
                                        <TableHead className="w-[12%]">3rd Place</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {completedHackathons.map((hackathon) => (
                                        <TableRow key={hackathon._id} className={
                                            hackathon.winnersAnnouncedAt &&
                                                new Date() - new Date(hackathon.winnersAnnouncedAt) < 60 * 60 * 1000 // 1 hour
                                                ? "bg-green-50 border-l-4 border-green-400"
                                                : ""
                                        }>
                                            <TableCell className="font-medium">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg text-blue-800 font-semibold">
                                                            {hackathon.hackathon_name}
                                                        </span>
                                                        {hackathon.winnersAnnouncedAt &&
                                                            new Date() - new Date(hackathon.winnersAnnouncedAt) < 60 * 60 * 1000 && (
                                                                <Badge className="bg-green-500 text-white text-xs animate-pulse">
                                                                    NEW
                                                                </Badge>
                                                            )}
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        ID: {hackathon._id.slice(-8)}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center text-gray-600">
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-center gap-1 text-sm">
                                                        <Calendar className="w-4 h-4" />
                                                        <span className="font-medium">Start:</span>
                                                        {format(new Date(hackathon.start_datetime), 'MMM d, yyyy')}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {format(new Date(hackathon.start_datetime), 'h:mm a')}
                                                    </div>
                                                    <div className="flex items-center justify-center gap-1 text-sm">
                                                        <Calendar className="w-4 h-4" />
                                                        <span className="font-medium">End:</span>
                                                        {format(new Date(hackathon.end_datetime), 'MMM d, yyyy')}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {format(new Date(hackathon.end_datetime), 'h:mm a')}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center text-gray-600">
                                                <div className="flex items-center justify-center gap-1">
                                                    <MapPin className="w-4 h-4" />
                                                    <span className="text-sm font-medium">
                                                        {hackathon.venue || 'Not specified'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {hackathon.winnersAnnouncedAt ? (
                                                    <div className="text-sm">
                                                        <div className="flex items-center justify-center gap-1 text-green-600">
                                                            <Trophy className="w-4 h-4" />
                                                            {format(new Date(hackathon.winnersAnnouncedAt), 'MMM d, yyyy')}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {format(new Date(hackathon.winnersAnnouncedAt), 'h:mm a')}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-gray-200 text-gray-700">
                                                        Not announced
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>{getWinnerBadge(hackathon.winners.firstPlace, 1)}</TableCell>
                                            <TableCell>{getWinnerBadge(hackathon.winners.secondPlace, 2)}</TableCell>
                                            <TableCell>{getWinnerBadge(hackathon.winners.thirdPlace, 3)}</TableCell>
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

export default HackathonWinners;    