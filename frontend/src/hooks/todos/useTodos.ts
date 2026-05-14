import { useQuery } from '@tanstack/react-query';
import { getTodos } from '../../api/todo.api';
import { useAuthStore } from '../../stores/useAuthStore';
import type { TodoFilter } from '../../types/todo.types';

export function useTodos(filter?: TodoFilter) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['todos', filter],
    queryFn: async () => {
      const res = await getTodos(filter);
      return res.data;
    },
    enabled: !!accessToken,
  });
}
