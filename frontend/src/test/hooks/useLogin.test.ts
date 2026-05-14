import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { createElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('../../api/auth.api', () => ({
  login: vi.fn(),
}));

vi.mock('../../stores/useAuthStore', () => ({
  useAuthStore: (selector: (s: typeof mockAuthState) => unknown) => selector(mockAuthState),
}));

vi.mock('../../stores/useToastStore', () => ({
  useToastStore: (selector: (s: typeof mockToastState) => unknown) => selector(mockToastState),
}));

import { login } from '../../api/auth.api';
import { useLogin } from '../../hooks/auth/useLogin';
import type { User } from '../../types/user.types';

const mockNavigate = vi.fn();
const mockSetAuth = vi.fn();
const mockAddToast = vi.fn();

const mockAuthState = {
  accessToken: null as string | null,
  refreshToken: null as string | null,
  user: null as User | null,
  setAuth: mockSetAuth,
  setAccessToken: vi.fn(),
  clearAuth: vi.fn(),
};

const mockToastState = {
  toasts: [] as { id: string; message: string; variant: 'success' | 'error' | 'warning' }[],
  addToast: mockAddToast,
  removeToast: vi.fn(),
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
});

describe('useLogin', () => {
  it('성공 시 setAuth를 호출하고 /로 이동한다', async () => {
    const mockUser: User = { userId: 1, email: 'test@example.com', name: '홍길동' };
    vi.mocked(login).mockResolvedValue({
      success: true,
      data: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: mockUser,
      },
    });

    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate({ email: 'test@example.com', password: 'password1' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockSetAuth).toHaveBeenCalledWith('access-token', 'refresh-token', mockUser);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('UNAUTHORIZED 에러 시 적절한 메시지로 toast를 표시한다', async () => {
    const axiosError = {
      response: {
        data: {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Unauthorized' },
        },
        status: 401,
      },
    };
    vi.mocked(login).mockRejectedValue(axiosError);

    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate({ email: 'test@example.com', password: 'wrongpass1' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockAddToast).toHaveBeenCalledWith(
      '이메일 또는 비밀번호가 올바르지 않습니다.',
      'error',
    );
    expect(mockSetAuth).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
