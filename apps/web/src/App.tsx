import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import StandingsPage from './pages/StandingsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/standings" element={<StandingsPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
