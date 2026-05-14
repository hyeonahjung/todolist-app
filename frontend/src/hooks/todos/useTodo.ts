import { useQuery } from '@tanstack/react-query';
import { getTodoById } from '../../api/todo.api';
import { useAuthStore } from '../../stores/useAuthStore';

export function useTodo(todoId: number) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['todos', todoId],
    queryFn: async () => {
      const res = await getTodoById(todoId);
      return res.data;
    },
    enabled: !!accessToken && !!todoId,
  });
}
