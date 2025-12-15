import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Metrics from './pages/Metrics';
import Statistics from './pages/Statistics';
import Exercises from './pages/Exercises';
import Settings from './pages/Settings';
import { useAuthStore } from './store/auth';
import MenuIcon from '@mui/icons-material/Menu';
import { storage } from './utils/storage';
import { useTranslation } from 'react-i18next';
import Button from '@uikit/components/Button/Button';
import { AppTopBar } from './components/AppTopBar';

function Protected({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const [mode, setMode] = React.useState<'light' | 'dark'>(() => storage.get<'light' | 'dark'>('themeMode', 'light'));
  const { token, signOut } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = React.useState(false);
  const { t } = useTranslation();

  React.useEffect(() => {
    if (mode === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [mode]);

  return (
    <>
      <AppTopBar />
      <Container maxWidth="sm" sx={{ mt: { xs: 2, sm: 3 }, mb: { xs: 3, sm: 4 }, px: { xs: 2, sm: 0 } }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Protected><Home /></Protected>} />
          <Route path="/exercises" element={<Protected><Exercises /></Protected>} />
          <Route path="/metrics" element={<Protected><Metrics /></Protected>} />
          <Route path="/statistics" element={<Protected><Statistics /></Protected>} />
          <Route path="/settings" element={<Protected><Settings mode={mode} setMode={(m) => { storage.set('themeMode', m); setMode(m); }} /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
    </>
  );
}


