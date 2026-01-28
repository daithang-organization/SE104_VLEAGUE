import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ReportsPage from './pages/ReportsPage';
import StandingsPage from './pages/StandingsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/standings" element={<StandingsPage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/" element={<Navigate to="/standings" replace />} />
    </Routes>
  );
}
