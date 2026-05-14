import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilterBar } from '../components/todo/FilterBar';
import { TodoList } from '../components/todo/TodoList';
import { TodoForm } from '../components/todo/TodoForm';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useTodos } from '../hooks/todos/useTodos';
import { useCategories } from '../hooks/categories/useCategories';
import { useCreateTodo } from '../hooks/todos/useCreateTodo';
import { useUpdateTodo } from '../hooks/todos/useUpdateTodo';
import { useDeleteTodo } from '../hooks/todos/useDeleteTodo';
import { useToggleTodoCompletion } from '../hooks/todos/useToggleTodoCompletion';
import type { Todo, TodoFilter, CreateTodoRequest, UpdateTodoRequest } from '../types/todo.types';

const EMPTY_FILTER: TodoFilter = {};

function hasActiveFilter(filter: TodoFilter): boolean {
  return (
    filter.categoryId !== undefined ||
    filter.isCompleted !== undefined ||
    !!filter.dueDateFrom ||
    !!filter.dueDateTo
  );
}

export function TodoListPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<TodoFilter>(EMPTY_FILTER);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [deletingTodo, setDeletingTodo] = useState<Todo | null>(null);

  const { data: todos, isLoading: todosLoading } = useTodos(filter);
  const { data: categories } = useCategories();
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();
  const toggleCompletion = useToggleTodoCompletion();

  function handleCreateSubmit(data: CreateTodoRequest | UpdateTodoRequest) {
    createTodo.mutate(data as CreateTodoRequest, {
      onSuccess: () => setIsAddOpen(false),
    });
  }

  function handleUpdateSubmit(data: CreateTodoRequest | UpdateTodoRequest) {
    if (!editingTodo) return;
    updateTodo.mutate({ todoId: editingTodo.todoId, data: data as UpdateTodoRequest }, {
      onSuccess: () => setEditingTodo(null),
    });
  }

  function handleDeleteConfirm() {
    if (!deletingTodo) return;
    deleteTodo.mutate(deletingTodo.todoId, {
      onSuccess: () => setDeletingTodo(null),
    });
  }

  const pageStyle: React.CSSProperties = {
    maxWidth: '800px',
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

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>할일 목록</h1>
        <button style={addBtnStyle} onClick={() => setIsAddOpen(true)}>
          + 할일 추가
        </button>
      </div>

      <FilterBar
        filter={filter}
        categories={categories ?? []}
        onChange={setFilter}
        onReset={() => setFilter(EMPTY_FILTER)}
      />

      {todosLoading ? (
        <LoadingSpinner />
      ) : (
        <TodoList
          todos={todos ?? []}
          categories={categories ?? []}
          onToggle={(todoId) => toggleCompletion.mutate(todoId)}
          onEdit={(todo) => setEditingTodo(todo)}
          onDelete={(todo) => setDeletingTodo(todo)}
          onClickCard={(todo) => navigate(`/todos/${todo.todoId}`)}
          hasFilter={hasActiveFilter(filter)}
        />
      )}

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="할일 추가">
        <TodoForm
          categories={categories ?? []}
          onSubmit={handleCreateSubmit}
          onCancel={() => setIsAddOpen(false)}
          isLoading={createTodo.isPending}
        />
      </Modal>

      <Modal isOpen={!!editingTodo} onClose={() => setEditingTodo(null)} title="할일 수정">
        {editingTodo && (
          <TodoForm
            initialData={editingTodo}
            categories={categories ?? []}
            onSubmit={handleUpdateSubmit}
            onCancel={() => setEditingTodo(null)}
            isLoading={updateTodo.isPending}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingTodo}
        onClose={() => setDeletingTodo(null)}
        onConfirm={handleDeleteConfirm}
        title="할일 삭제"
        message={`"${deletingTodo?.title ?? ''}" 할일을 삭제하시겠습니까?`}
        confirmLabel="삭제"
        variant="danger"
      />
    </div>
  );
}
