import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { deleteCategory } from '../../api/category.api';
import { useToastStore } from '../../stores/useToastStore';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { translations } from '../../i18n/translations';
import type { ApiError } from '../../types/common.types';

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: (categoryId: number) => deleteCategory(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      const t = translations[useLanguageStore.getState().language];
      addToast(t.toast.categoryDeleted, 'success');
    },
    onError: (error: AxiosError<ApiError>) => {
      const t = translations[useLanguageStore.getState().language];
      const message = error.response?.data?.error?.message ?? t.toast.categoryDeleteFailed;
      addToast(message, 'error');
    },
  });
}
