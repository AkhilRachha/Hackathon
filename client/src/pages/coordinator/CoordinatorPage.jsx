// pages/coordinator/CoordinatorPage.jsx
// KEY FIX: Centralizes all data fetching and passes data down to child components as props.

import { useState, useEffect } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';

import CoordinatorLanding from './CoordinatorLanding';
import TeamRegistration from './TeamRegistration';
import CoordinatorDashboard from './CoordinatorDashboard';

const DefaultLayout = ({ children }) => <div className="bg-gray-100">{children}</div>;

const CoordinatorPage = () => {
    const [view, setView] = useState('landing');
    
    // Single source of truth for all coordinator data
    const [teams, setTeams] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [availableParticipants, setAvailableParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const coordinatorId = localStorage.getItem('userId');
            if (!coordinatorId) {
                throw new Error("Coordinator ID not found. Please log in again.");
            }

            // Fetch all data in parallel for efficiency
            const [teamsRes, questionsRes, participantsRes] = await Promise.all([
                axios.get('http://localhost:9000/api/teams'),
                axios.get('http://localhost:9000/api/questions'),
                axios.get('http://localhost:9000/api/users/participants/available')
            ]);

            const formattedTeams = teamsRes.data.map(team => ({
                id: team._id,
                name: team.team_name,
                members: team.members.map(m => m.user_name),
                project: team.q_id ? team.q_id.q_title : 'N/A',
                coordinator: team.coordinator ? team.coordinator.user_name : 'N/A',
                status: team.status || 'Pending',
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

    useEffect(() => {
        fetchData();
    }, []);

    const handleRegisterTeam = async (teamData) => {
        try {
            const coordinatorId = localStorage.getItem('userId');
            if (!coordinatorId) {
                alert("Authentication error. Please log in again.");
                return;
            }
            
            await axios.post('http://localhost:9000/api/teams', {
                ...teamData,
                coordinator: coordinatorId,
            });

            alert('Team created successfully!');
            await fetchData(); // Refresh data
            setView('dashboard'); // Switch to dashboard
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to create team.';
            alert(errorMessage);
            console.error('Team creation failed:', error);
        }
    };
    
    const renderContent = () => {
        if (loading) return <div className="flex justify-center items-center h-screen font-bold text-xl">Loading Coordinator Portal...</div>;
        if (error) return <div className="flex justify-center items-center h-screen text-red-600 font-bold">{error}</div>;

        switch (view) {
            case 'landing':
                return <CoordinatorLanding onNavigateToDashboard={() => setView('dashboard')} onNavigateToRegister={() => setView('register')} />;
            case 'register':
                return <TeamRegistration 
                            onRegisterTeam={handleRegisterTeam} 
                            onCancel={() => setView('landing')} 
                        />;
            case 'dashboard':
                const myTeams = teams.filter(team => team.isMyTeam);
                return <CoordinatorDashboard 
                            myTeams={myTeams} 
                            allTeams={teams} 
                            availableParticipants={availableParticipants}
                            onNavigateToRegister={() => setView('register')} 
                        />;
            default:
                return <div>Error: View not found.</div>;
        }
    };

    return (
        <DefaultLayout>
            <div className="min-h-screen">
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