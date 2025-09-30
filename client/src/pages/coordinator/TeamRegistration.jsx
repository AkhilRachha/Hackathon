import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; 

// ➡️ CRITICAL: Import the configured axios instance for authenticated calls
import axios from '@/lib/axiosInstance'; 
import { toast } from '@/hooks/use-toast'; 

// Note: useForm and zodResolver are included for typical React development structure
// but are mocked in this single file environment for simplicity and execution.
const useMockForm = (options) => {
    const [values, setValues] = useState(options.defaultValues);
    const [errors, setErrors] = useState({});

    const getValues = (name) => name ? values[name] : values;
    const setValue = (name, value) => setValues(prev => ({ ...prev, [name]: value }));

    const handleSubmit = (onSubmit) => async (e) => {
        e.preventDefault();
        try {
            setErrors({});
            // Mock validation success
            onSubmit(values);
        } catch (e) {
            console.error("Mock form error:", e);
            // Actual Zod validation logic would go here
        }
    };

    const watch = (name) => values[name];
    const control = {
        getFieldState: (name) => ({ error: errors[name] }),
        setValue,
        getValues,
    };

    return { control, handleSubmit, watch, formState: { errors } };
};


// --- Mock UI Components (Simulating shadcn/ui/Tailwind) ---
const Button = ({ children, type, onClick, variant, size, className, disabled }) => <button type={type} onClick={onClick} className={`p-2 rounded-lg font-medium transition-all ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>{children}</button>;
const Card = ({ children, className }) => <div className={`bg-white rounded-xl shadow-lg ${className}`}>{children}</div>;
const CardHeader = ({ children, className }) => <div className={`p-6 border-b ${className}`}>{children}</div>;
const CardTitle = ({ children, className }) => <h2 className={`text-xl font-bold ${className}`}>{children}</h2>;
const CardDescription = ({ children, className }) => <p className={`text-sm text-gray-500 ${className}`}>{children}</p>;
const CardContent = ({ children, className }) => <div className={`p-6 ${className}`}>{children}</div>;
const Form = ({ children, ...props }) => <div {...props}>{children}</div>;
const FormControl = ({ children, ...props }) => <div {...props}>{children}</div>;
const FormField = ({ control, name, render }) => {
    const field = control.getFieldState(name) || {};
    return render({ field: { name, onChange: control.setValue, value: control.getValues(name) } });
};
const FormItem = ({ children, className }) => <div className={`space-y-2 ${className}`}>{children}</div>;
const FormLabel = ({ children, className }) => <label className={`block text-sm font-medium text-gray-700 ${className}`}>{children}</label>;
const FormMessage = ({ children }) => <p className="text-sm text-red-500">{children}</p>;
const Input = ({ placeholder, className, ...props }) => <input placeholder={placeholder} className={`w-full border rounded-md p-2 ${className}`} {...props} />;
const Checkbox = ({ checked, disabled, onCheckedChange }) => <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onCheckedChange(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />;
const Select = ({ value, onChange, className, children, disabled }) => <select value={value} onChange={onChange} className={`w-full border rounded-md p-2 ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={disabled}>{children}</select>;
const ArrowRight = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;
const Users = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const ArrowLeft = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;

// --- TeamRegistration Component ---
const TeamRegistration = ({ projects = [], participants = [], domains = [], onRegisterTeam, onCancel, isLoading }) => {
    const [selectedDomain, setSelectedDomain] = useState(() => domains.length > 0 ? domains[0] : '');
    const navigate = useNavigate();

    // Reset selectedDomain when domains list is loaded/changes
    useEffect(() => {
        if (domains.length > 0 && (!domains.includes(selectedDomain))) {
            setSelectedDomain(domains[0]);
        }
        if (!domains.length || !domains.includes(selectedDomain)) {
             form.control.setValue('q_id', '');
        }
    }, [domains, selectedDomain]);

    const form = useMockForm({
        defaultValues: {
            team_name: '',
            q_id: '', // Project ID
            members: [],
            user_github_url: '',
        },
    });

    // Filter projects based on the selected domain.
    const filteredProjects = useMemo(() => {
        if (!selectedDomain) return [];
        return projects.filter(proj => proj.domain === selectedDomain);
    }, [projects, selectedDomain]);

    const handleDomainChange = (e) => {
        const newDomain = e.target.value;
        setSelectedDomain(newDomain);
        // Clear selected project ID when domain changes
        form.control.setValue('q_id', '');
    };

    const onSubmit = (data) => {
        if (!data.q_id) {
            toast({ title: "Validation Error", description: "Please select a Project Title." });
            return;
        }
        if (data.members.length === 0) {
            toast({ title: "Validation Error", description: "A team must have at least one participant." });
            return;
        }

        const finalTeamData = {
            ...data,
            max_members: 4,
            project_domain: selectedDomain
        };
        onRegisterTeam(finalTeamData);
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    };

    const inputStyle = "h-11 bg-white/70 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200";
    
    // Disable submit if loading, no domain selected, no projects in domain, or no members selected
    const submitDisabled = isLoading || !selectedDomain || filteredProjects.length === 0 || form.watch('members')?.length === 0 || !form.watch('q_id');

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
            <div className="absolute inset-0">
                <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-4xl relative z-10"
            >
                <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                    <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-xl">
                        <CardHeader className="space-y-1 text-center pb-6">
                            <motion.div className="flex justify-center mb-6" whileHover={{ scale: 1.05, rotate: -5 }} transition={{ duration: 0.2 }}>
                                <div className="relative p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                                    <Users className="w-8 h-8 text-white" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur-xl opacity-50" />
                                </div>
                            </motion.div>
                            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                                Register a New Team
                            </CardTitle>
                            <CardDescription className="text-base text-gray-600">
                                Follow the steps below to create and assign a new team.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-8 pb-8">
                            {isLoading && (
                                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-20 flex items-center justify-center rounded-xl">
                                    <div className="flex items-center space-x-2 text-blue-600">
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        <p className="font-semibold">Loading data from backend...</p>
                                    </div>
                                </div>
                            )}
                            <Form control={form.control}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                    {/* STEP 1: Team Name */}
                                    <FormField
                                        control={form.control}
                                        name="team_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-lg font-semibold text-gray-700">1. Team Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., The Bug Busters" {...field} className={inputStyle} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    {/* STEP 2: Select Domain (From backend) */}
                                    <FormItem className="space-y-4">
                                        <FormLabel className="text-lg font-semibold text-gray-700">2. Select Project Domain</FormLabel>
                                        <FormControl>
                                            <Select value={selectedDomain} onChange={handleDomainChange} className={inputStyle} disabled={isLoading || domains.length === 0}>
                                                <option value="" disabled>
                                                    {isLoading ? 'Loading Domains...' : (domains.length === 0 ? 'No Domains Available' : '-- Select a Domain --')}
                                                </option>
                                                {domains.map(domain => (
                                                    <option key={domain} value={domain}>{domain}</option>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </FormItem>
                                    
                                    {/* STEP 3: Select Project Title (From backend) - Filtered by domain */}
                                    <FormField
                                        control={form.control}
                                        name="q_id"
                                        render={({ field }) => (
                                            <FormItem className="space-y-4">
                                                <FormLabel className="text-lg font-semibold text-gray-700">3. Select Project Title (Domain: <span className="text-blue-600 font-bold">{selectedDomain || 'None'}</span>)</FormLabel>
                                                
                                                {filteredProjects.length === 0 ? (
                                                    <div className="p-4 text-center text-gray-500 border-2 border-dashed rounded-lg bg-gray-50">
                                                       {selectedDomain && !isLoading
                                                            ? `No projects found for domain: "${selectedDomain}".`
                                                            : (isLoading ? 'Loading projects...' : 'Please select a domain above.')}
                                                    </div>
                                                ) : (
                                                     <FormControl>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-72 overflow-y-auto pr-2">
                                                            {filteredProjects.map(proj => (
                                                                <div
                                                                    key={proj._id}
                                                                    onClick={() => field.onChange(proj._id)}
                                                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${field.value === proj._id ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-300 shadow-md' : 'border-gray-200 bg-white hover:border-blue-400 hover:shadow-sm'}`}
                                                                >
                                                                    <p className="font-bold text-gray-800 text-base">{proj.q_title}</p>
                                                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{proj.q_description}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </FormControl>
                                                )}
                                            </FormItem>
                                        )}
                                    />

                                    {/* STEP 4: Select Participants (From backend) */}
                                    <FormField
                                        control={form.control}
                                        name="members"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-lg font-semibold text-gray-700">4. Select Participants (1-4 Members)</FormLabel>
                                                <p className="text-sm text-gray-500">
                                                    You have selected {form.watch('members')?.length || 0} of 4 participants.
                                                </p>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 border rounded-lg max-h-60 overflow-y-auto bg-white/80">
                                                    {participants.length > 0 ? participants.map((participant) => {
                                                        const isChecked = field.value?.includes(participant._id);
                                                        const isSelectionDisabled = field.value?.length >= 4 && !isChecked;
                                                        return (
                                                            <FormItem key={participant._id} className="flex flex-row items-start space-x-3 p-2 rounded-md transition-colors hover:bg-slate-100">
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={isChecked}
                                                                        disabled={isSelectionDisabled}
                                                                        onCheckedChange={(checked) => {
                                                                            const currentMembers = field.value || [];
                                                                            const newMembers = checked
                                                                                ? [...currentMembers, participant._id]
                                                                                : currentMembers.filter(id => id !== participant._id);
                                                                            return field.onChange(newMembers);
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormLabel className={`text-sm font-medium pt-0.5 ${isSelectionDisabled ? 'text-gray-400 cursor-not-allowed' : 'cursor-pointer'}`}>
                                                                    {participant.user_name}
                                                                </FormLabel>
                                                            </FormItem>
                                                        );
                                                    }) : (
                                                        <p className="text-gray-500 col-span-full text-center">
                                                            {isLoading ? 'Loading participants...' : 'No available participants found.'}
                                                        </p>
                                                    )}
                                                </div>
                                            </FormItem>
                                        )}
                                    />

                                    {/* STEP 5: GitHub URL */}
                                    <FormField
                                        control={form.control}
                                        name="user_github_url"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-lg font-semibold text-gray-700">5. GitHub Repository URL</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="https://github.coms/your-team/your-repo" {...field} className={inputStyle} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <div className="flex justify-end items-center pt-6 gap-4">
                                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                            <Button 
                                                type="button" 
                                                onClick={onCancel} 
                                                variant="ghost" 
                                                className="h-10 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100/50" 
                                                // CANCEL BUTTON FIX: Prop removed above
                                            >
                                                <ArrowLeft className="w-4 h-4 mr-2" />
                                                Cancel
                                            </Button>
                                        </motion.div>
                                        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                                            <Button type="submit" size="lg" className="h-12 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all duration-200" disabled={submitDisabled}>
                                                Register Team <ArrowRight className="ml-2 h-5 w-5" />
                                            </Button>
                                        </motion.div>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        </div>
    );
};

// --- Main App component to handle data fetching (MODIFIED) ---
const App = () => {
    const [projects, setProjects] = useState([]);
    const [domains, setDomains] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const PARTICIPANTS_ENDPOINT = '/users/participants/available';
        const PROJECTS_ENDPOINT = '/hackathons/domains-and-questions';

        const fetchData = async () => {
            setIsLoading(true);
            let domainNames = [];
            let allProjects = [];
            let participantsData = [];

            // --- 1. Fetch Projects and Domains (Authenticated Fetch) ---
            try {
                const projectsResponse = await axios.get(PROJECTS_ENDPOINT);
                const groupedData = projectsResponse.data; 

                groupedData.forEach(domainGroup => {
                    if (domainGroup.name && domainGroup.projects) {
                        domainNames.push(domainGroup.name);
                        domainGroup.projects.forEach(project => {
                            allProjects.push({ ...project, domain: domainGroup.name, q_title: project.title, q_description: project.description });
                        });
                    }
                });
                
            } catch (error) {
                console.error("Error fetching projects/domains:", error);
                toast({ title: "Error", description: "Could not fetch project data. Check server status." });
            }

            // --- 2. Fetch Available Participants (Authenticated Fetch) ---
            try {
                // ⚠️ NOTE: This endpoint must exist and be accessible to coordinators.
                const participantsResponse = await axios.get(PARTICIPANTS_ENDPOINT);
                participantsData = participantsResponse.data;
            } catch (error) {
                console.error("Error fetching participants:", error);
                toast({ title: "Error", description: "Could not fetch participants list. (Check backend route and controller)." });
            }

            setDomains(domainNames);
            setProjects(allProjects);
            setParticipants(participantsData);
            setIsLoading(false);
        };

        fetchData();
    }, []); 

    const handleRegisterTeam = async (data) => {
        const selectedProject = projects.find(p => p._id === data.q_id);
        
        // ➡️ FIX: Robust retrieval of Coordinator ID
        const userJson = localStorage.getItem('user');
        let coordinatorId;
        if (userJson) {
            try {
                const userData = JSON.parse(userJson);
                // Try common ID keys: _id (Mongoose), id (API standard), userId (common key)
                coordinatorId = userData._id || userData.id || userData.userId; 
            } catch (e) {
                // JSON parsing failed, fallback to a single key
                coordinatorId = localStorage.getItem('userId');
            }
        }
        coordinatorId = coordinatorId || localStorage.getItem('userId');
        
        if (!coordinatorId) {
            toast({ title: "Auth Error", description: "Coordinator ID not found in session. Please log in again." });
            return;
        }

        const finalTeamData = {
            team_name: data.team_name,
            q_id: data.q_id,
            members: data.members, 
            user_github_url: data.user_github_url,
            max_members: 4, 
            // ➡️ FIX: Include the required coordinator ID in the payload
            coordinator: coordinatorId,
        };

        try {
            // FIX: Implement the actual POST request to create the team
            await axios.post('/teams', finalTeamData); 
            
            toast({ title: "Success", description: `Team ${data.team_name} registered successfully!` });
            
            // Redirect after successful creation
            navigate('/coordinator');

        } catch (error) {
            console.error("Team registration failed:", error.response?.data || error);
            const errorMessage = error.response?.data?.message || "Check network/server status.";
            toast({ title: "Error", description: `Registration failed: ${errorMessage}` });
        }
    };

    const handleCancel = () => {
        console.log("Registration cancelled. Navigating to Coordinator Dashboard.");
        navigate('/coordinator');
    };

    return (
        <TeamRegistration
            projects={projects} 
            participants={participants} 
            domains={domains} 
            onRegisterTeam={handleRegisterTeam}
            onCancel={handleCancel}
            isLoading={isLoading}
        />
    );
};

export default App;