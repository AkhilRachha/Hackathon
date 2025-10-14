import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';

// Public pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Admin pages
import AdminLanding from './pages/admin/AdminLanding';
import CreateHackathon from './pages/admin/CreateHackathon';
import ViewHackathon from './pages/admin/ViewHackathon';
import HackathonWinners from './pages/admin/HackathonWinners';
import Titles from './pages/admin/Titles';
import RoleMapping from './pages/admin/RoleMapping';
import HackathonManagement from './pages/admin/HackathonManagement';
import QuestionMapping from './pages/admin/QuestionMapping';

// Non-admin controllers
import ParticipantPage from './pages/participant/ParticipantPage';
import CoordinatorPage from './pages/coordinator/CoordinatorPage';
import EvaluatorDashboard from './pages/evaluator/EvaluatorDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminLanding />} />
          <Route path="/admin/create-hackathon" element={<CreateHackathon />} />
          <Route path="/admin/view-hackathon" element={<ViewHackathon />} />
          <Route path="/admin/hackathon-winners" element={<HackathonWinners />} />
          <Route path="/admin/titles" element={<Titles />} />

          {/* --- ⬇️  FIXED HERE ⬇️ --- */}
          {/* Replaced the old static route with the new dynamic route */}
          <Route
            path="/admin/manage-hackathon/:hackathonId/role-mapping"
            element={<RoleMapping />}
          />

          <Route
            path="/admin/hackathon/:hackathonId/questions"
            element={<QuestionMapping />}
          />
          <Route
            path="/admin/manage-hackathon/:hackathonId"
            element={<HackathonManagement />}
          />

          {/* Non-admin role pages */}
          <Route path="/participant" element={<ParticipantPage />} />
          <Route path="/coordinator" element={<CoordinatorPage />} />
          <Route path="/evaluator-dashboard" element={<EvaluatorDashboard />} />
        </Routes>

        <Toaster />
      </div>
    </Router>
  );
}

export default App;