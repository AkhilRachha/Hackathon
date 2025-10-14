import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
    Trophy,
    Medal,
    Award,
    Star,
    Users,
    Github,
    ExternalLink,
    Crown,
    Loader2
} from "lucide-react";
import { getAllEvaluations, announceWinners } from "@/api/evaluationApi";

const WinnerSelection = ({
    hackathon,
    teams,
    allTeamScores,
    onWinnersAnnounced,
    open,
    setOpen
}) => {
    const [allScores, setAllScores] = useState([]);
    const [selectedWinners, setSelectedWinners] = useState({
        firstPlace: null,
        secondPlace: null,
        thirdPlace: null
    });
    const [loading, setLoading] = useState(false);
    const [announcing, setAnnouncing] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (open && allTeamScores) {
            processTeamScores();
        }
    }, [open, allTeamScores]);

    const processTeamScores = () => {
        try {
            setLoading(true);

            // Map team scores with team details
            const teamScores = teams.map(team => {
                const teamScore = allTeamScores.find(score =>
                    score.team_id && score.team_id._id === team._id
                );

                return {
                    team,
                    averageScore: teamScore ? teamScore.total_score : 0,
                    evaluationCount: teamScore ? teamScore.evaluation_count : 0,
                    evaluators: teamScore ? teamScore.evaluators : []
                };
            });

            // Sort by average score (highest first)
            teamScores.sort((a, b) => b.averageScore - a.averageScore);
            setAllScores(teamScores);
            setLoading(false);
        } catch (error) {
            console.error("Error processing scores:", error);
            toast({
                title: "Error",
                description: "Failed to process evaluation scores",
                variant: "destructive"
            });
            setLoading(false);
        }
    };

    const handleWinnerSelect = (position, teamScore) => {
        // Check if team is already selected for another position
        const currentSelections = Object.values(selectedWinners);
        if (currentSelections.some(winner => winner && winner.team._id === teamScore.team._id)) {
            toast({
                title: "Team Already Selected",
                description: "This team is already selected for another position",
                variant: "destructive"
            });
            return;
        }

        setSelectedWinners(prev => ({
            ...prev,
            [position]: teamScore
        }));
    };

    const handleAnnounceWinners = async () => {
        if (!selectedWinners.firstPlace || !selectedWinners.secondPlace || !selectedWinners.thirdPlace) {
            toast({
                title: "Incomplete Selection",
                description: "Please select winners for all three positions",
                variant: "destructive"
            });
            return;
        }

        setAnnouncing(true);
        try {
            const winnersData = {
                hackathon_id: hackathon._id,
                firstPlace: selectedWinners.firstPlace.team._id,
                secondPlace: selectedWinners.secondPlace.team._id,
                thirdPlace: selectedWinners.thirdPlace.team._id
            };

            await announceWinners(winnersData);

            toast({
                title: "Winners Announced! 🎉",
                description: "Hackathon winners have been successfully announced. All users have been cleared from the hackathon and evaluator/coordinator roles reset to participant.",
            });

            if (onWinnersAnnounced) {
                onWinnersAnnounced();
            }

            setOpen(false);
        } catch (error) {
            toast({
                title: "Announcement Failed",
                description: error.response?.data?.message || "Failed to announce winners",
                variant: "destructive"
            });
        } finally {
            setAnnouncing(false);
        }
    };

    const getPositionIcon = (position) => {
        switch (position) {
            case 'firstPlace': return <Crown className="w-5 h-5 text-yellow-500" />;
            case 'secondPlace': return <Medal className="w-5 h-5 text-gray-400" />;
            case 'thirdPlace': return <Award className="w-5 h-5 text-amber-600" />;
            default: return null;
        }
    };

    const getPositionColor = (position) => {
        switch (position) {
            case 'firstPlace': return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case 'secondPlace': return "bg-gray-100 text-gray-800 border-gray-200";
            case 'thirdPlace': return "bg-amber-100 text-amber-800 border-amber-200";
            default: return "bg-blue-100 text-blue-800 border-blue-200";
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-yellow-500" />
                        Select Winners - {hackathon.hackathon_name}
                    </DialogTitle>
                    <DialogDescription>
                        Review all team scores and select the top 3 winners
                    </DialogDescription>
                </DialogHeader>

                <div className="grid lg:grid-cols-3 gap-6 mt-6">
                    {/* Winner Selection Cards */}
                    <div className="lg:col-span-1 space-y-4">
                        <h3 className="text-lg font-semibold">Selected Winners</h3>

                        {/* First Place */}
                        <Card className={`border-2 ${selectedWinners.firstPlace ? 'border-yellow-400 bg-yellow-50' : 'border-dashed border-gray-300'}`}>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Crown className="w-4 h-4 text-yellow-500" />
                                    1st Place Winner
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {selectedWinners.firstPlace ? (
                                    <div>
                                        <p className="font-medium">{selectedWinners.firstPlace.team.team_name}</p>
                                        <p className="text-sm text-gray-600">Score: {selectedWinners.firstPlace.averageScore}/10</p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-2"
                                            onClick={() => setSelectedWinners(prev => ({ ...prev, firstPlace: null }))}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm">Click on a team to select</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Second Place */}
                        <Card className={`border-2 ${selectedWinners.secondPlace ? 'border-gray-400 bg-gray-50' : 'border-dashed border-gray-300'}`}>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Medal className="w-4 h-4 text-gray-400" />
                                    2nd Place (Runner-up 1st)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {selectedWinners.secondPlace ? (
                                    <div>
                                        <p className="font-medium">{selectedWinners.secondPlace.team.team_name}</p>
                                        <p className="text-sm text-gray-600">Score: {selectedWinners.secondPlace.averageScore}/10</p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-2"
                                            onClick={() => setSelectedWinners(prev => ({ ...prev, secondPlace: null }))}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm">Click on a team to select</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Third Place */}
                        <Card className={`border-2 ${selectedWinners.thirdPlace ? 'border-amber-400 bg-amber-50' : 'border-dashed border-gray-300'}`}>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Award className="w-4 h-4 text-amber-600" />
                                    3rd Place (Runner-up 2nd)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {selectedWinners.thirdPlace ? (
                                    <div>
                                        <p className="font-medium">{selectedWinners.thirdPlace.team.team_name}</p>
                                        <p className="text-sm text-gray-600">Score: {selectedWinners.thirdPlace.averageScore}/10</p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-2"
                                            onClick={() => setSelectedWinners(prev => ({ ...prev, thirdPlace: null }))}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm">Click on a team to select</p>
                                )}
                            </CardContent>
                        </Card>

                        <Button
                            onClick={handleAnnounceWinners}
                            disabled={!selectedWinners.firstPlace || !selectedWinners.secondPlace || !selectedWinners.thirdPlace || announcing}
                            className="w-full"
                            size="lg"
                        >
                            {announcing ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Trophy className="mr-2 h-4 w-4" />
                            )}
                            Announce Winners
                        </Button>
                    </div>

                    {/* Scores Table */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Star className="w-5 h-5 text-yellow-500" />
                                    Team Rankings & Scores
                                </CardTitle>
                                <CardDescription>
                                    All teams ranked by average evaluation score
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                        <span className="ml-2">Loading scores...</span>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Rank</TableHead>
                                                <TableHead>Team</TableHead>
                                                <TableHead>Project</TableHead>
                                                <TableHead>Avg Score</TableHead>
                                                <TableHead>Evaluations</TableHead>
                                                <TableHead>Repository</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {allScores.map((teamScore, index) => (
                                                <TableRow key={teamScore.team._id} className="hover:bg-gray-50">
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-lg">#{index + 1}</span>
                                                            {index === 0 && <Crown className="w-4 h-4 text-yellow-500" />}
                                                            {index === 1 && <Medal className="w-4 h-4 text-gray-400" />}
                                                            {index === 2 && <Award className="w-4 h-4 text-amber-600" />}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">{teamScore.team.team_name}</p>
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {teamScore.team.members?.slice(0, 2).map((member, idx) => (
                                                                    <Badge key={idx} variant="secondary" className="text-xs">
                                                                        {member.user_name}
                                                                    </Badge>
                                                                ))}
                                                                {teamScore.team.members?.length > 2 && (
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        +{teamScore.team.members.length - 2}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                                            {teamScore.team.q_id?.q_title || "No Project"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1">
                                                            <Star className="w-4 h-4 text-yellow-500" />
                                                            <span className="font-bold text-lg">{teamScore.averageScore}</span>
                                                            <span className="text-gray-500">/10</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <Badge variant="outline">
                                                                {teamScore.evaluationCount} evaluation{teamScore.evaluationCount !== 1 ? 's' : ''}
                                                            </Badge>
                                                            {teamScore.evaluators && teamScore.evaluators.length > 0 && (
                                                                <div className="text-xs text-gray-500">
                                                                    By: {teamScore.evaluators.join(', ')}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {teamScore.team.github_submission?.url ? (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => window.open(teamScore.team.github_submission.url, "_blank")}
                                                            >
                                                                <Github className="w-4 h-4 mr-1" />
                                                                <ExternalLink className="w-3 h-3" />
                                                            </Button>
                                                        ) : (
                                                            <span className="text-gray-500 text-sm">No repo</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-1">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleWinnerSelect('firstPlace', teamScore)}
                                                                className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                                                            >
                                                                1st
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleWinnerSelect('secondPlace', teamScore)}
                                                                className="text-gray-600 border-gray-600 hover:bg-gray-50"
                                                            >
                                                                2nd
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleWinnerSelect('thirdPlace', teamScore)}
                                                                className="text-amber-600 border-amber-600 hover:bg-amber-50"
                                                            >
                                                                3rd
                                                            </Button>
                                                        </div>
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
            </DialogContent>
        </Dialog>
    );
};

export default WinnerSelection;