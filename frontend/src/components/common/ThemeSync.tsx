import { useEffect } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';

const THEME_KEY = 'app-theme';

export function ThemeSync() {
  const theme = useAuthStore((s) => s.user?.theme ?? null);

  useEffect(() => {
    if (theme) {
      localStorage.setItem(THEME_KEY, theme);
      document.documentElement.setAttribute('data-theme', theme);
    } else {
      const saved = localStorage.getItem(THEME_KEY) ?? 'light';
      document.documentElement.setAttribute('data-theme', saved);
    }
  }, [theme]);

  return null;
}
