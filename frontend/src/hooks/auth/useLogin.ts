import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { login } from '../../api/auth.api';
import { useAuthStore } from '../../stores/useAuthStore';
import { useToastStore } from '../../stores/useToastStore';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { translations } from '../../i18n/translations';
import type { ApiError } from '../../types/common.types';

interface LoginFormData {
  email: string;
  password: string;
}

export function useLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: (data: LoginFormData) => login(data),
    onSuccess: (response) => {
      const { accessToken, refreshToken, user } = response.data;
      setAuth(accessToken, refreshToken, user);
      navigate('/');
    },
    onError: (error: AxiosError<ApiError>) => {
      const t = translations[useLanguageStore.getState().language];
      const code = error.response?.data?.error?.code;
      if (code === 'UNAUTHORIZED') {
        addToast(t.toast.loginError, 'error');
      } else {
        const message = error.response?.data?.error?.message ?? t.toast.loginFailed;
        addToast(message, 'error');
      }
    },
  });
}
