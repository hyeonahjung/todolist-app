import { useState } from 'react';
import { CategoryList } from '../components/category/CategoryList';
import { CategoryForm } from '../components/category/CategoryForm';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useCategories } from '../hooks/categories/useCategories';
import { useCreateCategory } from '../hooks/categories/useCreateCategory';
import { useUpdateCategory } from '../hooks/categories/useUpdateCategory';
import { useDeleteCategory } from '../hooks/categories/useDeleteCategory';
import { useLanguageStore } from '../stores/useLanguageStore';
import { translations } from '../i18n/translations';
import type { Category } from '../types/category.types';

type EditingState = { type: 'create' } | { type: 'edit'; category: Category } | null;

export function CategoryPage() {
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const language = useLanguageStore((s) => s.language);
  const t = translations[language];

  const [editing, setEditing] = useState<EditingState>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  function handleCreateSubmit(name: string) {
    createCategory.mutate({ name }, {
      onSuccess: () => setEditing(null),
    });
  }

  function handleUpdateSubmit(name: string) {
    if (editing?.type !== 'edit') return;
    updateCategory.mutate({ categoryId: editing.category.categoryId, data: { name } }, {
      onSuccess: () => setEditing(null),
    });
  }

  function handleDeleteConfirm() {
    if (!deletingCategory) return;
    deleteCategory.mutate(deletingCategory.categoryId, {
      onSuccess: () => setDeletingCategory(null),
    });
  }

  const pageStyle: React.CSSProperties = {
    maxWidth: '720px',
    margin: '0 auto',
    padding: 'var(--space-8) var(--space-4)',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 'var(--space-6)',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 'var(--font-size-xl)',
    fontWeight: 'var(--font-weight-bold)' as React.CSSProperties['fontWeight'],
    color: 'var(--color-text-primary)',
  };

  const addBtnStyle: React.CSSProperties = {
    background: 'var(--color-primary)',
    color: 'var(--color-text-on-primary)',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    padding: 'var(--space-2) var(--space-4)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-medium)' as React.CSSProperties['fontWeight'],
  };

  const addFirstBtnStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: 'var(--color-primary)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-medium)' as React.CSSProperties['fontWeight'],
    padding: 0,
    marginLeft: 'var(--space-2)',
  };

  const isFormLoading = createCategory.isPending || updateCategory.isPending;

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>{t.category.pageTitle}</h1>
        {editing?.type !== 'create' && (
          <button style={addBtnStyle} onClick={() => setEditing({ type: 'create' })}>
            {t.category.addBtn}
          </button>
        )}
      </div>

      {editing?.type === 'create' && (
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <CategoryForm
            onSubmit={handleCreateSubmit}
            onCancel={() => setEditing(null)}
            isLoading={isFormLoading}
          />
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <CategoryList
            categories={categories ?? []}
            onEdit={(category) => setEditing({ type: 'edit', category })}
            onDelete={(category) => setDeletingCategory(category)}
          />
          {editing?.type === 'edit' && (
            <div style={{ marginTop: 'var(--space-3)' }}>
              <CategoryForm
                initialName={editing.category.name}
                onSubmit={handleUpdateSubmit}
                onCancel={() => setEditing(null)}
                isLoading={isFormLoading}
              />
            </div>
          )}
          {(categories ?? []).filter((c) => !c.isDefault).length === 0 && editing?.type !== 'create' && (
            <button style={addFirstBtnStyle} onClick={() => setEditing({ type: 'create' })}>
              {t.category.addFirstBtn}
            </button>
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDeleteConfirm}
        title={t.category.deleteTitle}
        message={t.category.deleteMsg(deletingCategory?.name ?? '')}
        confirmLabel={t.category.deleteBtn}
        variant="danger"
      />
    </div>
  );
}
