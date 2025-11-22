import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme, Container, AppBar, Toolbar, Typography, Button, Stack, IconButton, Drawer, List, ListItemButton, ListItemText, useMediaQuery } from '@mui/material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
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

function Protected({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const [mode, setMode] = React.useState<'light' | 'dark'>(() => storage.get<'light' | 'dark'>('themeMode', 'light'));
  const theme = React.useMemo(() => createTheme({ palette: { mode } }), [mode]);
  const { token, signOut } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));
  const [open, setOpen] = React.useState(false);
  const { t } = useTranslation();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {t('appName')}
          </Typography>
          {token && isDesktop && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Button color={location.pathname === '/' ? 'secondary' : 'inherit'} component={RouterLink} to="/">{t('nav.home')}</Button>
              <Button color={location.pathname.startsWith('/exercises') ? 'secondary' : 'inherit'} component={RouterLink} to="/exercises">{t('nav.exercises')}</Button>
              <Button color={location.pathname.startsWith('/statistics') ? 'secondary' : 'inherit'} component={RouterLink} to="/statistics">{t('nav.statistics')}</Button>
              <Button color={location.pathname.startsWith('/settings') ? 'secondary' : 'inherit'} component={RouterLink} to="/settings">{t('nav.settings')}</Button>
              <Button color="inherit" onClick={() => { signOut(); navigate('/login'); }}>
                {t('nav.logout')}
              </Button>
            </Stack>
          )}
          {token && !isDesktop && (
            <>
              <IconButton color="inherit" onClick={() => setOpen(true)} aria-label="menu">
                <MenuIcon />
              </IconButton>
              <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
                <List sx={{ width: 240 }}>
                  <ListItemButton component={RouterLink} to="/" onClick={() => setOpen(false)} selected={location.pathname === '/'}>
                    <ListItemText primary={t('nav.home')} />
                  </ListItemButton>
                  <ListItemButton component={RouterLink} to="/exercises" onClick={() => setOpen(false)} selected={location.pathname.startsWith('/exercises')}>
                    <ListItemText primary={t('nav.exercises')} />
                  </ListItemButton>
                  <ListItemButton component={RouterLink} to="/statistics" onClick={() => setOpen(false)} selected={location.pathname.startsWith('/statistics')}>
                    <ListItemText primary={t('nav.statistics')} />
                  </ListItemButton>
                  <ListItemButton component={RouterLink} to="/settings" onClick={() => setOpen(false)} selected={location.pathname.startsWith('/settings')}>
                    <ListItemText primary={t('nav.settings')} />
                  </ListItemButton>
                  <ListItemButton onClick={() => { setOpen(false); signOut(); navigate('/login'); }}>
                    <ListItemText primary={t('nav.logout')} />
                  </ListItemButton>
                </List>
              </Drawer>
            </>
          )}
        </Toolbar>
      </AppBar>
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
    </ThemeProvider>
  );
}


