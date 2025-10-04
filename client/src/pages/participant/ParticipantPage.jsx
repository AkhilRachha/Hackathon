import { useEffect, useState } from "react";
import ParticipantRegistration from "./ParticipantRegistration";
import ParticipantDashboard from "./ParticipantDashboard";

const ParticipantPage = () => {
  const [view, setView] = useState("loading");

  useEffect(() => {
    const hackathonId = localStorage.getItem("currentHackathonId");
    if (hackathonId) {
      setView("dashboard");
    } else {
      setView("registration");
    }
  }, []);

  const handleRegistrationSuccess = () => {
    setView("dashboard"); // Switch the view after joining
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