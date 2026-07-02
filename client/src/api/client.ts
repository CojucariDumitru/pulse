import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:5060/api';

export const TOKEN_KEY = 'pulse_token';
export const ADMIN_TOKEN_KEY = 'pulse_admin_token';

export const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Admin routes get the admin token; everything else the member token.
apiClient.interceptors.request.use((config) => {
  const isAdminRoute =
    (config.url ?? '').startsWith('/admin') || (config.url ?? '').startsWith('/auth/admin');
  const token = localStorage.getItem(isAdminRoute ? ADMIN_TOKEN_KEY : TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      const url: string = error.config?.url ?? '';
      localStorage.removeItem(url.startsWith('/admin') ? ADMIN_TOKEN_KEY : TOKEN_KEY);
    }
    return Promise.reject(error);
  },
);

export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string; message?: string } | undefined;
    return data?.error || data?.message || error.message || fallback;
  }
  return fallback;
}

export function isMembershipRequired(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 402;
}
