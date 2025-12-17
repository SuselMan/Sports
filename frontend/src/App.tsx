import React from 'react';
import {
  Routes, Route, Navigate,
} from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Metrics from './pages/Metrics';
import Statistics from './pages/Statistics';
import Exercises from './pages/Exercises';
import Settings from './pages/Settings';
import { useAuthStore } from './store/auth';
import { storage } from './utils/storage';
import { AppTopBar } from './components/AppTopBar';
import styles from './App.module.css';

function Protected({ children }: { children: React.ReactElement }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const [mode, setMode] = React.useState<'light' | 'dark'>(() => storage.get<'light' | 'dark'>('themeMode', 'light'));

  React.useEffect(() => {
    if (mode === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [mode]);

  return (
    <div>
      <AppTopBar />
      <div className={styles.container}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Protected><Home /></Protected>} />
          <Route path="/exercises" element={<Protected><Exercises /></Protected>} />
          <Route path="/metrics" element={<Protected><Metrics /></Protected>} />
          <Route path="/statistics" element={<Protected><Statistics /></Protected>} />
          <Route
            path="/settings"
            element={(
              <Protected>
                <Settings
                  mode={mode}
                  setMode={(m) => {
                    storage.set('themeMode', m);
                    setMode(m);
                  }}
                />
              </Protected>
            )}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}
