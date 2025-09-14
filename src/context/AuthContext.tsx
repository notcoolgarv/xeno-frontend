import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { adminMe, adminLogin, adminBootstrap, adminLogout, tenantMe } from '../lib/api';

interface AuthUserAdmin { id: string; email: string; kind: 'admin'; }
interface AuthUserTenant { id: string; email: string; kind: 'tenant'; tenantId: string; hasAccessToken: boolean; shopDomain: string; }
export type AuthUser = AuthUserAdmin | AuthUserTenant;

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  bootstrap: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  firstTime: boolean | null;
  isAdmin: boolean;
  isTenant: boolean;
  tenantId: string | null;
  tenantShopDomain: string | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [firstTime, setFirstTime] = useState<boolean | null>(null);

  async function detect() {
    console.debug('[Auth] detect() start');
    setLoading(true);
    let found = false;
    try {
      const me = await adminMe();
      if (me?.user) {
        console.debug('[Auth] admin session found', me.user.email);
        setUser({ id: me.user.id, email: me.user.email, kind: 'admin' });
        setFirstTime(false);
        found = true;
      }
    } catch (e) {
    }
    if (!found) {
      try {
        const t = await tenantMe();
        if (t?.user && t?.tenant) {
          console.debug('[Auth] tenant session found', t.user.email, 'tenant', t.tenant.id);
          setUser({ id: t.user.id, email: t.user.email, kind: 'tenant', tenantId: t.tenant.id, hasAccessToken: !!t.tenant.has_access_token, shopDomain: t.tenant.shop_domain });
          found = true;
          setFirstTime(false);
        }
      } catch (e) {
      }
    }
    if (!found) {
      setUser(null);
      if (firstTime === null) setFirstTime(true);
    }
    setLoading(false);
  }

  useEffect(() => { detect(); }, []);

  async function login(email: string, password: string) {
    await adminLogin(email, password);
    await detect();
  }
  async function bootstrap(email: string, password: string) {
    await adminBootstrap(email, password);
    await login(email, password);
  }
  async function logout() {
    try { await adminLogout(); } catch {}
    setUser(null);
  }
  async function refresh() { await detect(); }

  const isAdmin = user?.kind === 'admin';
  const isTenant = user?.kind === 'tenant';
  const tenantId = isTenant ? (user as AuthUserTenant).tenantId : null;
  const tenantShopDomain = isTenant ? (user as AuthUserTenant).shopDomain : null;

  return (
    <AuthContext.Provider value={{ user, loading, login, bootstrap, logout, refresh, firstTime, isAdmin, isTenant, tenantId, tenantShopDomain }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}