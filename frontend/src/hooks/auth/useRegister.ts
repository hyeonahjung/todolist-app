import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { register } from '../../api/auth.api';
import { useToastStore } from '../../stores/useToastStore';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { translations } from '../../i18n/translations';
import type { ApiError } from '../../types/common.types';

interface RegisterFormData {
  email: string;
  password: string;
  name: string;
}

export function useRegister() {
  const navigate = useNavigate();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: (data: RegisterFormData) => register(data),
    onSuccess: () => {
      const t = translations[useLanguageStore.getState().language];
      addToast(t.toast.registerSuccess, 'success');
      navigate('/auth');
    },
    onError: (error: AxiosError<ApiError>) => {
      const t = translations[useLanguageStore.getState().language];
      const message = error.response?.data?.error?.message ?? t.toast.registerFailed;
      addToast(message, 'error');
    },
  });
}
