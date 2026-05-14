import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../../api/category.api', () => ({
  getCategories: vi.fn(),
}));

vi.mock('../../stores/useAuthStore', () => ({
  useAuthStore: (selector: (s: typeof mockAuthState) => unknown) => selector(mockAuthState),
}));

import { getCategories } from '../../api/category.api';
import { useCategories } from '../../hooks/categories/useCategories';
import type { Category } from '../../types/category.types';

const mockAuthState = {
  accessToken: null as string | null,
  refreshToken: null as string | null,
  user: null,
  setAuth: vi.fn(),
  setAccessToken: vi.fn(),
  clearAuth: vi.fn(),
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

beforeEach(() => {
  vi.clearAllMocks();
  mockAuthState.accessToken = null;
});

const mockCategories: Category[] = [
  { categoryId: 1, name: '일반', isDefault: true },
  { categoryId: 2, name: '운동', isDefault: false },
];

describe('useCategories', () => {
  it('accessToken이 없을 때 쿼리를 실행하지 않는다', async () => {
    mockAuthState.accessToken = null;

    const { result } = renderHook(() => useCategories(), { wrapper: createWrapper() });

    expect(result.current.fetchStatus).toBe('idle');
    expect(getCategories).not.toHaveBeenCalled();
  });

  it('accessToken이 있을 때 카테고리 목록을 반환한다', async () => {
    mockAuthState.accessToken = 'valid-token';
    vi.mocked(getCategories).mockResolvedValue({ success: true, data: mockCategories });

    const { result } = renderHook(() => useCategories(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockCategories);
    expect(getCategories).toHaveBeenCalledTimes(1);
  });

  it('성공 후 캐시에 categories 키로 데이터가 저장된다', async () => {
    mockAuthState.accessToken = 'valid-token';
    vi.mocked(getCategories).mockResolvedValue({ success: true, data: mockCategories });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children);

    const { result } = renderHook(() => useCategories(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const cached = queryClient.getQueryData<Category[]>(['categories']);
    expect(cached).toEqual(mockCategories);
  });
});
