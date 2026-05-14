import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { updateCategory } from '../../api/category.api';
import { useToastStore } from '../../stores/useToastStore';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { translations } from '../../i18n/translations';
import type { UpdateCategoryRequest } from '../../types/category.types';
import type { ApiError } from '../../types/common.types';

interface UpdateCategoryVariables {
  categoryId: number;
  data: UpdateCategoryRequest;
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ categoryId, data }: UpdateCategoryVariables) => updateCategory(categoryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      const t = translations[useLanguageStore.getState().language];
      addToast(t.toast.categoryUpdated, 'success');
    },
    onError: (error: AxiosError<ApiError>) => {
      const t = translations[useLanguageStore.getState().language];
      const code = error.response?.data?.error?.code;
      if (code === 'DUPLICATE_CATEGORY') {
        addToast(t.toast.categoryDuplicate, 'error');
      } else {
        const message = error.response?.data?.error?.message ?? t.toast.categoryUpdateFailed;
        addToast(message, 'error');
      }
    },
  });
}
