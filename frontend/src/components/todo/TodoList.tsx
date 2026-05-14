import { TodoCard } from './TodoCard';
import type { Todo } from '../../types/todo.types';
import type { Category } from '../../types/category.types';

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
        {hasFilter ? '조건에 맞는 할일이 없습니다.' : '아직 할일이 없습니다.'}
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
