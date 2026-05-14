import { useLanguageStore } from '../../stores/useLanguageStore';
import { useUpdateMe } from '../../hooks/user/useUpdateMe';
import type { Language } from '../../types/user.types';

const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'ko', label: '한국어' },
  { value: 'en', label: 'English' },
  { value: 'zh', label: '中文' },
  { value: 'ja', label: '日本語' },
  { value: 'es', label: 'Español' },
];

export function LanguageSelector() {
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const updateMe = useUpdateMe();

  function handleChange(lang: Language) {
    setLanguage(lang);
    updateMe.mutate({ language: lang });
  }

  const selectStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.15)',
    color: 'var(--color-text-on-primary)',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: 'var(--radius-sm)',
    padding: 'var(--space-1) var(--space-2)',
    fontSize: 'var(--font-size-sm)',
    cursor: 'pointer',
    outline: 'none',
  };

  return (
    <select
      style={selectStyle}
      value={language}
      onChange={(e) => handleChange(e.target.value as Language)}
      aria-label="Language"
    >
      {LANGUAGES.map(({ value, label }) => (
        <option
          key={value}
          value={value}
          style={{ background: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}
        >
          {label}
        </option>
      ))}
    </select>
  );
}
