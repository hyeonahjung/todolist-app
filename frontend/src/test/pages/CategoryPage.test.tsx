import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../../hooks/categories/useCategories', () => ({
  useCategories: vi.fn(),
}));

vi.mock('../../hooks/categories/useCreateCategory', () => ({
  useCreateCategory: vi.fn(),
}));

vi.mock('../../hooks/categories/useUpdateCategory', () => ({
  useUpdateCategory: vi.fn(),
}));

vi.mock('../../hooks/categories/useDeleteCategory', () => ({
  useDeleteCategory: vi.fn(),
}));

import { useCategories } from '../../hooks/categories/useCategories';
import { useCreateCategory } from '../../hooks/categories/useCreateCategory';
import { useUpdateCategory } from '../../hooks/categories/useUpdateCategory';
import { useDeleteCategory } from '../../hooks/categories/useDeleteCategory';
import { CategoryPage } from '../../pages/CategoryPage';
import type { Category } from '../../types/category.types';

const mockCategories: Category[] = [
  { categoryId: 1, name: '일반', isDefault: true },
  { categoryId: 2, name: '업무', isDefault: true },
  { categoryId: 3, name: '개인', isDefault: true },
  { categoryId: 4, name: '운동', isDefault: false },
  { categoryId: 5, name: '독서', isDefault: false },
];

const mockMutate = vi.fn();

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

function renderPage() {
  return render(
    createElement(CategoryPage),
    { wrapper: createWrapper() },
  );
}

beforeEach(() => {
  vi.clearAllMocks();

  vi.mocked(useCategories).mockReturnValue({
    data: mockCategories,
    isLoading: false,
  } as ReturnType<typeof useCategories>);

  vi.mocked(useCreateCategory).mockReturnValue({
    mutate: mockMutate,
    isPending: false,
  } as unknown as ReturnType<typeof useCreateCategory>);

  vi.mocked(useUpdateCategory).mockReturnValue({
    mutate: mockMutate,
    isPending: false,
  } as unknown as ReturnType<typeof useUpdateCategory>);

  vi.mocked(useDeleteCategory).mockReturnValue({
    mutate: mockMutate,
  } as unknown as ReturnType<typeof useDeleteCategory>);
});

describe('CategoryPage', () => {
  it('기본 카테고리와 사용자 정의 카테고리를 구분하여 렌더링한다', () => {
    renderPage();

    expect(screen.getByText('기본 카테고리')).toBeInTheDocument();
    expect(screen.getByText('사용자 정의 카테고리')).toBeInTheDocument();

    expect(screen.getByText('일반')).toBeInTheDocument();
    expect(screen.getByText('업무')).toBeInTheDocument();
    expect(screen.getByText('개인')).toBeInTheDocument();
    expect(screen.getByText('운동')).toBeInTheDocument();
    expect(screen.getByText('독서')).toBeInTheDocument();
  });

  it('기본 카테고리에 수정/삭제 버튼이 없다', () => {
    renderPage();

    const editButtons = screen.getAllByRole('button', { name: /수정/ });
    const deleteButtons = screen.getAllByRole('button', { name: /삭제/ });

    expect(editButtons).toHaveLength(2);
    expect(deleteButtons).toHaveLength(2);
  });

  it('[+ 카테고리 추가] 버튼 클릭 시 인라인 폼이 표시된다', async () => {
    renderPage();

    const addBtn = screen.getByRole('button', { name: '+ 카테고리 추가' });
    await userEvent.click(addBtn);

    expect(screen.getByRole('textbox', { name: '카테고리명' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
  });

  it('[취소] 버튼 클릭 시 인라인 폼이 닫힌다', async () => {
    renderPage();

    await userEvent.click(screen.getByRole('button', { name: '+ 카테고리 추가' }));
    expect(screen.getByRole('textbox', { name: '카테고리명' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(screen.queryByRole('textbox', { name: '카테고리명' })).not.toBeInTheDocument();
  });

  it('30자 초과 카테고리명 입력 시 에러 메시지를 표시한다', async () => {
    renderPage();

    await userEvent.click(screen.getByRole('button', { name: '+ 카테고리 추가' }));

    const input = screen.getByRole('textbox', { name: '카테고리명' });
    fireEvent.change(input, { target: { value: 'a'.repeat(31) } });

    await waitFor(() => {
      expect(screen.getByText('카테고리명은 30자 이하여야 합니다.')).toBeInTheDocument();
    });
  });

  it('빈 이름으로 저장 시 에러 메시지를 표시한다', async () => {
    renderPage();

    await userEvent.click(screen.getByRole('button', { name: '+ 카테고리 추가' }));
    await userEvent.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => {
      expect(screen.getByText('카테고리명을 입력해 주세요.')).toBeInTheDocument();
    });
  });
});
