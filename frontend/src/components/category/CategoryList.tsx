import type { Category } from '../../types/category.types';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { translations } from '../../i18n/translations';

interface CategoryListProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function CategoryList({ categories, onEdit, onDelete }: CategoryListProps) {
  const language = useLanguageStore((s) => s.language);
  const t = translations[language];

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
        <h2 style={sectionTitleStyle}>{t.categoryList.defaultSection}</h2>
        {defaultCategories.map((category) => (
          <div key={category.categoryId} style={defaultItemStyle}>
            <span style={systemBadgeStyle}>{t.categoryList.systemBadge}</span>
            <span style={defaultNameStyle}>{category.name}</span>
            <span style={defaultHintStyle}>{t.categoryList.defaultHint}</span>
          </div>
        ))}
      </section>

      <section>
        <h2 style={sectionTitleStyle}>{t.categoryList.customSection}</h2>
        {customCategories.length === 0 ? (
          <p style={emptyStyle}>{t.categoryList.noCustom}</p>
        ) : (
          customCategories.map((category) => (
            <div key={category.categoryId} style={customItemStyle}>
              <span style={customNameStyle}>{category.name}</span>
              <button
                style={ghostBtnStyle}
                onClick={() => onEdit(category)}
                aria-label={`${category.name} ${t.categoryList.edit}`}
              >
                {t.categoryList.edit}
              </button>
              <button
                style={deleteBtnStyle}
                onClick={() => onDelete(category)}
                aria-label={`${category.name} ${t.categoryList.delete}`}
              >
                {t.categoryList.delete}
              </button>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
