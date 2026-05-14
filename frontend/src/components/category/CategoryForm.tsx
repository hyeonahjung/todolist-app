import { useState } from 'react';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { translations } from '../../i18n/translations';

interface CategoryFormProps {
  initialName?: string;
  onSubmit: (name: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function CategoryForm({ initialName = '', onSubmit, onCancel, isLoading }: CategoryFormProps) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState('');
  const language = useLanguageStore((s) => s.language);
  const t = translations[language];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length === 0) {
      setError(t.categoryForm.required);
      return;
    }
    if (name.trim().length > 30) {
      setError(t.categoryForm.tooLong);
      return;
    }
    setError('');
    onSubmit(name.trim());
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setName(value);
    if (value.trim().length > 30) {
      setError(t.categoryForm.tooLong);
    } else {
      setError('');
    }
  }

  const formStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-2)',
    padding: 'var(--space-3)',
    border: '1px solid var(--color-border-focus)',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--color-bg-card)',
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    gap: 'var(--space-2)',
    alignItems: 'center',
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    padding: 'var(--space-2) var(--space-3)',
    border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-border)'}`,
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--font-size-md)',
    outline: 'none',
    color: 'var(--color-text-primary)',
  };

  const cancelBtnStyle: React.CSSProperties = {
    padding: 'var(--space-2) var(--space-3)',
    background: 'transparent',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  };

  const saveBtnStyle: React.CSSProperties = {
    padding: 'var(--space-2) var(--space-3)',
    background: 'var(--color-primary)',
    color: 'var(--color-text-on-primary)',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-medium)' as React.CSSProperties['fontWeight'],
    whiteSpace: 'nowrap',
    opacity: isLoading ? 0.7 : 1,
  };

  const errorStyle: React.CSSProperties = {
    color: 'var(--color-error)',
    fontSize: 'var(--font-size-sm)',
  };

  return (
    <form style={formStyle} onSubmit={handleSubmit}>
      <div style={rowStyle}>
        <input
          style={inputStyle}
          type="text"
          value={name}
          onChange={handleChange}
          placeholder={t.categoryForm.placeholder}
          maxLength={31}
          autoFocus
          aria-label={t.categoryForm.placeholder}
        />
        <button type="button" style={cancelBtnStyle} onClick={onCancel} disabled={isLoading}>
          {t.categoryForm.cancel}
        </button>
        <button type="submit" style={saveBtnStyle} disabled={isLoading}>
          {t.categoryForm.save}
        </button>
      </div>
      {error && <span style={errorStyle}>{error}</span>}
    </form>
  );
}
