import { useState } from 'react';
import type { Category } from '../../types/category.types';
import type { TodoFilter } from '../../types/todo.types';

interface FilterBarProps {
  filter: TodoFilter;
  categories: Category[];
  onChange: (filter: TodoFilter) => void;
  onReset: () => void;
}

export function FilterBar({ filter, categories, onChange, onReset }: FilterBarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const selectStyle: React.CSSProperties = {
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    padding: 'var(--space-2) var(--space-3)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-primary)',
    background: 'var(--color-bg-card)',
  };

  const inputStyle: React.CSSProperties = {
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    padding: 'var(--space-2) var(--space-3)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-primary)',
    background: 'var(--color-bg-card)',
  };

  const resetBtnStyle: React.CSSProperties = {
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    padding: 'var(--space-2) var(--space-3)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
    background: 'transparent',
  };

  const filterPanelStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--space-3)',
    alignItems: 'center',
    padding: 'var(--space-3) var(--space-4)',
    background: 'var(--color-bg-card)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-sm)',
    marginBottom: 'var(--space-4)',
  };

  const mobileBtnStyle: React.CSSProperties = {
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    padding: 'var(--space-2) var(--space-3)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
    background: 'var(--color-bg-card)',
    display: 'none',
  };

  const completionValue =
    filter.isCompleted === undefined ? '' : filter.isCompleted ? 'true' : 'false';

  function handleCompletionChange(value: string) {
    if (value === '') {
      const { isCompleted: _removed, ...rest } = filter;
      onChange(rest);
    } else {
      onChange({ ...filter, isCompleted: value === 'true' });
    }
  }

  function handleCategoryChange(value: string) {
    if (value === '') {
      const { categoryId: _removed, ...rest } = filter;
      onChange(rest);
    } else {
      onChange({ ...filter, categoryId: Number(value) });
    }
  }

  return (
    <>
      <style>{`
        @media (max-width: 640px) {
          .filter-mobile-btn { display: block !important; }
          .filter-panel { display: none !important; }
          .filter-panel.open { display: flex !important; }
        }
      `}</style>
      <button
        className="filter-mobile-btn"
        style={mobileBtnStyle}
        onClick={() => setMobileOpen((v) => !v)}
        aria-expanded={mobileOpen}
      >
        필터 {mobileOpen ? '닫기' : '열기'}
      </button>
      <div className={`filter-panel${mobileOpen ? ' open' : ''}`} style={filterPanelStyle}>
        <select
          style={selectStyle}
          value={filter.categoryId ?? ''}
          onChange={(e) => handleCategoryChange(e.target.value)}
          aria-label="카테고리 필터"
        >
          <option value="">전체 카테고리</option>
          {categories.map((c) => (
            <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
          ))}
        </select>

        <select
          style={selectStyle}
          value={completionValue}
          onChange={(e) => handleCompletionChange(e.target.value)}
          aria-label="완료 여부 필터"
        >
          <option value="">전체</option>
          <option value="false">미완료</option>
          <option value="true">완료</option>
        </select>

        <input
          type="date"
          style={inputStyle}
          value={filter.dueDateFrom ?? ''}
          onChange={(e) => onChange({ ...filter, dueDateFrom: e.target.value || undefined })}
          aria-label="시작 날짜"
        />
        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>~</span>
        <input
          type="date"
          style={inputStyle}
          value={filter.dueDateTo ?? ''}
          onChange={(e) => onChange({ ...filter, dueDateTo: e.target.value || undefined })}
          aria-label="종료 날짜"
        />

        <button style={resetBtnStyle} onClick={onReset}>필터 초기화</button>
      </div>
    </>
  );
}
