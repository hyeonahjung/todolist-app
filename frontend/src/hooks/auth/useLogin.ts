import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { login } from '../../api/auth.api';
import { useAuthStore } from '../../stores/useAuthStore';
import { useToastStore } from '../../stores/useToastStore';
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
      const code = error.response?.data?.error?.code;
      if (code === 'UNAUTHORIZED') {
        addToast('이메일 또는 비밀번호가 올바르지 않습니다.', 'error');
      } else {
        const message =
          error.response?.data?.error?.message ?? '로그인에 실패했습니다.';
        addToast(message, 'error');
      }
    },
  });
}
