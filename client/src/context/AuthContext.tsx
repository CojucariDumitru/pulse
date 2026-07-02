import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  ReactNode,
} from 'react';
import { TOKEN_KEY, ADMIN_TOKEN_KEY } from '../api/client';
import { login as apiLogin, register as apiRegister, fetchMe, adminLogin as apiAdminLogin } from '../api/endpoints';
import type { Member } from '../lib/types';

interface AuthState {
  member: Member | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  refresh: () => Promise<void>;
  logout: () => void;
  adminLogout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<Member | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => Boolean(localStorage.getItem(ADMIN_TOKEN_KEY)));
  const [loading, setLoading] = useState<boolean>(() => Boolean(localStorage.getItem(TOKEN_KEY)));

  const refresh = useCallback(async () => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      setMember(null);
      return;
    }
    try {
      setMember(await fetchMe());
    } catch {
      setMember(null);
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await apiLogin(email, password);
    localStorage.setItem(TOKEN_KEY, result.token);
    setMember(result.member);
  }, []);

  const register = useCallback(
    async (input: { name: string; email: string; password: string; phone?: string }) => {
      const result = await apiRegister(input);
      localStorage.setItem(TOKEN_KEY, result.token);
      setMember(result.member);
    },
    [],
  );

  const adminLogin = useCallback(async (email: string, password: string) => {
    const result = await apiAdminLogin(email, password);
    localStorage.setItem(ADMIN_TOKEN_KEY, result.token);
    setIsAdmin(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setMember(null);
  }, []);

  const adminLogout = useCallback(() => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setIsAdmin(false);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      member,
      isAuthenticated: Boolean(member),
      isAdmin,
      loading,
      login,
      register,
      adminLogin,
      refresh,
      logout,
      adminLogout,
    }),
    [member, isAdmin, loading, login, register, adminLogin, refresh, logout, adminLogout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
