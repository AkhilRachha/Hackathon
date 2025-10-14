// pages/coordinator/CoordinatorPage.jsx

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { getAllTeams, createTeam, updateTeam } from '@/api/teamApi';
import { getAllUsers } from '@/api/userApi';
import { getHackathonById } from '@/api/hackathonApi';
import DefaultLayout from '@/components/DefaultLayout';
import CoordinatorLanding from './CoordinatorLanding';
import TeamRegistration from './TeamRegistration';
import CoordinatorDashboard from './CoordinatorDashboard';

const CoordinatorPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [view, setView] = useState(searchParams.get('view') || 'landing');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Data states
    const [allTeams, setAllTeams] = useState([]);
    const [myTeams, setMyTeams] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [availableParticipants, setAvailableParticipants] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [hackathon, setHackathon] = useState(null);
    const [editingTeamId, setEditingTeamId] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const coordinatorId = localStorage.getItem('userId');
            const currentHackathonId = localStorage.getItem('currentHackathonId');
            if (!coordinatorId || !currentHackathonId) {
                throw new Error("User or Hackathon ID not found. Please log in again.");
            }

            const [allTeamsData, allUsersData, hackathonData] = await Promise.all([
                getAllTeams(), getAllUsers(), getHackathonById(currentHackathonId)
            ]);

            const teamsForThisHackathon = allTeamsData.filter(team => 
                (team.hackathon_id?._id || team.hackathon_id) === currentHackathonId
            );

            const allParticipantsData = allUsersData.filter(user => 
                user.role_name?.toLowerCase() === 'participant' && 
                (user.current_hackathon?._id || user.current_hackathon) === currentHackathonId
            );

            const assignedParticipantIds = new Set(
                teamsForThisHackathon.flatMap(team => team.members.map(member => member._id))
            );

            const trulyAvailableParticipants = allParticipantsData.filter(
                participant => !assignedParticipantIds.has(participant._id)
            );

            const teamsForThisCoordinator = teamsForThisHackathon.filter(team => 
                (team.coordinator_id?._id || team.coordinator_id) === coordinatorId
            );
            
            setHackathon(hackathonData);
            setAllTeams(teamsForThisHackathon);
            setMyTeams(teamsForThisCoordinator);
            setAllUsers(allUsersData);
            
            // Use hackathon-specific questions only
            const hackathonQuestions = hackathonData.questions || [];
            console.log(`Loaded ${hackathonQuestions.length} questions for hackathon: ${hackathonData.hackathon_name}`);
            setQuestions(hackathonQuestions);
            
            setAvailableParticipants(trulyAvailableParticipants);
        } catch (err) {
            setError('Failed to fetch coordinator data.');
            console.error("API Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Listen for URL parameter changes
    useEffect(() => {
        const urlView = searchParams.get('view') || 'landing';
        setView(urlView);
    }, [searchParams]);

    const handleStartEdit = (teamId) => {
        setEditingTeamId(teamId);
        setSearchParams({ view: 'register' });
    };

    const handleTeamSubmit = async (teamData) => {
        try {
            let result;
            if (editingTeamId) {
                result = await updateTeam(editingTeamId, teamData);
                console.log('Team updated successfully:', result);
            } else {
                result = await createTeam(teamData);
                console.log('Team created successfully:', result);
            }
            await handleFinishRegistration();
        } catch (error) {
            console.error('Team submission failed:', error);
            // Re-throw the error so the TeamRegistration component can handle it
            throw error;
        }
    };

    const handleFinishRegistration = async () => {
        await fetchData();
        setEditingTeamId(null);
        setSearchParams({ view: 'dashboard' });
    };
    
    const renderContent = () => {
        if (loading) return <div className="flex justify-center items-center h-screen font-bold text-xl">Loading...</div>;
        if (error) return <div className="flex justify-center items-center h-screen text-red-600 font-bold">{error}</div>;

        switch (view) {
            case 'register':
                return <TeamRegistration 
                            teamId={editingTeamId}
                            onSubmitTeam={handleTeamSubmit}
                            onFinish={handleFinishRegistration}
                            availableParticipants={availableParticipants}
                            questions={questions}
                        />;
            case 'dashboard':
                return <CoordinatorDashboard 
                            onEditTeam={handleStartEdit}
                            onNavigateToRegister={() => { setEditingTeamId(null); setSearchParams({ view: 'register' }); }}
                            hackathon={hackathon}
                            myTeams={myTeams} 
                            allTeams={allTeams} 
                            availableParticipants={availableParticipants}
                            allUsers={allUsers}
                        />;
            default:
                return <CoordinatorLanding onNavigateToDashboard={() => setSearchParams({ view: 'dashboard' })} onNavigateToRegister={() => setSearchParams({ view: 'register' })} />;
        }
    };

    return (
        <DefaultLayout userRole="coordinator">
            <div className="min-h-screen">
                <AnimatePresence mode="wait">
                    <motion.div key={view} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </DefaultLayout>
    );
};

export default CoordinatorPage;