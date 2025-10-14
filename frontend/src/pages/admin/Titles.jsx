import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { getDomainsAndCriteria, createQuestion, updateQuestion, deleteQuestion } from '@/api/questionApi';
import DefaultLayout from '@/components/DefaultLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Save, Trash, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Titles = () => {
    const [domains, setDomains] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        const fetchTitles = async () => {
            try {
                const data = await getDomainsAndCriteria();
                if (Array.isArray(data)) {
                    setDomains(data);
                } else {
                    toast({ title: "Warning", description: "Data format is incorrect.", variant: 'destructive' });
                }
            } catch (error) {
                toast({ title: "Connection Error", description: "Failed to fetch data.", variant: 'destructive' });
            } finally {
                setLoading(false);
            }
        };
        fetchTitles();
    }, [toast]);

    const handleAddDomain = () => {
        setDomains([...domains, { name: '', criteria: [], projects: [] }]);
    };

    const handleDomainChange = (domainIndex, value) => {
        const newDomains = [...domains];
        newDomains[domainIndex].name = value;
        setDomains(newDomains);
    };

    const handleDeleteDomain = (domainIndex) => {
        setDomains(domains.filter((_, i) => i !== domainIndex));
        toast({ title: "Domain Removed", description: "The domain has been removed locally. Note: Associated projects are not deleted from the database until you save their changes individually." });
    };

    const handleAddCriteria = (domainIndex) => {
        const newDomains = [...domains];
        newDomains[domainIndex].criteria.push({ name: "", maxScore: 10 });
        setDomains(newDomains);
    };

    const handleCriteriaChange = (domainIndex, criteriaIndex, field, value) => {
        const newDomains = [...domains];
        newDomains[domainIndex].criteria[criteriaIndex][field] = field === 'maxScore' ? parseInt(value, 10) || 0 : value;
        setDomains(newDomains);
    };

    const handleDeleteCriteria = (domainIndex, criteriaIndex) => {
        const newDomains = [...domains];
        newDomains[domainIndex].criteria.splice(criteriaIndex, 1);
        setDomains(newDomains);
    };

    const handleAddProject = (domainIndex) => {
        const newDomains = [...domains];
        newDomains[domainIndex].projects.push({ title: "", description: "" });
        setDomains(newDomains);
    };

    const handleProjectChange = (domainIndex, projectIndex, field, value) => {
        const newDomains = [...domains];
        newDomains[domainIndex].projects[projectIndex][field] = value;
        setDomains(newDomains);
    };

    const handleDeleteProject = async (domainIndex, projectIndex) => {
        const project = domains[domainIndex].projects[projectIndex];
        if (project._id) {
            try {
                await deleteQuestion(project._id);
                toast({ title: "Deleted", description: `Project permanently removed from database.` });
            } catch (err) {
                toast({ title: "Error", description: `Failed to delete project from database.`, variant: 'destructive' });
                return;
            }
        }
        const newDomains = [...domains];
        newDomains[domainIndex].projects.splice(projectIndex, 1);
        setDomains(newDomains);
    };

    const handleSaveChanges = async (domainIndex, projectIndex) => {
        const project = domains[domainIndex].projects[projectIndex];
        const domainData = domains[domainIndex];

        const payload = {
            q_title: project.title,
            q_description: project.description,
            domain: domainData.name,
            evaluationCriteria: domainData.criteria.filter(c => c.name.trim() && c.maxScore > 0),
        };

        if (!payload.domain.trim() || !payload.q_title.trim()) {
            return toast({ variant: 'destructive', title: "Validation Error", description: "Domain Name and Project Title are required." });
        }
        if (payload.evaluationCriteria.length === 0) {
            return toast({ variant: 'destructive', title: "Validation Error", description: "Please define at least one valid criterion." });
        }

        try {
            if (project._id) {
                await updateQuestion(project._id, payload);
                toast({ title: "Updated", description: `'${project.title}' updated successfully.` });
            } else {
                const newQuestionData = await createQuestion(payload);
                const newDomains = [...domains];
                newDomains[domainIndex].projects[projectIndex]._id = newQuestionData.question._id;
                setDomains(newDomains);
                toast({ title: "Created", description: `'${project.title}' saved successfully.` });
            }
        } catch (err) {
            toast({ title: "Error Saving", description: `Failed to save project. Please try again.`, variant: 'destructive' });
        }
    };

    if (loading) {
        return (
            <DefaultLayout userRole="admin">
                <div className="flex justify-center items-center min-h-[80vh]">
                    <div className="text-xl font-semibold text-blue-600 flex items-center">
                        <Loader2 className="h-6 w-6 mr-3 animate-spin" /> Loading Domain Structure...
                    </div>
                </div>
            </DefaultLayout>
        );
    }

    return (
        <DefaultLayout userRole="admin">
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-8">
                <motion.div
                    className="max-w-7xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl font-extrabold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent mb-8 border-b pb-4">
                        Manage Project Titles & Criteria
                    </h1>
                    <div className="flex gap-4 mb-8">
                        <Button onClick={handleAddDomain}><Plus className="h-4 w-4 mr-2" /> Add Domain</Button>
                        <Button onClick={() => navigate('/admin')} variant="outline">Back to Dashboard</Button>
                    </div>
                    <div className="space-y-8">
                        {domains.length === 0 && !loading && (
                            <div className="text-center p-12 border-2 border-dashed rounded-xl bg-white">
                                <p className="text-xl font-semibold text-gray-700">No Domains Loaded</p>
                                <p className="text-gray-500 mt-2">Click "Add Domain" to begin creating project titles.</p>
                            </div>
                        )}
                        {domains.map((domain, domainIndex) => (
                            <Card key={domainIndex} className="shadow-2xl border-0 bg-white/90 backdrop-blur-xl">
                                <CardHeader className="flex flex-row justify-between items-center">
                                    <div className="flex-grow mr-4">
                                        <Label htmlFor={`domain-name-${domainIndex}`} className="text-sm font-medium text-gray-500">Domain Name</Label>
                                        <Input
                                            id={`domain-name-${domainIndex}`}
                                            placeholder="Enter Domain Name (e.g., Web Development)"
                                            value={domain.name}
                                            onChange={(e) => handleDomainChange(domainIndex, e.target.value)}
                                            className="text-2xl font-bold h-auto p-2"
                                        />
                                    </div>
                                    <Button size="sm" variant="destructive" onClick={() => handleDeleteDomain(domainIndex)}>
                                        <Trash className="h-4 w-4 mr-2" /> Delete Domain
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <Label className="font-bold text-lg text-gray-800 mb-2">Evaluation Criteria</Label>
                                        <div className="space-y-3 mt-3 p-4 border rounded-lg bg-gray-50">
                                            {domain.criteria.map((criterion, criteriaIndex) => (
                                                <div key={criteriaIndex} className="flex gap-2 items-center">
                                                    <Input placeholder="Criterion Name (e.g., UI/UX)" value={criterion.name} onChange={(e) => handleCriteriaChange(domainIndex, criteriaIndex, "name", e.target.value)} />
                                                    <Input type="number" placeholder="Max Score" value={criterion.maxScore} onChange={(e) => handleCriteriaChange(domainIndex, criteriaIndex, "maxScore", e.target.value)} className="w-28 text-center" />
                                                    <Button size="icon" variant="ghost" onClick={() => handleDeleteCriteria(domainIndex, criteriaIndex)}><Trash className="h-4 w-4 text-red-500" /></Button>
                                                </div>
                                            ))}
                                            <Button variant="outline" size="sm" onClick={() => handleAddCriteria(domainIndex)} className="mt-4"><Plus className="h-4 w-4 mr-2" /> Add Criterion</Button>
                                        </div>
                                    </div>
                                    <div className="mt-6">
                                        <h3 className="font-bold text-xl text-gray-800 mb-4">Projects / Problem Statements</h3>
                                        <Button size="sm" onClick={() => handleAddProject(domainIndex)} className="mb-6"><Plus className="h-4 w-4 mr-2" /> Add Project</Button>
                                        <div className="space-y-6">
                                            {domain.projects.map((project, projectIndex) => (
                                                <Card key={project._id || projectIndex} className="p-4 bg-white border">
                                                    <div className="space-y-4">
                                                        <div>
                                                            <Label htmlFor={`project-title-${projectIndex}`} className="font-semibold">Project Title</Label>
                                                            <Input id={`project-title-${projectIndex}`} placeholder="Enter Project Title" value={project.title} onChange={(e) => handleProjectChange(domainIndex, projectIndex, "title", e.target.value)} />
                                                        </div>
                                                        <div>
                                                            <Label htmlFor={`project-desc-${projectIndex}`} className="font-semibold">Description</Label>
                                                            <Input id={`project-desc-${projectIndex}`} placeholder="Enter a brief description" value={project.description} onChange={(e) => handleProjectChange(domainIndex, projectIndex, "description", e.target.value)} />
                                                        </div>
                                                        <div className="flex justify-between items-center pt-2 border-t">
                                                            <Button size="sm" variant="destructive" onClick={() => handleDeleteProject(domainIndex, projectIndex)}><Trash className="h-4 w-4 mr-1" /> Delete</Button>
                                                            <Button size="sm" onClick={() => handleSaveChanges(domainIndex, projectIndex)}><Save className="h-4 w-4 mr-2" /> {project._id ? "Update" : "Save"}</Button>
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </motion.div>
            </div>
        </DefaultLayout>
    );
};

export default Titles;