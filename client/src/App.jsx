import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster'; // For displaying notifications

// --- Import all page-level components ---

// Public pages
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Register from '@/pages/Register';

// Role-specific main pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import ParticipantDashboard from '@/pages/participant/ParticipantDashboard';
import EvaluatorDashboard from '@/pages/evaluator/EvaluatorDashboard';
import CoordinatorPage from '@/pages/coordinator/CoordinatorPage';

/**
 * The main application component that sets up the routing for the entire site.
 * It uses React Router to render different pages based on the URL path.
 */
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        <Routes>
          {/* ==================================================================== */}
          {/* PUBLIC ROUTES                            */}
          {/* These routes are accessible to anyone, logged in or not.           */}
          {/* ==================================================================== */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ==================================================================== */}
          {/* PROTECTED ROUTES                           */}
          {/* These routes should ideally be protected by an authentication check. */}
          {/* The paths must match the `roleRoutes` object in your Login logic.   */}
          {/* ==================================================================== */}
          
          {/* --- Admin Route --- */}
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          
          {/* --- Coordinator Route --- */}
          {/* This single route renders the CoordinatorPage, which handles its own internal navigation */}
          {/* (switching between landing, dashboard, and team registration views). */}
          <Route path="/coordinator" element={<CoordinatorPage />} />
          
          {/* --- Participant Route --- */}
          <Route path="/participant" element={<ParticipantDashboard />} />
          
          {/* --- Evaluator Route --- */}
          <Route path="/evaluator-dashboard" element={<EvaluatorDashboard />} />

        </Routes>
        
        {/* The Toaster component is used for showing pop-up notifications globally */}
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
