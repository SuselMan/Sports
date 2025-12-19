import axios, { AxiosHeaders } from 'axios';

const API_URL = import.meta.env.VITE_API_URL as string;

export const api = axios.create({
  baseURL: API_URL || 'http://localhost:4000',
  timeout: 15000,
});

let onUnauthorized: (() => void) | undefined;
let lastServerDateIso: string | null = null;

export function setOnUnauthorized(handler?: (() => void) | null) {
  onUnauthorized = handler ?? undefined;
}

export function getLastServerTimeIso(): string | null {
  return lastServerDateIso;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    const headers = new AxiosHeaders(config.headers as any);
    headers.set('Authorization', `Bearer ${token}`);
    config.headers = headers;
  }
  return config;
});

api.interceptors.response.use(
  (resp) => {
    const dateHeader = (resp?.headers as any)?.date as string | undefined;
    if (dateHeader) {
      const d = new Date(dateHeader);
      if (!Number.isNaN(d.valueOf())) lastServerDateIso = d.toISOString();
    }
    return resp;
  },
  (err) => {
    const status = err?.response?.status as number | undefined;
    if (status === 401) {
      try {
        onUnauthorized?.();
      } catch {
        // ignore
      }
    }
    return Promise.reject(err);
  },
);
