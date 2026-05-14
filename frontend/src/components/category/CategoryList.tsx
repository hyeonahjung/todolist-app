import type { Category } from '../../types/category.types';

interface CategoryListProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function CategoryList({ categories, onEdit, onDelete }: CategoryListProps) {
  const defaultCategories = categories.filter((c) => c.isDefault);
  const customCategories = categories.filter((c) => !c.isDefault);

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: 'var(--font-size-lg)',
    fontWeight: 'var(--font-weight-semibold)' as React.CSSProperties['fontWeight'],
    color: 'var(--color-text-primary)',
    marginBottom: 'var(--space-3)',
  };

  const defaultItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    padding: 'var(--space-3) var(--space-4)',
    background: 'var(--color-primary-light)',
    borderRadius: 'var(--radius-sm)',
    marginBottom: 'var(--space-2)',
  };

  const systemBadgeStyle: React.CSSProperties = {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-secondary)',
    background: 'rgba(0,137,123,0.15)',
    border: '1px solid rgba(0,137,123,0.25)',
    borderRadius: 'var(--radius-full)',
    padding: '2px var(--space-2)',
    whiteSpace: 'nowrap',
  };

  const defaultNameStyle: React.CSSProperties = {
    fontSize: 'var(--font-size-md)',
    color: 'var(--color-text-secondary)',
    flex: 1,
  };

  const defaultHintStyle: React.CSSProperties = {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-disabled)',
  };

  const customItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    padding: 'var(--space-3) var(--space-4)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--color-bg-card)',
    marginBottom: 'var(--space-2)',
  };

  const customNameStyle: React.CSSProperties = {
    fontSize: 'var(--font-size-md)',
    color: 'var(--color-text-primary)',
    flex: 1,
  };

  const ghostBtnStyle: React.CSSProperties = {
    background: 'transparent',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    padding: 'var(--space-1) var(--space-3)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
  };

  const deleteBtnStyle: React.CSSProperties = {
    ...ghostBtnStyle,
    color: 'var(--color-error)',
    borderColor: 'rgba(229,57,53,0.3)',
  };

  const emptyStyle: React.CSSProperties = {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
    padding: 'var(--space-4) 0',
  };

  return (
    <div>
      <section style={{ marginBottom: 'var(--space-6)' }}>
        <h2 style={sectionTitleStyle}>기본 카테고리</h2>
        {defaultCategories.map((category) => (
          <div key={category.categoryId} style={defaultItemStyle}>
            <span style={systemBadgeStyle}>시스템</span>
            <span style={defaultNameStyle}>{category.name}</span>
            <span style={defaultHintStyle}>기본 카테고리 — 수정/삭제 불가</span>
          </div>
        ))}
      </section>

      <section>
        <h2 style={sectionTitleStyle}>사용자 정의 카테고리</h2>
        {customCategories.length === 0 ? (
          <p style={emptyStyle}>사용자 정의 카테고리가 없습니다.</p>
        ) : (
          customCategories.map((category) => (
            <div key={category.categoryId} style={customItemStyle}>
              <span style={customNameStyle}>{category.name}</span>
              <button
                style={ghostBtnStyle}
                onClick={() => onEdit(category)}
                aria-label={`${category.name} 수정`}
              >
                수정
              </button>
              <button
                style={deleteBtnStyle}
                onClick={() => onDelete(category)}
                aria-label={`${category.name} 삭제`}
              >
                삭제
              </button>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
