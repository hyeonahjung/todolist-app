import { useQuery } from '@tanstack/react-query';
import { getCategories } from '../../api/category.api';
import { useAuthStore } from '../../stores/useAuthStore';

export function useCategories() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await getCategories();
      return res.data;
    },
    enabled: !!accessToken,
  });
}
