import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { updateCategory } from '../../api/category.api';
import { useToastStore } from '../../stores/useToastStore';
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
      addToast('카테고리가 수정되었습니다.', 'success');
    },
    onError: (error: AxiosError<ApiError>) => {
      const code = error.response?.data?.error?.code;
      if (code === 'DUPLICATE_CATEGORY') {
        addToast('이미 존재하는 카테고리명입니다.', 'error');
      } else {
        const message = error.response?.data?.error?.message ?? '카테고리 수정에 실패했습니다.';
        addToast(message, 'error');
      }
    },
  });
}
