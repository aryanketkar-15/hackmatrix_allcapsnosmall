import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

/**
 * UI-only demo gate for the recorded prototype. This is NOT security: the credentials are public,
 * non-secret demo values. Real authentication and role-based access come in the second half.
 */
export interface DemoUser { username: string; name: string; role: string; initials: string }

export const DEMO_USERS: DemoUser[] = [
  { username: 'priya.sharma', name: 'Priya Sharma', role: 'Investigator', initials: 'PS' },
];

const SESSION_KEY = 'khoji.session';
const REMEMBER_KEY = 'khoji.rememberedUsername';

export const demoCredentials = () => ({
  username: (import.meta.env.VITE_DEMO_USER as string | undefined) ?? 'priya.sharma',
  password: (import.meta.env.VITE_DEMO_PASSWORD as string | undefined) ?? 'demo-only-123',
});

function readSession(): DemoUser | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { username?: unknown };
    if (typeof parsed?.username !== 'string') return null;
    return DEMO_USERS.find((u) => u.username === parsed.username) ?? null;
  } catch {
    return null; // corrupt or unavailable storage is treated as signed out
  }
}

export function getRememberedUsername(): string {
  try { return localStorage.getItem(REMEMBER_KEY) ?? ''; } catch { return ''; }
}

interface AuthApi {
  user: DemoUser | null;
  signIn: (username: string, password: string, remember: boolean) => boolean;
  signOut: () => void;
}

const Ctx = createContext<AuthApi>({ user: null, signIn: () => false, signOut: () => {} });
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(() => readSession());

  const signIn = useCallback((username: string, password: string, remember: boolean) => {
    const creds = demoCredentials();
    const found = DEMO_USERS.find((u) => u.username === username.trim());
    if (!found || username.trim() !== creds.username || password !== creds.password) return false;
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ username: found.username, signedInAt: new Date().toISOString() }));
      if (remember) localStorage.setItem(REMEMBER_KEY, found.username);
      else localStorage.removeItem(REMEMBER_KEY);
    } catch { /* storage blocked: session lives in memory only */ }
    setUser(found);
    return true;
  }, []);

  const signOut = useCallback(() => {
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, signIn, signOut }), [user, signIn, signOut]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
