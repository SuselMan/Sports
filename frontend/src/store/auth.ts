import create from 'zustand';
import { api } from '../api/client';

type AuthState = {
  token: string | null;
  setToken: (t: string | null) => void;
  signOut: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('auth_token'),
  setToken: (t) => {
    if (t) localStorage.setItem('auth_token', t);
    else localStorage.removeItem('auth_token');
    set({ token: t });
  },
  signOut: () => {
    localStorage.removeItem('auth_token');
    set({ token: null });
  },
}));

export async function exchangeGoogleIdToken(idToken: string) {
  const resp = await api.post('/auth/google', { idToken });
  return resp.data?.token as string;
}


