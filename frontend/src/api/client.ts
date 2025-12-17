import axios, { AxiosHeaders } from 'axios';

const API_URL = import.meta.env.VITE_API_URL as string;

export const api = axios.create({
  baseURL: API_URL || 'http://localhost:4000',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    const headers = new AxiosHeaders(config.headers as any);
    headers.set('Authorization', `Bearer ${token}`);
    config.headers = headers;
  }
  return config;
});
