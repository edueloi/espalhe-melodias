import { createContext, useContext, useState, useEffect, useCallback, type ReactNode, createElement } from 'react';
import { authApi, tokenStore, type AuthUser } from './api';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('melodias_user') ?? sessionStorage.getItem('melodias_user');
    try { return stored ? (JSON.parse(stored) as AuthUser) : null; }
    catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!tokenStore.get()) { setLoading(false); return; }
    try {
      const me = await authApi.me();
      setUser(me);
      tokenStore.setUser(me);
    } catch {
      tokenStore.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refreshUser(); }, [refreshUser]);

  // Escuta evento de logout forçado (token expirado sem refresh)
  useEffect(() => {
    const handler = () => { setUser(null); tokenStore.clear(); };
    window.addEventListener('melodias:logout', handler);
    return () => window.removeEventListener('melodias:logout', handler);
  }, []);

  const login = useCallback(async (email: string, password: string, rememberMe = true) => {
    tokenStore.setRememberMe(rememberMe);
    const data = await authApi.login(email, password);
    tokenStore.set(data.accessToken);
    tokenStore.setRefresh(data.refreshToken);
    tokenStore.setUser(data.user);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    const rt = tokenStore.getRefresh();
    if (rt) { try { await authApi.logout(rt); } catch { /* ignora */ } }
    tokenStore.clear();
    setUser(null);
  }, []);

  return createElement(AuthContext.Provider, { value: { user, loading, login, logout, refreshUser } }, children);
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
