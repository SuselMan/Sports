import React, { useEffect, useRef } from 'react';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { exchangeGoogleIdToken, useAuthStore } from '../store/auth';
import { useNavigate } from 'react-router-dom';

declare global {
  interface Window {
    google: any;
  }
}

export default function Login() {
  const setToken = useAuthStore((s) => s.setToken);
  const token = useAuthStore((s) => s.token);
  const btnRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
    if (!window.google) return;
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: any) => {
        const credential = response.credential as string;
        const jwt = await exchangeGoogleIdToken(credential);
        setToken(jwt);
        navigate('/', { replace: true });
      },
    });
    if (btnRef.current) {
      window.google.accounts.id.renderButton(btnRef.current, {
        theme: 'outline',
        size: 'large',
      });
    }
  }, []);

  useEffect(() => {
    if (token) {
      navigate('/', { replace: true });
    }
  }, [token]);

  return (
    <Box display="flex" minHeight="60vh" alignItems="center" justifyContent="center">
      <Paper sx={{ p: 4 }}>
        <Stack spacing={2} alignItems="center">
          <Typography variant="h5">Login</Typography>
          <div ref={btnRef} />
        </Stack>
      </Paper>
    </Box>
  );
}
