import { useQuery } from '@tanstack/react-query';
import { getMe } from '../../api/user.api';
import { useAuthStore } from '../../stores/useAuthStore';

export function useMe() {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: ['me'],
    queryFn: () => getMe().then((res) => res.data),
    enabled: !!accessToken,
  });
}
