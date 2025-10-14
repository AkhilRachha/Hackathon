import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createHackathon } from "@/api/hackathonApi";
import DefaultLayout from '@/components/DefaultLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, Clock, Plus } from "lucide-react";
import { format } from "date-fns";
import { toast } from '@/hooks/use-toast'; 
import { motion } from 'framer-motion';

const CreateHackathon = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        hackathon_name: "",
        venue: "",
        registrationDeadline: null,
        start_datetime: null,
        mid_submission_datetime: null,
        end_datetime: null,
        limits: {
            totalParticipants: "",
            totalTeams: "",
            totalCoordinators: "",
            totalEvaluators: "",
            maxMembersPerTeam: ""
        }
    });
    const [loading, setLoading] = useState(false);

    const handleDateChange = (date, field) => {
        setFormData({ ...formData, [field]: date });
    };
    
    const handleTimeChange = (e, field) => {
        const time = e.target.value;
        if (!time || !formData[field]) return;

        const [hours, minutes] = time.split(':').map(Number);
        const newDate = new Date(formData[field]);
        newDate.setHours(hours, minutes, 0, 0);
        setFormData({ ...formData, [field]: newDate });
    };

    const handleLimitChange = (e, limitField) => {
        const value = e.target.value;
        setFormData({
            ...formData,
            limits: {
                ...formData.limits,
                [limitField]: value
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Validate all required fields
        const { hackathon_name, venue, registrationDeadline, start_datetime, mid_submission_datetime, end_datetime, limits } = formData;
        
        if (!hackathon_name || !venue || !registrationDeadline || !start_datetime || !mid_submission_datetime || !end_datetime) {
            toast({ title: "Validation Error", description: "Please fill in all date and basic information fields." });
            setLoading(false);
            return;
        }

        if (!limits.totalParticipants || !limits.totalTeams || !limits.totalCoordinators || !limits.totalEvaluators || !limits.maxMembersPerTeam) {
            toast({ title: "Validation Error", description: "Please fill in all limit fields." });
            setLoading(false);
            return;
        }

        // Validate hackathon name word count
        const wordCount = hackathon_name.trim().split(/\s+/).length;
        if (wordCount > 20) {
            toast({ title: "Validation Error", description: "Hackathon name cannot exceed 20 words." });
            setLoading(false);
            return;
        }

        // Validate date sequence
        const currentDate = new Date();
        const regDeadline = new Date(registrationDeadline);
        const startDate = new Date(start_datetime);
        const midDate = new Date(mid_submission_datetime);
        const endDate = new Date(end_datetime);

        // Check for past dates
        if (regDeadline < currentDate || startDate < currentDate || midDate < currentDate || endDate < currentDate) {
            toast({ title: "Validation Error", description: "Past dates are not allowed. Please select present or future dates only." });
            setLoading(false);
            return;
        }

        // Check date sequence
        if (!(regDeadline < startDate && startDate < midDate && midDate < endDate)) {
            toast({ title: "Validation Error", description: "Invalid date sequence. Order must be: Registration Deadline < Start Date < Mid Submission < End Date." });
            setLoading(false);
            return;
        }

        // Validate limits
        const limitsArray = Object.values(limits).map(Number);
        if (limitsArray.some(val => val < 1) || Number(limits.maxMembersPerTeam) < 2) {
            toast({ title: "Validation Error", description: "Invalid limits. Minimum values: participants(1), teams(1), coordinators(1), evaluators(1), max members per team(2)." });
            setLoading(false);
            return;
        }

        try {
            // Convert limits to numbers
            const processedData = {
                ...formData,
                limits: {
                    totalParticipants: Number(limits.totalParticipants),
                    totalTeams: Number(limits.totalTeams),
                    totalCoordinators: Number(limits.totalCoordinators),
                    totalEvaluators: Number(limits.totalEvaluators),
                    maxMembersPerTeam: Number(limits.maxMembersPerTeam)
                }
            };

            await createHackathon(processedData);
            toast({ title: "Success", description: "Hackathon created successfully!" });
            setTimeout(() => navigate('/admin/view-hackathon'), 2000);
        } catch (err) {
            toast({ title: "Error", description: err.response?.data?.message || "Failed to create hackathon." });
        } finally {
            setLoading(false);
        }
    };

    const renderDateTimePicker = (field, label) => (
        <div className="space-y-2">
            <Label htmlFor={field} className="text-sm font-semibold text-gray-700">{label}</Label>
            <div className="flex flex-col sm:flex-row gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant={"outline"} className="w-full sm:w-[240px] justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData[field] ? format(formData[field], "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar 
                            mode="single" 
                            selected={formData[field]} 
                            onSelect={(date) => handleDateChange(date, field)} 
                            disabled={(date) => date < new Date().setHours(0, 0, 0, 0)}
                            initialFocus 
                        />
                    </PopoverContent>
                </Popover>
                <div className="relative flex-1">
                    <Input
                        type="time"
                        value={formData[field] ? format(formData[field], "HH:mm") : ""}
                        onChange={(e) => handleTimeChange(e, field)}
                        className="pl-8"
                        disabled={!formData[field]}
                    />
                    <Clock className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                </div>
            </div>
        </div>
    );

    return (
        <DefaultLayout userRole="admin">
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-3xl"
                >
                    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center text-3xl font-bold">
                                <Plus className="w-7 h-7 mr-3 text-blue-600" />
                                Create Hackathon Event
                            </CardTitle>
                            <CardDescription className="text-base">
                                Fill in the details to set up a new hackathon. All fields are required.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Basic Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Basic Information</h3>
                                    <div className="space-y-2">
                                        <Label htmlFor="hackathon_name" className="text-sm font-semibold text-gray-700">
                                            Hackathon Name <span className="text-xs text-gray-500">(max 20 words)</span>
                                        </Label>
                                        <Input 
                                            id="hackathon_name" 
                                            placeholder="e.g., CodeFest 2024" 
                                            value={formData.hackathon_name} 
                                            onChange={(e) => setFormData({ ...formData, hackathon_name: e.target.value })} 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="venue" className="text-sm font-semibold text-gray-700">Venue / Location</Label>
                                        <Input 
                                            id="venue" 
                                            placeholder="e.g., Virtual or City Conference Center" 
                                            value={formData.venue} 
                                            onChange={(e) => setFormData({ ...formData, venue: e.target.value })} 
                                        />
                                    </div>
                                </div>

                                {/* Date & Time Schedule */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Schedule (in chronological order)</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {renderDateTimePicker("registrationDeadline", "1. Registration Deadline")}
                                        {renderDateTimePicker("start_datetime", "2. Start Date & Time")}
                                        {renderDateTimePicker("mid_submission_datetime", "3. Mid Submission Deadline")}
                                        {renderDateTimePicker("end_datetime", "4. End Date & Time")}
                                    </div>
                                </div>

                                {/* Limits Configuration */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Hackathon Limits</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="totalParticipants" className="text-sm font-semibold text-gray-700">Total Participants</Label>
                                            <Input 
                                                id="totalParticipants"
                                                type="number"
                                                min="1"
                                                placeholder="e.g., 100"
                                                value={formData.limits.totalParticipants}
                                                onChange={(e) => handleLimitChange(e, 'totalParticipants')}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="totalTeams" className="text-sm font-semibold text-gray-700">Total Teams</Label>
                                            <Input 
                                                id="totalTeams"
                                                type="number"
                                                min="1"
                                                placeholder="e.g., 25"
                                                value={formData.limits.totalTeams}
                                                onChange={(e) => handleLimitChange(e, 'totalTeams')}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="totalCoordinators" className="text-sm font-semibold text-gray-700">Total Coordinators</Label>
                                            <Input 
                                                id="totalCoordinators"
                                                type="number"
                                                min="1"
                                                placeholder="e.g., 5"
                                                value={formData.limits.totalCoordinators}
                                                onChange={(e) => handleLimitChange(e, 'totalCoordinators')}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="totalEvaluators" className="text-sm font-semibold text-gray-700">Total Evaluators</Label>
                                            <Input 
                                                id="totalEvaluators"
                                                type="number"
                                                min="1"
                                                placeholder="e.g., 10"
                                                value={formData.limits.totalEvaluators}
                                                onChange={(e) => handleLimitChange(e, 'totalEvaluators')}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="maxMembersPerTeam" className="text-sm font-semibold text-gray-700">Max Members per Team</Label>
                                            <Input 
                                                id="maxMembersPerTeam"
                                                type="number"
                                                min="2"
                                                placeholder="e.g., 4"
                                                value={formData.limits.maxMembersPerTeam}
                                                onChange={(e) => handleLimitChange(e, 'maxMembersPerTeam')}
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? "Creating..." : "Create Hackathon"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </DefaultLayout>
    );
};

export default CreateHackathon;