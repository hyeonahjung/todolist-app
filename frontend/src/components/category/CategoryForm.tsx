import { useState } from 'react';

interface CategoryFormProps {
  initialName?: string;
  onSubmit: (name: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function CategoryForm({ initialName = '', onSubmit, onCancel, isLoading }: CategoryFormProps) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length === 0) {
      setError('카테고리명을 입력해 주세요.');
      return;
    }
    if (name.trim().length > 30) {
      setError('카테고리명은 30자 이하여야 합니다.');
      return;
    }
    setError('');
    onSubmit(name.trim());
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setName(value);
    if (value.trim().length > 30) {
      setError('카테고리명은 30자 이하여야 합니다.');
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
          placeholder="카테고리명 입력 (최대 30자)"
          maxLength={31}
          autoFocus
          aria-label="카테고리명"
        />
        <button type="button" style={cancelBtnStyle} onClick={onCancel} disabled={isLoading}>
          취소
        </button>
        <button type="submit" style={saveBtnStyle} disabled={isLoading}>
          저장
        </button>
      </div>
      {error && <span style={errorStyle}>{error}</span>}
    </form>
  );
}
