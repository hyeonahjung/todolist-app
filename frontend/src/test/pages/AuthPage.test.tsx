import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('../../api/auth.api', () => ({
  login: vi.fn(),
  register: vi.fn(),
}));

vi.mock('../../stores/useAuthStore', () => ({
  useAuthStore: (selector: (s: typeof mockAuthState) => unknown) => selector(mockAuthState),
}));

vi.mock('../../stores/useToastStore', () => ({
  useToastStore: (selector: (s: typeof mockToastState) => unknown) => selector(mockToastState),
}));

import { AuthPage } from '../../pages/AuthPage';

const mockAuthState = {
  accessToken: null as string | null,
  refreshToken: null as string | null,
  user: null,
  setAuth: vi.fn(),
  setAccessToken: vi.fn(),
  clearAuth: vi.fn(),
};

const mockToastState = {
  toasts: [] as { id: string; message: string; variant: 'success' | 'error' | 'warning' }[],
  addToast: vi.fn(),
  removeToast: vi.fn(),
};

function renderWithProviders(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    createElement(QueryClientProvider, { client: queryClient }, ui),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AuthPage', () => {
  it('로그인 폼이 기본으로 렌더링된다', () => {
    renderWithProviders(createElement(AuthPage));
    expect(screen.getByLabelText('이메일')).toBeInTheDocument();
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
  });

  it('회원가입 탭 클릭 시 회원가입 폼으로 전환된다', async () => {
    renderWithProviders(createElement(AuthPage));
    const registerTabBtn = screen.getByRole('button', { name: '회원가입 탭' });
    await userEvent.click(registerTabBtn);
    expect(screen.getByLabelText('이름')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '가입하기' })).toBeInTheDocument();
  });

  it('이메일 형식이 올바르지 않을 때 오류 메시지를 표시한다', async () => {
    renderWithProviders(createElement(AuthPage));
    const emailInput = screen.getByLabelText('이메일');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    const submitBtn = screen.getByRole('button', { name: '로그인' });
    await userEvent.click(submitBtn);
    await waitFor(() => {
      expect(screen.getByText('올바른 이메일 형식이 아닙니다.')).toBeInTheDocument();
    });
  });

  it('비밀번호 규칙 미충족 시 오류 메시지를 표시한다', async () => {
    renderWithProviders(createElement(AuthPage));
    const emailInput = screen.getByLabelText('이메일');
    const passwordInput = screen.getByLabelText('비밀번호');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'short' } });
    const submitBtn = screen.getByRole('button', { name: '로그인' });
    await userEvent.click(submitBtn);
    await waitFor(() => {
      expect(
        screen.getByText('비밀번호는 8자 이상, 영문자와 숫자를 각 1자 이상 포함해야 합니다.'),
      ).toBeInTheDocument();
    });
  });
});
