import { create } from 'zustand';
import type { Language } from '../types/user.types';

const LANG_KEY = 'app-language';
const VALID: Language[] = ['ko', 'en', 'zh', 'ja', 'es'];

function getInitialLanguage(): Language {
  try {
    const stored = localStorage.getItem(LANG_KEY) as Language | null;
    if (stored && VALID.includes(stored)) return stored;
  } catch {}
  return 'ko';
}

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: getInitialLanguage(),
  setLanguage: (language) => {
    try { localStorage.setItem(LANG_KEY, language); } catch {}
    set({ language });
  },
}));
