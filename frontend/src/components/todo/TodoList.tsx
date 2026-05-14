import { TodoCard } from './TodoCard';
import type { Todo } from '../../types/todo.types';
import type { Category } from '../../types/category.types';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { translations } from '../../i18n/translations';

interface TodoListProps {
  todos: Todo[];
  categories: Category[];
  onToggle: (todoId: number) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
  onClickCard: (todo: Todo) => void;
  hasFilter?: boolean;
}

export function TodoList({ todos, categories, onToggle, onEdit, onDelete, onClickCard, hasFilter }: TodoListProps) {
  const language = useLanguageStore((s) => s.language);
  const t = translations[language];

  const emptyStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: 'var(--space-8)',
    color: 'var(--color-text-secondary)',
    fontSize: 'var(--font-size-md)',
  };

  const getCategoryName = (categoryId: number) => {
    return categories.find((c) => c.categoryId === categoryId)?.name ?? '';
  };

  if (todos.length === 0) {
    return (
      <div style={emptyStyle}>
        {hasFilter ? t.todo.emptyWithFilter : t.todo.emptyNoFilter}
      </div>
    );
  }

  return (
    <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
      {todos.map((todo) => (
        <TodoCard
          key={todo.todoId}
          todo={todo}
          categoryName={getCategoryName(todo.categoryId)}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
          onClick={onClickCard}
        />
      ))}
    </div>
  );
}
