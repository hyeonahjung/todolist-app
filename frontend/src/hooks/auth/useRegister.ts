import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { register } from '../../api/auth.api';
import { useToastStore } from '../../stores/useToastStore';
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
      addToast('회원가입이 완료되었습니다.', 'success');
      navigate('/auth');
    },
    onError: (error: AxiosError<ApiError>) => {
      const message =
        error.response?.data?.error?.message ?? '회원가입에 실패했습니다.';
      addToast(message, 'error');
    },
  });
}
