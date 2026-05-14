import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { deleteTodo } from '../../api/todo.api';
import { useToastStore } from '../../stores/useToastStore';
import type { ApiError } from '../../types/common.types';

export function useDeleteTodo() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: (todoId: number) => deleteTodo(todoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      addToast('할일이 삭제되었습니다.', 'success');
    },
    onError: (error: AxiosError<ApiError>) => {
      const message = error.response?.data?.error?.message ?? '할일 삭제에 실패했습니다.';
      addToast(message, 'error');
    },
  });
}
