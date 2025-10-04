import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DefaultLayout from '@/components/DefaultLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getHackathonById, updateHackathonQuestions } from '@/api/hackathonApi';
import { getAllQuestions } from '@/api/questionApi';

// Reusable ListBox component for displaying questions
const QuestionListBox = ({ questions, selected, setSelected, title, description }) => (
    <div className="space-y-3">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
        <div className="border rounded-md h-80 overflow-y-auto bg-gray-50/70 p-2 shadow-inner">
            {questions.length === 0 ? (
                <p className="text-center text-gray-500 py-4 text-sm">No questions found.</p>
            ) : (
                questions.map(q => (
                    <div
                        key={q._id}
                        className={`p-2 cursor-pointer rounded-md mb-1 text-sm transition-all ${
                            selected.includes(q._id) 
                            ? 'bg-blue-200 border border-blue-500 shadow-md' 
                            : 'hover:bg-gray-100'
                        }`}
                        onClick={() => {
                            setSelected(prev => 
                                prev.includes(q._id)
                                    ? prev.filter(id => id !== q._id)
                                    : [...prev, q._id]
                            );
                        }}
                    >
                        <p className="font-medium">{q.q_title}</p>
                        <p className="text-xs text-gray-600">{q.domain}</p>
                    </div>
                ))
            )}
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
    
    // State for the two lists
    const [availableQuestions, setAvailableQuestions] = useState([]);
    const [assignedQuestions, setAssignedQuestions] = useState([]);
    
    // State for selections
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

                const assignedIds = new Set(hackathonData.questions || []);
                const assigned = allQuestionsData.filter(q => assignedIds.has(q._id));
                const available = allQuestionsData.filter(q => !assignedIds.has(q._id));
                
                setAssignedQuestions(assigned);
                setAvailableQuestions(available);
                setAllQuestions(allQuestionsData);

            } catch (error) {
                toast({ title: "Error", description: "Failed to load data.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [hackathonId, toast]);

    const handleAssign = () => {
        const toAssign = availableQuestions.filter(q => selectedAvailable.includes(q._id));
        setAssignedQuestions([...assignedQuestions, ...toAssign]);
        setAvailableQuestions(availableQuestions.filter(q => !selectedAvailable.includes(q._id)));
        setSelectedAvailable([]);
    };
    
    const handleUnassign = () => {
        const toUnassign = assignedQuestions.filter(q => selectedAssigned.includes(q._id));
        setAvailableQuestions([...availableQuestions, ...toUnassign]);
        setAssignedQuestions(assignedQuestions.filter(q => !selectedAssigned.includes(q._id)));
        setSelectedAssigned([]);
    };

    const handleSaveChanges = async () => {
        setLoading(true);
        try {
            const assignedIds = assignedQuestions.map(q => q._id);
            await updateHackathonQuestions(hackathonId, assignedIds);
            toast({ title: "Success", description: "Question mapping has been saved." });
            navigate(`/admin/manage-hackathon/${hackathonId}`);
        } catch (error) {
            toast({ title: "Error", description: "Failed to save changes.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };
    
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filteredAvailable = availableQuestions.filter(q => q.q_title.toLowerCase().includes(lowerCaseSearchTerm));
    const filteredAssigned = assignedQuestions.filter(q => q.q_title.toLowerCase().includes(lowerCaseSearchTerm));
    
    if (loading) {
        return <DefaultLayout userRole="admin"><Skeleton className="h-[600px] m-8" /></DefaultLayout>;
    }

    return (
        <DefaultLayout userRole="admin">
            <div className="p-8 max-w-7xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <Button onClick={() => navigate(`/admin/manage-hackathon/${hackathonId}`)} variant="outline">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <h1 className="text-3xl font-bold">Question Mapping</h1>
                    <Button onClick={handleSaveChanges} disabled={loading}>
                        <Save className="w-4 h-4 mr-2" /> {loading ? "Saving..." : "Save Changes"}
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Map Questions to "{hackathon?.title}"</CardTitle>
                        <CardDescription>Select questions from the "Available" list and move them to the "Assigned" list for this hackathon.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Input 
                            placeholder="Search questions in both lists..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                            <QuestionListBox 
                                title="Available Questions"
                                description={`Questions not yet assigned. (${filteredAvailable.length} shown)`}
                                questions={filteredAvailable}
                                selected={selectedAvailable}
                                setSelected={setSelectedAvailable}
                            />
                            
                            <div className="flex lg:flex-col justify-center gap-4">
                                <Button onClick={handleAssign} disabled={selectedAvailable.length === 0}><ArrowRight className="w-4 h-4" /></Button>
                                <Button onClick={handleUnassign} disabled={selectedAssigned.length === 0} variant="destructive"><ArrowLeft className="w-4 h-4" /></Button>
                            </div>

                            <QuestionListBox 
                                title="Assigned Questions"
                                description={`Questions for this event. (${filteredAssigned.length} shown)`}
                                questions={filteredAssigned}
                                selected={selectedAssigned}
                                setSelected={setSelectedAssigned}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DefaultLayout>
    );
};

export default QuestionMapping;