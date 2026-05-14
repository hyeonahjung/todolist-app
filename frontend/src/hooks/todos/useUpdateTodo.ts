import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { updateTodo } from '../../api/todo.api';
import { useToastStore } from '../../stores/useToastStore';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { translations } from '../../i18n/translations';
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
      const t = translations[useLanguageStore.getState().language];
      addToast(t.toast.todoUpdated, 'success');
    },
    onError: (error: AxiosError<ApiError>) => {
      const t = translations[useLanguageStore.getState().language];
      const message = error.response?.data?.error?.message ?? t.toast.todoUpdateFailed;
      addToast(message, 'error');
    },
  });
}
