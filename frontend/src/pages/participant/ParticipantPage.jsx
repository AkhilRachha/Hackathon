import { useEffect, useState } from "react";
import ParticipantRegistration from "./ParticipantRegistration";
import ParticipantDashboard from "./ParticipantDashboard";
import { getMyDashboard } from "@/api/teamApi";

const ParticipantPage = () => {
    const [view, setView] = useState("loading");

    useEffect(() => {
        const checkUserStatus = async () => {
            // Try to fetch dashboard data which handles both team assignment and hackathon registration
            try {
                const dashboardData = await getMyDashboard();
                
                // If we get dashboard data, user is registered for a hackathon
                if (dashboardData) {
                    // Store the hackathon ID for future use
                    if (dashboardData.hackathon?._id) {
                        localStorage.setItem("currentHackathonId", dashboardData.hackathon._id);
                    }
                    setView("dashboard");
                    return;
                }
            } catch (error) {
                // Check if the error indicates no hackathon registration
                if (error.response?.status === 404) {
                    console.log("User not registered for any hackathon:", error.response?.data?.message);
                    // Clear any stale hackathon ID from localStorage
                    localStorage.removeItem("currentHackathonId");
                    setView("registration");
                    return;
                }
                
                // For other errors, show registration page as fallback
                console.error("Error checking user status:", error);
                setView("registration");
            }
        };

        checkUserStatus();
    }, []);

    const handleRegistrationSuccess = () => {
        // This function is called by the child component after a user successfully joins
        setView("dashboard");
    };

    if (view === "loading") {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="min-h-screen">
            {view === "registration" ? (
                <ParticipantRegistration onRegistrationSuccess={handleRegistrationSuccess} />
            ) : (
                <ParticipantDashboard />
            )}
        </div>
    );
};

export default ParticipantPage;