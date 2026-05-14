import { useEffect } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';

export function ThemeSync() {
  const theme = useAuthStore((s) => s.user?.theme ?? 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return null;
}
