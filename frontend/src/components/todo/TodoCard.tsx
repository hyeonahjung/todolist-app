import type { Todo } from '../../types/todo.types';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { translations } from '../../i18n/translations';

interface TodoCardProps {
  todo: Todo;
  categoryName: string;
  onToggle: (todoId: number) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
  onClick: (todo: Todo) => void;
}

function isNearDue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  const today = new Date().toISOString().split('T')[0];
  const warningDate = new Date();
  warningDate.setDate(warningDate.getDate() + 3);
  const warningStr = warningDate.toISOString().split('T')[0];
  return dueDate >= today && dueDate <= warningStr;
}

export function TodoCard({ todo, categoryName, onToggle, onEdit, onDelete, onClick }: TodoCardProps) {
  const nearDue = isNearDue(todo.dueDate);
  const language = useLanguageStore((s) => s.language);
  const t = translations[language];

  const cardStyle: React.CSSProperties = {
    minHeight: '56px',
    padding: 'var(--space-3) var(--space-4)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    borderBottom: '1px solid var(--color-border)',
    background: 'var(--color-bg-card)',
    cursor: 'pointer',
    transition: 'background var(--duration-fast)',
  };

  const checkboxStyle: React.CSSProperties = {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    border: `2px solid ${todo.isCompleted ? 'var(--color-primary)' : 'var(--color-border)'}`,
    background: todo.isCompleted ? 'var(--color-primary)' : 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: 'var(--color-text-on-primary)',
    fontSize: '12px',
    fontWeight: 'bold',
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 'var(--font-size-md)',
    color: todo.isCompleted ? 'var(--color-text-disabled)' : 'var(--color-text-primary)',
    textDecoration: todo.isCompleted ? 'line-through' : 'none',
    fontWeight: 'var(--font-weight-medium)' as React.CSSProperties['fontWeight'],
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const metaStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    marginTop: 'var(--space-1)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
  };

  const badgeStyle: React.CSSProperties = {
    background: 'var(--color-primary-light)',
    color: 'var(--color-primary-dark)',
    borderRadius: 'var(--radius-full)',
    padding: '2px var(--space-2)',
    fontSize: 'var(--font-size-xs)',
    fontWeight: 'var(--font-weight-medium)' as React.CSSProperties['fontWeight'],
    flexShrink: 0,
  };

  const warningStyle: React.CSSProperties = {
    color: 'var(--color-warning)',
    fontSize: 'var(--font-size-xs)',
    fontWeight: 'var(--font-weight-semibold)' as React.CSSProperties['fontWeight'],
  };

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    gap: 'var(--space-2)',
    flexShrink: 0,
    alignItems: 'center',
  };

  const actionBtnStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: 'var(--color-text-secondary)',
    fontSize: 'var(--font-size-sm)',
    padding: 'var(--space-1) var(--space-2)',
    borderRadius: 'var(--radius-sm)',
  };

  const rightGroupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 'var(--space-1)',
    flexShrink: 0,
  };

  return (
    <div
      style={cardStyle}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--color-primary-light)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--color-bg-card)'; }}
      onClick={() => onClick(todo)}
    >
      <button
        style={checkboxStyle}
        onClick={(e) => { e.stopPropagation(); onToggle(todo.todoId); }}
        aria-label={todo.isCompleted ? t.todo.uncomplete : t.todo.complete}
      >
        {todo.isCompleted && '✓'}
      </button>

      <div style={contentStyle}>
        <div style={titleStyle}>{todo.title}</div>
        <div style={metaStyle}>
          {todo.dueDate && (
            <span>{todo.dueDate}</span>
          )}
          {todo.dueDate && todo.description && <span>·</span>}
          {todo.description && (
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
              {todo.description}
            </span>
          )}
          {nearDue && !todo.isCompleted && (
            <span style={warningStyle}>[!]</span>
          )}
        </div>
      </div>

      <div style={rightGroupStyle}>
        <span style={badgeStyle}>{categoryName}</span>
        <div style={actionsStyle}>
          <button
            style={actionBtnStyle}
            onClick={(e) => { e.stopPropagation(); onEdit(todo); }}
            aria-label={t.todo.edit}
          >
            {t.todo.edit}
          </button>
          <button
            style={{ ...actionBtnStyle, color: 'var(--color-error)' }}
            onClick={(e) => { e.stopPropagation(); onDelete(todo); }}
            aria-label={t.todo.delete}
          >
            {t.todo.delete}
          </button>
        </div>
      </div>
    </div>
  );
}
