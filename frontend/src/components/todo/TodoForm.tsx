import { useState } from 'react';
import type { Todo, CreateTodoRequest, UpdateTodoRequest } from '../../types/todo.types';
import type { Category } from '../../types/category.types';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { translations } from '../../i18n/translations';

interface TodoFormProps {
  initialData?: Todo;
  categories: Category[];
  onSubmit: (data: CreateTodoRequest | UpdateTodoRequest) => void;
  onCancel: () => void;
  isLoading: boolean;
}

interface FormErrors {
  title?: string;
  categoryId?: string;
  description?: string;
  dueDate?: string;
}

export function TodoForm({ initialData, categories, onSubmit, onCancel, isLoading }: TodoFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [categoryId, setCategoryId] = useState<number | ''>(initialData?.categoryId ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [dueDate, setDueDate] = useState(initialData?.dueDate ?? '');
  const [errors, setErrors] = useState<FormErrors>({});
  const language = useLanguageStore((s) => s.language);
  const t = translations[language];

  const isEditMode = !!initialData;
  const today = new Date().toISOString().split('T')[0];

  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (!title.trim()) {
      newErrors.title = t.todoForm.titleRequired;
    } else if (title.length > 100) {
      newErrors.title = t.todoForm.titleTooLong;
    }

    if (!categoryId) {
      newErrors.categoryId = t.todoForm.categoryRequired;
    }

    if (description.length > 1000) {
      newErrors.description = t.todoForm.descriptionTooLong;
    }

    if (dueDate && dueDate < today) {
      newErrors.dueDate = t.todoForm.dueDateInvalid;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    if (isEditMode) {
      const data: UpdateTodoRequest = {
        title: title.trim(),
        categoryId: categoryId as number,
        description: description.trim() || null,
        dueDate: dueDate || null,
      };
      onSubmit(data);
    } else {
      const data: CreateTodoRequest = {
        title: title.trim(),
        categoryId: categoryId as number,
        ...(description.trim() && { description: description.trim() }),
        ...(dueDate && { dueDate }),
      };
      onSubmit(data);
    }
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-medium)' as React.CSSProperties['fontWeight'],
    color: 'var(--color-text-primary)',
    marginBottom: 'var(--space-1)',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    padding: 'var(--space-2) var(--space-3)',
    fontSize: 'var(--font-size-md)',
    color: 'var(--color-text-primary)',
    background: 'var(--color-bg-card)',
  };

  const errorStyle: React.CSSProperties = {
    color: 'var(--color-error)',
    fontSize: 'var(--font-size-sm)',
    marginTop: 'var(--space-1)',
  };

  const fieldStyle: React.CSSProperties = {
    marginBottom: 'var(--space-4)',
  };

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 'var(--space-3)',
    marginTop: 'var(--space-5)',
  };

  const cancelBtnStyle: React.CSSProperties = {
    background: 'transparent',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    padding: 'var(--space-2) var(--space-4)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
  };

  const submitBtnStyle: React.CSSProperties = {
    background: 'var(--color-primary)',
    color: 'var(--color-text-on-primary)',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    padding: 'var(--space-2) var(--space-4)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-medium)' as React.CSSProperties['fontWeight'],
    opacity: isLoading ? 0.7 : 1,
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div style={fieldStyle}>
        <label htmlFor="todo-title" style={labelStyle}>{t.todoForm.titleLabel}</label>
        <input
          id="todo-title"
          type="text"
          style={inputStyle}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          placeholder={t.todoForm.titlePlaceholder}
          aria-label={t.todoForm.titleLabel}
        />
        {errors.title && <p style={errorStyle}>{errors.title}</p>}
      </div>

      <div style={fieldStyle}>
        <label htmlFor="todo-category" style={labelStyle}>{t.todoForm.categoryLabel}</label>
        <select
          id="todo-category"
          style={inputStyle}
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
          aria-label={t.todoForm.categoryLabel}
        >
          <option value="">{t.todoForm.categoryPlaceholder}</option>
          {categories.map((c) => (
            <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
          ))}
        </select>
        {errors.categoryId && <p style={errorStyle}>{errors.categoryId}</p>}
      </div>

      <div style={fieldStyle}>
        <label htmlFor="todo-description" style={labelStyle}>{t.todoForm.descriptionLabel}</label>
        <textarea
          id="todo-description"
          style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={1000}
          placeholder={t.todoForm.descriptionPlaceholder}
          aria-label={t.todoForm.descriptionLabel}
        />
        {errors.description && <p style={errorStyle}>{errors.description}</p>}
      </div>

      <div style={fieldStyle}>
        <label htmlFor="todo-due-date" style={labelStyle}>{t.todoForm.dueDateLabel}</label>
        <input
          id="todo-due-date"
          type="date"
          style={inputStyle}
          value={dueDate}
          min={today}
          onChange={(e) => setDueDate(e.target.value)}
          aria-label={t.todoForm.dueDateLabel}
        />
        {errors.dueDate && <p style={errorStyle}>{errors.dueDate}</p>}
      </div>

      <div style={actionsStyle}>
        <button type="button" style={cancelBtnStyle} onClick={onCancel} disabled={isLoading}>
          {t.todoForm.cancel}
        </button>
        <button type="submit" style={submitBtnStyle} disabled={isLoading}>
          {isLoading ? t.todoForm.pending : isEditMode ? t.todoForm.save : t.todoForm.create}
        </button>
      </div>
    </form>
  );
}
