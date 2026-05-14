import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { createElement } from 'react';
import { TodoCard } from '../../components/todo/TodoCard';
import type { Todo } from '../../types/todo.types';

const baseTodo: Todo = {
  todoId: 1,
  userId: 1,
  categoryId: 1,
  title: '헬스장 PT 등록하기',
  description: '오늘 등록 예정',
  dueDate: null,
  isCompleted: false,
  createdAt: '2026-05-13T09:30:00.000Z',
};

function renderCard(todo: Todo, overrides: Partial<Parameters<typeof TodoCard>[0]> = {}) {
  const props = {
    todo,
    categoryName: '운동',
    onToggle: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onClick: vi.fn(),
    ...overrides,
  };
  return render(createElement(TodoCard, props));
}

describe('TodoCard', () => {
  it('미완료 상태를 렌더링한다', () => {
    renderCard(baseTodo);
    expect(screen.getByText('헬스장 PT 등록하기')).toBeInTheDocument();
    expect(screen.getByText('운동')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '완료 처리' })).toBeInTheDocument();
  });

  it('완료 상태를 렌더링한다', () => {
    const completedTodo = { ...baseTodo, isCompleted: true };
    renderCard(completedTodo);
    expect(screen.getByRole('button', { name: '완료 취소' })).toBeInTheDocument();
    const title = screen.getByText('헬스장 PT 등록하기');
    expect(title).toHaveStyle({ textDecoration: 'line-through' });
  });

  it('체크박스 클릭 시 onToggle을 호출한다', () => {
    const onToggle = vi.fn();
    renderCard(baseTodo, { onToggle });
    fireEvent.click(screen.getByRole('button', { name: '완료 처리' }));
    expect(onToggle).toHaveBeenCalledWith(1);
  });

  it('마감 임박(오늘+3일 이내) 시 경고 표시가 나타난다', () => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    const nearDueDate = today.toISOString().split('T')[0];
    const nearDueTodo = { ...baseTodo, dueDate: nearDueDate };
    renderCard(nearDueTodo);
    expect(screen.getByText('[!]')).toBeInTheDocument();
  });

  it('마감일이 3일 초과인 경우 경고 표시가 없다', () => {
    const future = new Date();
    future.setDate(future.getDate() + 10);
    const farDueTodo = { ...baseTodo, dueDate: future.toISOString().split('T')[0] };
    renderCard(farDueTodo);
    expect(screen.queryByText('[!]')).not.toBeInTheDocument();
  });

  it('수정 버튼 클릭 시 onEdit을 호출한다', () => {
    const onEdit = vi.fn();
    renderCard(baseTodo, { onEdit });
    fireEvent.click(screen.getByRole('button', { name: '수정' }));
    expect(onEdit).toHaveBeenCalledWith(baseTodo);
  });

  it('삭제 버튼 클릭 시 onDelete를 호출한다', () => {
    const onDelete = vi.fn();
    renderCard(baseTodo, { onDelete });
    fireEvent.click(screen.getByRole('button', { name: '삭제' }));
    expect(onDelete).toHaveBeenCalledWith(baseTodo);
  });
});
