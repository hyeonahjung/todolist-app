import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../hooks/todos/useTodos', () => ({
  useTodos: vi.fn(),
}));

vi.mock('../../hooks/categories/useCategories', () => ({
  useCategories: vi.fn(),
}));

vi.mock('../../hooks/todos/useCreateTodo', () => ({
  useCreateTodo: vi.fn(),
}));

vi.mock('../../hooks/todos/useUpdateTodo', () => ({
  useUpdateTodo: vi.fn(),
}));

vi.mock('../../hooks/todos/useDeleteTodo', () => ({
  useDeleteTodo: vi.fn(),
}));

vi.mock('../../hooks/todos/useToggleTodoCompletion', () => ({
  useToggleTodoCompletion: vi.fn(),
}));

import { useTodos } from '../../hooks/todos/useTodos';
import { useCategories } from '../../hooks/categories/useCategories';
import { useCreateTodo } from '../../hooks/todos/useCreateTodo';
import { useUpdateTodo } from '../../hooks/todos/useUpdateTodo';
import { useDeleteTodo } from '../../hooks/todos/useDeleteTodo';
import { useToggleTodoCompletion } from '../../hooks/todos/useToggleTodoCompletion';
import { TodoListPage } from '../../pages/TodoListPage';
import type { Todo } from '../../types/todo.types';
import type { Category } from '../../types/category.types';

const mockTodos: Todo[] = [
  {
    todoId: 1,
    userId: 1,
    categoryId: 1,
    title: '첫 번째 할일',
    description: null,
    dueDate: null,
    isCompleted: false,
    createdAt: '2026-05-13T09:30:00.000Z',
  },
  {
    todoId: 2,
    userId: 1,
    categoryId: 2,
    title: '두 번째 할일',
    description: '설명',
    dueDate: '2026-05-30',
    isCompleted: true,
    createdAt: '2026-05-13T10:00:00.000Z',
  },
];

const mockCategories: Category[] = [
  { categoryId: 1, name: '일반', isDefault: true },
  { categoryId: 2, name: '운동', isDefault: false },
];

const mockMutate = vi.fn();

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(MemoryRouter, null, children),
    );
}

function renderPage() {
  return render(createElement(TodoListPage), { wrapper: createWrapper() });
}

beforeEach(() => {
  vi.clearAllMocks();

  vi.mocked(useTodos).mockReturnValue({
    data: mockTodos,
    isLoading: false,
  } as ReturnType<typeof useTodos>);

  vi.mocked(useCategories).mockReturnValue({
    data: mockCategories,
    isLoading: false,
  } as ReturnType<typeof useCategories>);

  vi.mocked(useCreateTodo).mockReturnValue({
    mutate: mockMutate,
    isPending: false,
  } as unknown as ReturnType<typeof useCreateTodo>);

  vi.mocked(useUpdateTodo).mockReturnValue({
    mutate: mockMutate,
    isPending: false,
  } as unknown as ReturnType<typeof useUpdateTodo>);

  vi.mocked(useDeleteTodo).mockReturnValue({
    mutate: mockMutate,
  } as unknown as ReturnType<typeof useDeleteTodo>);

  vi.mocked(useToggleTodoCompletion).mockReturnValue({
    mutate: mockMutate,
  } as unknown as ReturnType<typeof useToggleTodoCompletion>);
});

describe('TodoListPage', () => {
  it('할일 목록을 렌더링한다', () => {
    renderPage();
    expect(screen.getByText('첫 번째 할일')).toBeInTheDocument();
    expect(screen.getByText('두 번째 할일')).toBeInTheDocument();
  });

  it('할일 목록이 비어있을 때 빈 상태 메시지를 표시한다', () => {
    vi.mocked(useTodos).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useTodos>);
    renderPage();
    expect(screen.getByText('아직 할일이 없습니다.')).toBeInTheDocument();
  });

  it('할일 추가 버튼 클릭 시 폼 모달이 표시된다', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: '+ 할일 추가' }));
    expect(screen.getByLabelText('제목')).toBeInTheDocument();
  });
});
