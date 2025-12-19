import React from 'react';
import {
  Routes, Route, Navigate,
} from 'react-router-dom';
import Spinner from '@uikit/components/Spinner/Spinner';
import Login from './pages/Login';
import Home from './pages/Home';
import Metrics from './pages/Metrics';
import Statistics from './pages/Statistics';
import Exercises from './pages/Exercises';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import { useAuthStore } from './store/auth';
import { storage } from './utils/storage';
import { AppTopBar } from './components/AppTopBar';
import { installSyncListeners, useSyncStore } from './store/sync';
import styles from './App.module.css';

function Protected({ children }: { children: React.ReactElement }) {
  const token = useAuthStore((s) => s.token);
  const bootstrapped = useSyncStore((s) => s.bootstrapped);
  if (!token) return <Navigate to="/login" replace />;
  if (!bootstrapped) {
    return (
      <div className={styles.bootLoading}>
        <Spinner size="lg" />
      </div>
    );
  }
  return children;
}

function syncThemeColorToCssVar(): void {
  const meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
  if (!meta) return;
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--main-bg').trim();
  meta.content = bg || '#000000';
}

export default function App() {
  const [mode, setMode] = React.useState<'light' | 'dark'>(() => storage.get<'light' | 'dark'>('themeMode', 'light'));
  const token = useAuthStore((s) => s.token);
  const bootstrap = useSyncStore((s) => s.bootstrap);

  React.useEffect(() => {
    if (mode === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    syncThemeColorToCssVar();
  }, [mode]);

  React.useEffect(() => {
    installSyncListeners();
  }, []);

  React.useEffect(() => {
    // (Re)bootstrap after login so we pull the latest data into IndexedDB.
    if (token) bootstrap();
  }, [token, bootstrap]);

  return (
    <div>
      <AppTopBar />
      <div className={styles.container}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Protected><Home /></Protected>} />
          <Route path="/exercises" element={<Protected><Exercises /></Protected>} />
          <Route path="/metrics" element={<Protected><Metrics /></Protected>} />
          <Route path="/statistics/:exerciseId?" element={<Protected><Statistics /></Protected>} />
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}
