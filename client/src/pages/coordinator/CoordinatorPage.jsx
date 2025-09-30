import { useState, useEffect } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';

// Import your child components
import CoordinatorLanding from './CoordinatorLanding';
import TeamRegistration from './TeamRegistration';
import CoordinatorDashboard from './CoordinatorDashboard';

// A simple layout component
const DefaultLayout = ({ children }) => <div className="bg-gray-100">{children}</div>;

const CoordinatorPage = () => {
    const [view, setView] = useState('landing');
    
    // State for live data
    const [teams, setTeams] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [availableParticipants, setAvailableParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Data Fetching Function ---
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Get the current user's ID from localStorage (set during login)
            const coordinatorId = localStorage.getItem('userId');
            if (!coordinatorId) {
                throw new Error("Coordinator ID not found. Please log in again.");
            }

            // Fetch all required data in parallel for efficiency
            const [teamsRes, questionsRes, participantsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/teams'),
                axios.get('http://localhost:5000/api/questions'),
                axios.get('http://localhost:5000/api/users/participants/available')
            ]);

            // Format team data to be easily used by the dashboard
            const formattedTeams = teamsRes.data.map(team => ({
                id: team._id,
                name: team.team_name,
                members: team.members.map(m => m.user_name),
                project: team.q_id ? team.q_id.q_title : 'N/A',
                coordinator: team.coordinator ? team.coordinator.user_name : 'N/A',
                status: team.status,
                isMyTeam: team.coordinator && team.coordinator._id === coordinatorId,
                github: team.user_github_url
            }));
            
            setTeams(formattedTeams);
            setQuestions(questionsRes.data);
            setAvailableParticipants(participantsRes.data);
        } catch (err) {
            setError('Failed to fetch data. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // --- Run fetchData on initial component load ---
    useEffect(() => {
        fetchData();
    }, []);

    // --- Handle Team Registration Submission ---
    const handleRegisterTeam = async (teamData) => {
        try {
            const coordinatorId = localStorage.getItem('userId');
            if (!coordinatorId) {
                alert("Authentication error. Please log in again.");
                return;
            }
            
            const response = await axios.post('http://localhost:5000/api/teams', {
                ...teamData,
                coordinator: coordinatorId,
            });

            alert(response.data.message);
            
            // Refresh data and switch to the dashboard view
            await fetchData();
            setView('dashboard');
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to create team.';
            alert(errorMessage);
            console.error('Team creation failed:', error);
        }
    };
    
    // --- Render correct view based on state ---
    const renderContent = () => {
        if (loading) return <div className="flex justify-center items-center h-screen font-bold text-xl">Loading Coordinator Portal...</div>;
        if (error) return <div className="flex justify-center items-center h-screen text-red-600 font-bold">{error}</div>;

        switch (view) {
            case 'landing':
                return <CoordinatorLanding onNavigateToDashboard={() => setView('dashboard')} onNavigateToRegister={() => setView('register')} />;
            case 'register':
                return <TeamRegistration projects={questions} participants={availableParticipants} onRegisterTeam={handleRegisterTeam} onCancel={() => setView('landing')} />;
            case 'dashboard':
                const myTeams = teams.filter(team => team.isMyTeam);
                return <CoordinatorDashboard myTeams={myTeams} allTeams={teams} onNavigateToRegister={() => setView('register')} />;
            default:
                return <div>Error: View not found.</div>;
        }
    };

    return (
        <DefaultLayout>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={view}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </DefaultLayout>
    );
};

export default CoordinatorPage;