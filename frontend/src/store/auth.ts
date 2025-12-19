import create from 'zustand';
import { apiClient } from '../api/apiClient';
import { setOnUnauthorized } from '../api/client';

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
    apiClient.logout();
    set({ token: null });
  },
}));

setOnUnauthorized(() => {
  const s = useAuthStore.getState();
  if (s.token) s.signOut();
});

export async function exchangeGoogleIdToken(idToken: string) {
  return apiClient.exchangeGoogleIdToken(idToken);
}
