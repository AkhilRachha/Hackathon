import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DefaultLayout from '@/components/DefaultLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ArrowRight, Save, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getHackathonById, updateHackathonQuestions } from '@/api/hackathonApi';
import { getAllQuestions } from '@/api/questionApi';

const QuestionListBox = ({ questions, selected, setSelected, title, description }) => (
    <div className="space-y-3">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
        <div className="border rounded-md h-80 overflow-y-auto bg-gray-50/70 p-2 shadow-inner">
            {questions.length > 0 ? (
                questions.map(q => (
                    <div
                        key={q._id}
                        className={`p-2 cursor-pointer rounded-md mb-1 text-sm ${selected.includes(q._id) ? 'bg-blue-200' : 'hover:bg-gray-100'}`}
                        onClick={() => setSelected(prev => prev.includes(q._id) ? prev.filter(id => id !== q._id) : [...prev, q._id])}
                    >
                        <p className="font-medium">{q.q_title}</p>
                        <p className="text-xs text-gray-600">{q.domain}</p>
                    </div>
                ))
            ) : <p className="text-center text-gray-500 py-4 text-sm">No questions found.</p>}
        </div>
    </div>
);

const QuestionMapping = () => {
    const { hackathonId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [hackathon, setHackathon] = useState(null);
    const [allQuestions, setAllQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [assignedQuestionIds, setAssignedQuestionIds] = useState(new Set());
    const [selectedAvailable, setSelectedAvailable] = useState([]);
    const [selectedAssigned, setSelectedAssigned] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [hackathonData, allQuestionsData] = await Promise.all([
                    getHackathonById(hackathonId),
                    getAllQuestions(),
                ]);

                setHackathon(hackathonData);
                setAllQuestions(allQuestionsData);
                const assignedIds = new Set((hackathonData.questions || []).map(q => q._id));
                setAssignedQuestionIds(assignedIds);

                // Check if hackathon is completed and show warning
                if (hackathonData.status === 'completed') {
                    toast({
                        title: "Event Completed",
                        description: "This hackathon has been completed. Question assignments are no longer allowed.",
                        variant: "destructive"
                    });
                }

            } catch (error) {
                toast({ title: "Error", description: "Failed to load mapping data.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [hackathonId, toast]);

    const handleAssign = () => {
        const newAssignedIds = new Set(assignedQuestionIds);
        selectedAvailable.forEach(id => newAssignedIds.add(id));
        setAssignedQuestionIds(newAssignedIds);
        setSelectedAvailable([]);
    };
    
    const handleUnassign = () => {
        const newAssignedIds = new Set(assignedQuestionIds);
        selectedAssigned.forEach(id => newAssignedIds.delete(id));
        setAssignedQuestionIds(newAssignedIds);
        setSelectedAssigned([]);
    };

    const handleSaveChanges = async () => {
        setLoading(true);
        try {
            const idsToSave = Array.from(assignedQuestionIds);
            // --- FIXED: The API function expects the array of IDs as the second argument. ---
            // It then correctly wraps it in a { questionIds: [...] } object before sending.
            await updateHackathonQuestions(hackathonId, idsToSave);
            toast({ title: "Success", description: "Question mapping has been saved." });
            navigate(`/admin/manage-hackathon/${hackathonId}`);
        } catch (error) {
            toast({ title: "Error", description: error.response?.data?.message || "Failed to save changes.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };
    
    const availableQuestions = allQuestions.filter(q => !assignedQuestionIds.has(q._id));
    const assignedQuestions = allQuestions.filter(q => assignedQuestionIds.has(q._id));
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filteredAvailable = availableQuestions.filter(q => q.q_title.toLowerCase().includes(lowerCaseSearchTerm));
    const filteredAssigned = assignedQuestions.filter(q => q.q_title.toLowerCase().includes(lowerCaseSearchTerm));
    
    if (loading) {
        return <DefaultLayout userRole="admin"><Skeleton className="h-[600px] m-8" /></DefaultLayout>;
    }

    // Check if hackathon is completed
    const isCompleted = hackathon?.status === 'completed';

    return (
        <DefaultLayout userRole="admin">
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
                <div className="p-8 max-w-7xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <Button onClick={() => navigate(`/admin/manage-hackathon/${hackathonId}`)} variant="outline"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                        {isCompleted ? 'Questions Overview' : 'Question Mapping'}
                    </h1>
                    <Button 
                        onClick={handleSaveChanges} 
                        disabled={loading || isCompleted}
                        className="disabled:bg-gray-400"
                    >
                        <Save className="w-4 h-4 mr-2" /> 
                        {loading ? "Saving..." : isCompleted ? "Read Only" : "Save Changes"}
                    </Button>
                </div>

                {isCompleted && (
                    <Card className="shadow-lg border-red-200 bg-red-50">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 text-red-700">
                                <AlertTriangle className="w-6 h-6" />
                                <div>
                                    <h3 className="font-semibold">Event Completed</h3>
                                    <p className="text-sm">This hackathon has been completed. Question assignments and modifications are no longer allowed.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
                <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle>Map Questions to "{hackathon?.hackathon_name}"</CardTitle>
                        <CardDescription>
                            {isCompleted 
                                ? "View questions assigned to this completed hackathon."
                                : "Move questions from the \"Available\" list to \"Assigned\". Questions can be used in multiple hackathons."
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Input placeholder="Search questions in both lists..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 items-center">
                            <QuestionListBox 
                                title="Available Questions"
                                description={`All questions in the database.`}
                                questions={filteredAvailable}
                                selected={selectedAvailable}
                                setSelected={setSelectedAvailable}
                            />
                            <div className="flex lg:flex-col justify-center gap-4">
                                <Button 
                                    onClick={handleAssign} 
                                    disabled={selectedAvailable.length === 0 || isCompleted}
                                    className="disabled:bg-gray-400"
                                >
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                                <Button 
                                    onClick={handleUnassign} 
                                    disabled={selectedAssigned.length === 0 || isCompleted} 
                                    variant="destructive"
                                    className="disabled:bg-gray-400"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </Button>
                            </div>
                            <QuestionListBox 
                                title="Assigned Questions"
                                description={`Questions for this event.`}
                                questions={filteredAssigned}
                                selected={selectedAssigned}
                                setSelected={setSelectedAssigned}
                            />
                        </div>
                    </CardContent>
                </Card>
                </div>
            </div>
        </DefaultLayout>
    );
};

export default QuestionMapping;