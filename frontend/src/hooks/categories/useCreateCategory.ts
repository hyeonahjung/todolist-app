import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { createCategory } from '../../api/category.api';
import { useToastStore } from '../../stores/useToastStore';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { translations } from '../../i18n/translations';
import type { CreateCategoryRequest } from '../../types/category.types';
import type { ApiError } from '../../types/common.types';

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: (data: CreateCategoryRequest) => createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      const t = translations[useLanguageStore.getState().language];
      addToast(t.toast.categoryAdded, 'success');
    },
    onError: (error: AxiosError<ApiError>) => {
      const t = translations[useLanguageStore.getState().language];
      const code = error.response?.data?.error?.code;
      if (code === 'DUPLICATE_CATEGORY') {
        addToast(t.toast.categoryDuplicate, 'error');
      } else {
        const message = error.response?.data?.error?.message ?? t.toast.categoryAddFailed;
        addToast(message, 'error');
      }
    },
  });
}
