import { useState } from 'react';
import { motion } from 'framer-motion';
import DefaultLayout from '@/components/DefaultLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from '@/hooks/use-toast'; // Ensure toast is imported

const CreateHackathon = () => {
    const [hackathonData, setHackathonData] = useState({
        title: '',
        startDate: '',
        endDate: '',
        registrationDeadline: '',
        venue: '',
        status: 'upcoming' // Default status
    });
    const [isEventCreated, setIsEventCreated] = useState(false);
    const navigate = useNavigate();

    const handleInputChange = (field, value) => {
        setHackathonData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCreateHackathon = async () => {
        if (!hackathonData.title || !hackathonData.startDate || !hackathonData.endDate || !hackathonData.registrationDeadline || !hackathonData.venue) {
            toast({ title: "Validation Error", description: "Please fill in all required fields." });
            return;
        }

        try {
            // 1. CHECK FOR ACTIVE/UPCOMING HACKATHONS
            // This assumes you have a new backend route /api/hackathons/active-or-upcoming
            const checkResponse = await axios.get('http://localhost:5000/api/hackathons/active-or-upcoming');
            
            if (checkResponse.data.exists) {
                toast({ 
                    title: "Creation Blocked", 
                    description: "An active or upcoming hackathon already exists. You can only create one at a time." 
                });
                return; // Stop creation if an event already exists
            }

            // 2. CREATE NEW HACKATHON
            const response = await axios.post('http://localhost:5000/api/hackathons', hackathonData);
            setIsEventCreated(true);
            toast({ title: "Success", description: "Hackathon created successfully!" }); 
            
            // Redirect after successful creation
            setTimeout(() => navigate('/admin/view-hackathon'), 2000); 

        } catch (error) {
            // Handle errors from both the check and the creation API calls
            console.error("Error creating hackathon:", error);
            const errorMessage = error.response?.data?.message || error.message;

            // If the error is from the check route but not the expected "not found"
            if (error.config.url.endsWith('/active-or-upcoming')) {
                 toast({ title: "Error Checking Events", description: `Could not verify current event status. ${errorMessage}` });
            } else {
                 toast({ title: "Error", description: `Failed to create hackathon. ${errorMessage}` });
            }
        }
    };

    return (
        <DefaultLayout userRole="admin">
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
                >
                    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center text-2xl font-bold">
                                <Plus className="w-6 h-6 mr-3 text-blue-600" />
                                Create Hackathon Event
                            </CardTitle>
                            <CardDescription className="text-base">
                                Fill in the details to set up a new hackathon.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-sm font-semibold text-gray-700">Hackathon Title</Label>
                                    <Input id="title" placeholder="Enter hackathon title" value={hackathonData.title} onChange={(e) => handleInputChange('title', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="venue" className="text-sm font-semibold text-gray-700">Venue</Label>
                                    <Input id="venue" placeholder="Enter venue" value={hackathonData.venue} onChange={(e) => handleInputChange('venue', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="startDate" className="text-sm font-semibold text-gray-700">Start Date & Time</Label>
                                    <Input id="startDate" type="datetime-local" value={hackathonData.startDate} onChange={(e) => handleInputChange('startDate', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="endDate" className="text-sm font-semibold text-gray-700">End Date & Time</Label>
                                    <Input id="endDate" type="datetime-local" value={hackathonData.endDate} onChange={(e) => handleInputChange('endDate', e.target.value)} />
                                </div>
                                <div className="space-y-2 lg:col-span-2">
                                    <Label htmlFor="registrationDeadline" className="text-sm font-semibold text-gray-700">Registration Deadline</Label>
                                    <Input id="registrationDeadline" type="datetime-local" value={hackathonData.registrationDeadline} onChange={(e) => handleInputChange('registrationDeadline', e.target.value)} />
                                </div>
                            </div>
                            <Button onClick={handleCreateHackathon} className="w-full lg:w-auto" disabled={!hackathonData.title || !hackathonData.startDate || !hackathonData.endDate || !hackathonData.registrationDeadline || !hackathonData.venue}>
                                <Plus className="w-5 h-5 mr-2" />
                                Create Hackathon
                            </Button>
                        </CardContent>
                    </Card>
                    {isEventCreated && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="mt-8"
                        >
                            <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
                                <CardHeader>
                                    <CardTitle className="flex items-center text-emerald-800 text-xl">
                                        <CheckCircle className="w-6 h-6 mr-3" />
                                        Event Created Successfully!
                                    </CardTitle>
                                </CardHeader>
                            </Card>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </DefaultLayout>
    );
};

export default CreateHackathon;