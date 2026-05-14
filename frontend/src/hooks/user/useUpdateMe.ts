import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { updateMe } from '../../api/user.api';
import { useAuthStore } from '../../stores/useAuthStore';
import { useToastStore } from '../../stores/useToastStore';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { translations } from '../../i18n/translations';
import type { UpdateUserRequest } from '../../types/user.types';
import type { ApiError } from '../../types/common.types';

interface UseUpdateMeOptions {
  onInvalidPassword?: () => void;
}

const SETTINGS_ONLY_KEYS = new Set(['theme', 'language']);

export function useUpdateMe(options?: UseUpdateMeOptions) {
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: (data: UpdateUserRequest) => updateMe(data),
    onSuccess: (response, variables) => {
      useAuthStore.setState((state) => ({ ...state, user: response.data }));
      const changedKeys = Object.keys(variables);
      const isSettingsOnly = changedKeys.every((k) => SETTINGS_ONLY_KEYS.has(k));
      if (!isSettingsOnly) {
        const t = translations[useLanguageStore.getState().language];
        addToast(t.profile.updateSuccess, 'success');
      }
    },
    onError: (error: AxiosError<ApiError>) => {
      const code = error.response?.data?.error?.code;
      if (code === 'INVALID_PASSWORD') {
        options?.onInvalidPassword?.();
      } else {
        const t = translations[useLanguageStore.getState().language];
        const message = error.response?.data?.error?.message ?? t.profile.updateFailed;
        addToast(message, 'error');
      }
    },
  });
}
