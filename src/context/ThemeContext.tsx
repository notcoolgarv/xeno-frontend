import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface ThemeContextValue {
  dark: boolean;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState<boolean>(() => {
    try { return localStorage.getItem('xeno_theme') === 'dark'; } catch { return false; }
  });
  useEffect(() => {
    try { localStorage.setItem('xeno_theme', dark ? 'dark' : 'light'); } catch {}
    try {
      if (dark) document.body.classList.add('dark-theme'); else document.body.classList.remove('dark-theme');
    } catch {}
  }, [dark]);
  function toggle() { setDark(d => !d); }
  return <ThemeContext.Provider value={{ dark, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}