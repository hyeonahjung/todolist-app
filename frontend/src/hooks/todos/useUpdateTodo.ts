import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { updateTodo } from '../../api/todo.api';
import { useToastStore } from '../../stores/useToastStore';
import type { UpdateTodoRequest } from '../../types/todo.types';
import type { ApiError } from '../../types/common.types';

interface UpdateTodoParams {
  todoId: number;
  data: UpdateTodoRequest;
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ todoId, data }: UpdateTodoParams) => updateTodo(todoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      addToast('할일이 수정되었습니다.', 'success');
    },
    onError: (error: AxiosError<ApiError>) => {
      const message = error.response?.data?.error?.message ?? '할일 수정에 실패했습니다.';
      addToast(message, 'error');
    },
  });
}
