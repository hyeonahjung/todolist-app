import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { toggleCompletion } from '../../api/todo.api';
import type { ApiError } from '../../types/common.types';
import type { Todo } from '../../types/todo.types';

export function useToggleTodoCompletion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (todoId: number) => toggleCompletion(todoId),
    onMutate: async (todoId: number) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });

      const previousTodosEntries = queryClient.getQueriesData<Todo[]>({ queryKey: ['todos'] });
      const previousTodo = queryClient.getQueryData<Todo>(['todos', todoId]);

      queryClient.setQueriesData<Todo[]>({ queryKey: ['todos'] }, (old) => {
        if (!old) return old;
        return old.map((t) =>
          t.todoId === todoId ? { ...t, isCompleted: !t.isCompleted } : t
        );
      });

      if (previousTodo) {
        queryClient.setQueryData<Todo>(['todos', todoId], {
          ...previousTodo,
          isCompleted: !previousTodo.isCompleted,
        });
      }

      return { previousTodosEntries, previousTodo };
    },
    onError: (_error: AxiosError<ApiError>, todoId: number, context) => {
      if (context?.previousTodosEntries) {
        context.previousTodosEntries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousTodo) {
        queryClient.setQueryData(['todos', todoId], context.previousTodo);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}
