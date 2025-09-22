import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import CoordinatorDashboard from '@/pages/coordinator/CoordinatorDashboard'
import ParticipantDashboard from '@/pages/participant/ParticipantDashboard'
import EvaluatorDashboard from '@/pages/evaluator/EvaluatorDashboard'
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/coordinator" element={<CoordinatorDashboard />} />
          <Route path="/participant" element={<ParticipantDashboard />} />
          <Route path="/evaluator" element={<EvaluatorDashboard />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  )
}

export default App