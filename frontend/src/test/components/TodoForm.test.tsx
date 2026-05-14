import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement } from 'react';
import { TodoForm } from '../../components/todo/TodoForm';
import type { Todo } from '../../types/todo.types';
import type { Category } from '../../types/category.types';

const categories: Category[] = [
  { categoryId: 1, name: '일반', isDefault: true },
  { categoryId: 2, name: '운동', isDefault: false },
];

const baseTodo: Todo = {
  todoId: 1,
  userId: 1,
  categoryId: 2,
  title: '헬스장 PT 등록하기',
  description: '상세 설명',
  dueDate: null,
  isCompleted: false,
  createdAt: '2026-05-13T09:30:00.000Z',
};

function renderForm(props: Partial<Parameters<typeof TodoForm>[0]> = {}) {
  const defaultProps = {
    categories,
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
    isLoading: false,
    ...props,
  };
  return render(createElement(TodoForm, defaultProps));
}

describe('TodoForm', () => {
  it('제목 미입력 시 에러를 표시한다', async () => {
    renderForm();
    await userEvent.click(screen.getByRole('button', { name: '등록하기' }));
    await waitFor(() => {
      expect(screen.getByText('제목을 입력해 주세요.')).toBeInTheDocument();
    });
  });

  it('카테고리 미선택 시 에러를 표시한다', async () => {
    renderForm();
    fireEvent.change(screen.getByLabelText('제목'), { target: { value: '테스트 제목' } });
    await userEvent.click(screen.getByRole('button', { name: '등록하기' }));
    await waitFor(() => {
      expect(screen.getByText('카테고리를 선택해 주세요.')).toBeInTheDocument();
    });
  });

  it('100자 초과 제목 입력 시 에러를 표시한다', async () => {
    renderForm();
    fireEvent.change(screen.getByLabelText('제목'), { target: { value: 'a'.repeat(101) } });
    await userEvent.click(screen.getByRole('button', { name: '등록하기' }));
    await waitFor(() => {
      expect(screen.getByText('제목은 100자 이하여야 합니다.')).toBeInTheDocument();
    });
  });

  it('과거 날짜 입력 시 에러를 표시한다', async () => {
    renderForm();
    fireEvent.change(screen.getByLabelText('종료예정일'), { target: { value: '2020-01-01' } });
    await userEvent.click(screen.getByRole('button', { name: '등록하기' }));
    await waitFor(() => {
      expect(screen.getByText('종료예정일은 오늘 이후 날짜여야 합니다.')).toBeInTheDocument();
    });
  });

  it('수정 모드 시 기존 데이터가 초기값으로 표시된다', () => {
    renderForm({ initialData: baseTodo });
    expect(screen.getByLabelText('제목')).toHaveValue('헬스장 PT 등록하기');
    expect(screen.getByLabelText('설명')).toHaveValue('상세 설명');
    expect(screen.getByRole('button', { name: '저장하기' })).toBeInTheDocument();
  });

  it('유효한 데이터 제출 시 onSubmit을 호출한다', async () => {
    const onSubmit = vi.fn();
    renderForm({ onSubmit });
    fireEvent.change(screen.getByLabelText('제목'), { target: { value: '새 할일' } });
    fireEvent.change(screen.getByLabelText('카테고리'), { target: { value: '1' } });
    await userEvent.click(screen.getByRole('button', { name: '등록하기' }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });
});
