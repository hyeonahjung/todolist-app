import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { createTodo } from '../../api/todo.api';
import { useToastStore } from '../../stores/useToastStore';
import type { CreateTodoRequest } from '../../types/todo.types';
import type { ApiError } from '../../types/common.types';

export function useCreateTodo() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: (data: CreateTodoRequest) => createTodo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      addToast('할일이 추가되었습니다.', 'success');
    },
    onError: (error: AxiosError<ApiError>) => {
      const message = error.response?.data?.error?.message ?? '할일 추가에 실패했습니다.';
      addToast(message, 'error');
    },
  });
}
