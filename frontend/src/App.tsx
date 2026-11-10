import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';

// Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import PatientHome from './pages/patient/PatientHome';
import PatientRecords from './pages/patient/PatientRecords';
import RecordDetail from './pages/patient/RecordDetail';
import UploadReport from './pages/patient/UploadReport';
import AiChat from './pages/patient/AiChat';
import HealthTrends from './pages/patient/HealthTrends';
import AiCare from './pages/patient/AiCare';
import DoctorHome from './pages/doctor/DoctorHome';
import MyPatients from './pages/doctor/MyPatients';
import PatientDetail from './pages/doctor/PatientDetail';
import AdminOverview from './pages/admin/AdminOverview';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAssign from './pages/admin/AdminAssign';
import AdminAudit from './pages/admin/AdminAudit';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
  const { role } = useAuth();
  if (!role) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route element={<MainLayout />}>
          {/* Patient Routes */}
          <Route path="/patient/home" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientHome /></ProtectedRoute>} />
          <Route path="/patient/records" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientRecords /></ProtectedRoute>} />
          <Route path="/patient/records/:id" element={<ProtectedRoute allowedRoles={['PATIENT']}><RecordDetail /></ProtectedRoute>} />
          <Route path="/patient/upload" element={<ProtectedRoute allowedRoles={['PATIENT']}><UploadReport /></ProtectedRoute>} />
          <Route path="/patient/chat" element={<ProtectedRoute allowedRoles={['PATIENT']}><AiChat /></ProtectedRoute>} />
          <Route path="/patient/trends" element={<ProtectedRoute allowedRoles={['PATIENT']}><HealthTrends /></ProtectedRoute>} />
          <Route path="/patient/care" element={<ProtectedRoute allowedRoles={['PATIENT']}><AiCare /></ProtectedRoute>} />

          {/* Doctor Routes */}
          <Route path="/doctor/home" element={<ProtectedRoute allowedRoles={['DOCTOR']}><DoctorHome /></ProtectedRoute>} />
          <Route path="/doctor/patients" element={<ProtectedRoute allowedRoles={['DOCTOR']}><MyPatients /></ProtectedRoute>} />
          <Route path="/doctor/patients/:id" element={<ProtectedRoute allowedRoles={['DOCTOR']}><PatientDetail /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<Navigate to="/admin/overview" replace />} />
          <Route path="/admin/overview" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminOverview /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/assign" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminAssign /></ProtectedRoute>} />
          <Route path="/admin/logs" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminAudit /></ProtectedRoute>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
