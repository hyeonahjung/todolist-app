import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { deleteMe } from '../../api/user.api';
import { useAuthStore } from '../../stores/useAuthStore';
import { useToastStore } from '../../stores/useToastStore';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { translations } from '../../i18n/translations';
import type { DeleteUserRequest } from '../../types/user.types';
import type { ApiError } from '../../types/common.types';

export function useDeleteMe() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: (data: DeleteUserRequest) => deleteMe(data),
    onSuccess: () => {
      clearAuth();
      navigate('/auth');
    },
    onError: (error: AxiosError<ApiError>) => {
      const t = translations[useLanguageStore.getState().language];
      const code = error.response?.data?.error?.code;
      if (code === 'INVALID_PASSWORD') {
        addToast(t.toast.deleteAccountPasswordError, 'error');
      } else {
        const message = error.response?.data?.error?.message ?? t.toast.deleteAccountError;
        addToast(message, 'error');
      }
    },
  });
}
