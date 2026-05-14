import { useEffect } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useLanguageStore } from '../../stores/useLanguageStore';

export function LanguageSync() {
  const userLanguage = useAuthStore((s) => s.user?.language ?? null);
  const setLanguage = useLanguageStore((s) => s.setLanguage);

  useEffect(() => {
    if (userLanguage) {
      setLanguage(userLanguage);
    }
  }, [userLanguage, setLanguage]);

  return null;
}
