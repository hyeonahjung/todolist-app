import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { TodoForm } from '../components/todo/TodoForm';
import { useTodo } from '../hooks/todos/useTodo';
import { useCategories } from '../hooks/categories/useCategories';
import { useUpdateTodo } from '../hooks/todos/useUpdateTodo';
import { useDeleteTodo } from '../hooks/todos/useDeleteTodo';
import { useToggleTodoCompletion } from '../hooks/todos/useToggleTodoCompletion';
import type { CreateTodoRequest, UpdateTodoRequest } from '../types/todo.types';

export function TodoDetailPage() {
  const { todoId } = useParams<{ todoId: string }>();
  const navigate = useNavigate();
  const id = Number(todoId);

  const { data: todo, isLoading, isError } = useTodo(id);
  const { data: categories } = useCategories();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();
  const toggleCompletion = useToggleTodoCompletion();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  function handleUpdateSubmit(data: CreateTodoRequest | UpdateTodoRequest) {
    updateTodo.mutate({ todoId: id, data: data as UpdateTodoRequest }, {
      onSuccess: () => setIsEditOpen(false),
    });
  }

  function handleDeleteConfirm() {
    deleteTodo.mutate(id, {
      onSuccess: () => navigate('/'),
    });
  }

  const pageStyle: React.CSSProperties = {
    maxWidth: '720px',
    margin: '0 auto',
    padding: 'var(--space-8) var(--space-4)',
  };

  const backLinkStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-1)',
    color: 'var(--color-text-secondary)',
    fontSize: 'var(--font-size-sm)',
    marginBottom: 'var(--space-4)',
  };

  const cardStyle: React.CSSProperties = {
    background: 'var(--color-bg-card)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-sm)',
    padding: 'var(--space-6)',
  };

  const cardHeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 'var(--space-5)',
    paddingBottom: 'var(--space-4)',
    borderBottom: '1px solid var(--color-border)',
  };

  const cardTitleStyle: React.CSSProperties = {
    fontSize: 'var(--font-size-lg)',
    fontWeight: 'var(--font-weight-semibold)' as React.CSSProperties['fontWeight'],
    color: 'var(--color-text-primary)',
  };

  const actionsBtnGroupStyle: React.CSSProperties = {
    display: 'flex',
    gap: 'var(--space-2)',
  };

  const editBtnStyle: React.CSSProperties = {
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    padding: 'var(--space-2) var(--space-3)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
    background: 'transparent',
  };

  const deleteBtnStyle: React.CSSProperties = {
    border: '1px solid var(--color-error)',
    borderRadius: 'var(--radius-sm)',
    padding: 'var(--space-2) var(--space-3)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-error)',
    background: 'transparent',
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    gap: 'var(--space-4)',
    marginBottom: 'var(--space-4)',
    alignItems: 'flex-start',
  };

  const labelStyle: React.CSSProperties = {
    width: '96px',
    flexShrink: 0,
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
    paddingTop: '2px',
  };

  const valueStyle: React.CSSProperties = {
    flex: 1,
    fontSize: 'var(--font-size-md)',
    color: 'var(--color-text-primary)',
    lineHeight: 'var(--line-height-normal)',
    wordBreak: 'break-word',
  };

  const checkboxStyle: React.CSSProperties = {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    border: `2px solid ${todo?.isCompleted ? 'var(--color-primary)' : 'var(--color-border)'}`,
    background: todo?.isCompleted ? 'var(--color-primary)' : 'transparent',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-text-on-primary)',
    fontSize: '12px',
    fontWeight: 'bold',
    marginRight: 'var(--space-2)',
    flexShrink: 0,
  };

  const notFoundStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: 'var(--space-8)',
    color: 'var(--color-text-secondary)',
    fontSize: 'var(--font-size-md)',
  };

  const backBtnStyle: React.CSSProperties = {
    marginTop: 'var(--space-4)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    padding: 'var(--space-2) var(--space-4)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
    background: 'transparent',
  };

  if (isLoading) {
    return (
      <div style={pageStyle}>
        <LoadingSpinner />
      </div>
    );
  }

  if (isError || !todo) {
    return (
      <div style={pageStyle}>
        <div style={notFoundStyle}>
          <p>존재하지 않는 할일입니다.</p>
          <button style={backBtnStyle} onClick={() => navigate('/')}>
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const categoryName = categories?.find((c) => c.categoryId === todo.categoryId)?.name ?? '';

  const createdAtFormatted = new Date(todo.createdAt).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div style={pageStyle}>
      <Link to="/" style={backLinkStyle}>{'< 할일 목록으로'}</Link>

      <div style={cardStyle}>
        <div style={cardHeaderStyle}>
          <h1 style={cardTitleStyle}>할일 상세</h1>
          <div style={actionsBtnGroupStyle}>
            <button style={editBtnStyle} onClick={() => setIsEditOpen(true)}>수정</button>
            <button style={deleteBtnStyle} onClick={() => setIsDeleteOpen(true)}>삭제</button>
          </div>
        </div>

        <div style={rowStyle}>
          <span style={labelStyle}>완료 여부</span>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              style={checkboxStyle}
              onClick={() => toggleCompletion.mutate(todo.todoId)}
              aria-label={todo.isCompleted ? '완료 취소' : '완료 처리'}
            >
              {todo.isCompleted && '✓'}
            </button>
            <span style={{ ...valueStyle, color: todo.isCompleted ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
              {todo.isCompleted ? '완료' : '미완료'}
            </span>
          </div>
        </div>

        <div style={rowStyle}>
          <span style={labelStyle}>제목</span>
          <span style={{
            ...valueStyle,
            textDecoration: todo.isCompleted ? 'line-through' : 'none',
            color: todo.isCompleted ? 'var(--color-text-disabled)' : 'var(--color-text-primary)',
          }}>
            {todo.title}
          </span>
        </div>

        <div style={rowStyle}>
          <span style={labelStyle}>카테고리</span>
          <span style={valueStyle}>{categoryName}</span>
        </div>

        {todo.description && (
          <div style={rowStyle}>
            <span style={labelStyle}>설명</span>
            <span style={valueStyle}>{todo.description}</span>
          </div>
        )}

        <div style={rowStyle}>
          <span style={labelStyle}>종료예정일</span>
          <span style={valueStyle}>{todo.dueDate ?? '-'}</span>
        </div>

        <div style={{ ...rowStyle, marginBottom: 0 }}>
          <span style={labelStyle}>등록일시</span>
          <span style={valueStyle}>{createdAtFormatted}</span>
        </div>
      </div>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="할일 수정">
        <TodoForm
          initialData={todo}
          categories={categories ?? []}
          onSubmit={handleUpdateSubmit}
          onCancel={() => setIsEditOpen(false)}
          isLoading={updateTodo.isPending}
        />
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="할일 삭제"
        message={`"${todo.title}" 할일을 삭제하시겠습니까?`}
        confirmLabel="삭제"
        variant="danger"
      />
    </div>
  );
}
