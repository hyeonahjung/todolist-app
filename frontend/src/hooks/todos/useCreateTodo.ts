import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { createTodo } from '../../api/todo.api';
import { useToastStore } from '../../stores/useToastStore';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { translations } from '../../i18n/translations';
import type { CreateTodoRequest } from '../../types/todo.types';
import type { ApiError } from '../../types/common.types';

export function useCreateTodo() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: (data: CreateTodoRequest) => createTodo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      const t = translations[useLanguageStore.getState().language];
      addToast(t.toast.todoAdded, 'success');
    },
    onError: (error: AxiosError<ApiError>) => {
      const t = translations[useLanguageStore.getState().language];
      const message = error.response?.data?.error?.message ?? t.toast.todoAddFailed;
      addToast(message, 'error');
    },
  });
}
