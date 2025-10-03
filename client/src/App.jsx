import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';

// Public pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Role-specific main pages
import AdminLanding from './pages/admin/AdminLanding';
import CreateHackathon from './pages/admin/CreateHackathon';
import ViewHackathon from './pages/admin/ViewHackathon';
import HackathonWinners from './pages/admin/HackathonWinners';
import Titles from './pages/admin/Titles';
import RoleMapping from './pages/admin/RoleMapping'; 
// ➡️ NEW ADMIN PAGE IMPORT
import HackathonManagement from './pages/admin/HackathonManagement'; 

// Unified Dashboard for non-admins
import ParticipantDashboard from './pages/participant/ParticipantDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        <Routes>
          {/* ==================================================================== */}
          {/* PUBLIC ROUTES                                                        */}
          {/* ==================================================================== */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ==================================================================== */}
          {/* PROTECTED ROUTES                                                     */}
          {/* ==================================================================== */}
          
          {/* --- Admin Routes --- */}
          <Route path="/admin" element={<AdminLanding />} />
          <Route path="/admin/create-hackathon" element={<CreateHackathon />} />
          <Route path="/admin/view-hackathon" element={<ViewHackathon />} />
          <Route path="/admin/hackathon-winners" element={<HackathonWinners />} />
          <Route path="/admin/titles" element={<Titles />} />
          <Route path="/admin/role-mapping" element={<RoleMapping />} /> 
          
          {/* ➡️ NEW ROUTE: Dedicated Management Page */}
          <Route path="/admin/manage-hackathon/:hackathonId" element={<HackathonManagement />} />

          {/* --- Unified Non-Admin Routes --- */}
          <Route path="/coordinator" element={<ParticipantDashboard />} />
          <Route path="/participant" element={<ParticipantDashboard />} />
          <Route path="/evaluator-dashboard" element={<ParticipantDashboard />} />
          
        </Routes>
        
        <Toaster />
      </div>
    </Router>
  );
}

export default App;