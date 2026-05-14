import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock('../../hooks/user/useMe', () => ({
  useMe: vi.fn(),
}));

vi.mock('../../hooks/user/useUpdateMe', () => ({
  useUpdateMe: vi.fn(),
}));

vi.mock('../../hooks/user/useDeleteMe', () => ({
  useDeleteMe: vi.fn(),
}));

import { useMe } from '../../hooks/user/useMe';
import { useUpdateMe } from '../../hooks/user/useUpdateMe';
import { useDeleteMe } from '../../hooks/user/useDeleteMe';
import { ProfilePage } from '../../pages/ProfilePage';
import type { User } from '../../types/user.types';

const mockUser: User = {
  userId: 1,
  email: 'hyeona@example.com',
  name: '홍길동',
};

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
  return render(createElement(ProfilePage), { wrapper: createWrapper() });
}

beforeEach(() => {
  vi.clearAllMocks();

  vi.mocked(useMe).mockReturnValue({
    data: mockUser,
    isLoading: false,
  } as ReturnType<typeof useMe>);

  vi.mocked(useUpdateMe).mockReturnValue({
    mutate: mockMutate,
    isPending: false,
  } as unknown as ReturnType<typeof useUpdateMe>);

  vi.mocked(useDeleteMe).mockReturnValue({
    mutate: mockMutate,
    isPending: false,
  } as unknown as ReturnType<typeof useDeleteMe>);
});

describe('ProfilePage', () => {
  it('이름 수정 폼이 렌더링된다', () => {
    renderPage();
    expect(screen.getByLabelText(/이름/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '저장하기' })).toBeInTheDocument();
  });

  it('이메일 필드가 읽기 전용으로 렌더링된다', () => {
    renderPage();
    const emailInput = screen.getByLabelText(/이메일/);
    expect(emailInput).toHaveAttribute('readonly');
    expect(emailInput).toHaveValue('hyeona@example.com');
  });

  it('이름이 빈 값일 때 저장 시 에러를 표시한다', async () => {
    renderPage();
    const nameInput = screen.getByLabelText(/이름/);
    fireEvent.change(nameInput, { target: { value: '' } });
    const saveBtn = screen.getByRole('button', { name: '저장하기' });
    await userEvent.click(saveBtn);
    await waitFor(() => {
      expect(screen.getByText('이름을 입력해주세요.')).toBeInTheDocument();
    });
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('현재 비밀번호 없이 새 비밀번호만 입력하면 에러를 표시한다', async () => {
    renderPage();
    const newPwInput = screen.getByLabelText('새 비밀번호');
    fireEvent.change(newPwInput, { target: { value: 'newpass1' } });
    const saveBtn = screen.getByRole('button', { name: '저장하기' });
    await userEvent.click(saveBtn);
    await waitFor(() => {
      expect(screen.getByText('현재 비밀번호를 입력해주세요.')).toBeInTheDocument();
    });
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('회원 탈퇴 버튼 클릭 시 다이얼로그가 표시된다', async () => {
    renderPage();
    const deleteBtn = screen.getByRole('button', { name: '회원 탈퇴' });
    await userEvent.click(deleteBtn);
    await waitFor(() => {
      expect(screen.getByText(/탈퇴 시 내 계정/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '탈퇴 확인' })).toBeInTheDocument();
    });
  });
});
