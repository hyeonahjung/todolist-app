import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { deleteTodo } from '../../api/todo.api';
import { useToastStore } from '../../stores/useToastStore';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { translations } from '../../i18n/translations';
import type { ApiError } from '../../types/common.types';

export function useDeleteTodo() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: (todoId: number) => deleteTodo(todoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      const t = translations[useLanguageStore.getState().language];
      addToast(t.toast.todoDeleted, 'success');
    },
    onError: (error: AxiosError<ApiError>) => {
      const t = translations[useLanguageStore.getState().language];
      const message = error.response?.data?.error?.message ?? t.toast.todoDeleteFailed;
      addToast(message, 'error');
    },
  });
}
