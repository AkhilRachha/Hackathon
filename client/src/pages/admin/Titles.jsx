import { useState } from 'react';
import { motion } from 'framer-motion';
import DefaultLayout from '@/components/DefaultLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Save } from 'lucide-react';
import axios from 'axios';

const Titles = () => {
    // Mock data - replace with API calls
    const [domains, setDomains] = useState([
        {
            name: "Web Development",
            projects: [
                { title: "E-commerce Platform", criteria: ["UI/UX", "Functionality", "Scalability"] },
                { title: "Portfolio Website", criteria: ["Design", "Responsiveness", "Content"] }
            ]
        },
        {
            name: "Machine Learning",
            projects: [
                { title: "AI Chatbot", criteria: ["Accuracy", "Natural Language Processing", "Integration"] },
            ]
        }
    ]);

    const handleAddCriteria = (domainIndex, projectIndex) => {
        const newDomains = [...domains];
        newDomains[domainIndex].projects[projectIndex].criteria.push("");
        setDomains(newDomains);
    };

    const handleCriteriaChange = (domainIndex, projectIndex, criteriaIndex, value) => {
        const newDomains = [...domains];
        newDomains[domainIndex].projects[projectIndex].criteria[criteriaIndex] = value;
        setDomains(newDomains);
    };

    const handleSaveChanges = async (domainIndex, projectIndex) => {
        const project = domains[domainIndex].projects[projectIndex];
        try {
            // This is a placeholder for the API call to save the criteria
            // await axios.post('http://localhost:5000/api/questions', {
            //     q_title: project.title,
            //     q_description: "...", // You might want to add a description field
            //     domain: domains[domainIndex].name,
            //     evaluationCriteria: project.criteria
            // });
            alert(`Saved criteria for ${project.title}`);
        } catch (error) {
            console.error("Error saving criteria:", error);
            alert("Failed to save criteria.");
        }
    };

    return (
        <DefaultLayout userRole="admin">
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
                >
                    <h1 className="text-4xl font-bold mb-8">Manage Project Titles & Criteria</h1>

                    <div className="space-y-8">
                        {domains.map((domain, domainIndex) => (
                            <Card key={domain.name}>
                                <CardHeader>
                                    <CardTitle className="text-2xl">{domain.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {domain.projects.map((project, projectIndex) => (
                                        <Card key={project.title} className="p-4">
                                            <CardHeader>
                                                <CardTitle>{project.title}</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <Label className="font-semibold">Evaluation Criteria</Label>
                                                <div className="space-y-2 mt-2">
                                                    {project.criteria.map((criterion, criteriaIndex) => (
                                                        <Input
                                                            key={criteriaIndex}
                                                            value={criterion}
                                                            onChange={(e) => handleCriteriaChange(domainIndex, projectIndex, criteriaIndex, e.target.value)}
                                                        />
                                                    ))}
                                                </div>
                                                <div className="flex justify-between mt-4">
                                                    <Button variant="outline" size="sm" onClick={() => handleAddCriteria(domainIndex, projectIndex)}>
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Add Criterion
                                                    </Button>
                                                    <Button size="sm" onClick={() => handleSaveChanges(domainIndex, projectIndex)}>
                                                        <Save className="h-4 w-4 mr-2" />
                                                        Save Changes
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
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