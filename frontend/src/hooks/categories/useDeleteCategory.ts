import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { deleteCategory } from '../../api/category.api';
import { useToastStore } from '../../stores/useToastStore';
import type { ApiError } from '../../types/common.types';

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: (categoryId: number) => deleteCategory(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      addToast('카테고리가 삭제되었습니다.', 'success');
    },
    onError: (error: AxiosError<ApiError>) => {
      const message = error.response?.data?.error?.message ?? '카테고리 삭제에 실패했습니다.';
      addToast(message, 'error');
    },
  });
}
