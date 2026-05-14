import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { updateMe } from '../../api/user.api';
import { useAuthStore } from '../../stores/useAuthStore';
import { useToastStore } from '../../stores/useToastStore';
import type { UpdateUserRequest } from '../../types/user.types';
import type { ApiError } from '../../types/common.types';

interface UseUpdateMeOptions {
  onInvalidPassword?: () => void;
}

export function useUpdateMe(options?: UseUpdateMeOptions) {
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: (data: UpdateUserRequest) => updateMe(data),
    onSuccess: (response, variables) => {
      useAuthStore.setState((state) => ({ ...state, user: response.data }));
      if (!('theme' in variables) || Object.keys(variables).length > 1) {
        addToast('수정이 완료되었습니다.', 'success');
      }
    },
    onError: (error: AxiosError<ApiError>) => {
      const code = error.response?.data?.error?.code;
      if (code === 'INVALID_PASSWORD') {
        options?.onInvalidPassword?.();
      } else {
        const message = error.response?.data?.error?.message ?? '수정에 실패했습니다.';
        addToast(message, 'error');
      }
    },
  });
}
