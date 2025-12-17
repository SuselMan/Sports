import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { exchangeGoogleIdToken, useAuthStore } from '../../store/auth';
import styles from './styles.module.css';

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
  }, [navigate, setToken]);

  useEffect(() => {
    if (token) {
      navigate('/', { replace: true });
    }
  }, [token, navigate]);

  return (
    <div className={styles.center}>
      <div className={styles.card}>
        <div className={styles.title}>Login</div>
        <div ref={btnRef} />
      </div>
    </div>
  );
}
