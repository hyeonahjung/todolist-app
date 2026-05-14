import { apiClient } from './apiClient';
import type { ApiResponse } from '../types/common.types';
import type { Todo, CreateTodoRequest, UpdateTodoRequest, TodoFilter } from '../types/todo.types';

export async function getTodos(filter?: TodoFilter): Promise<ApiResponse<Todo[]>> {
  const res = await apiClient.get('/api/todos', { params: filter });
  return res.data;
}

export async function getTodoById(todoId: number): Promise<ApiResponse<Todo>> {
  const res = await apiClient.get(`/api/todos/${todoId}`);
  return res.data;
}

export async function createTodo(data: CreateTodoRequest): Promise<ApiResponse<Todo>> {
  const res = await apiClient.post('/api/todos', data);
  return res.data;
}

export async function updateTodo(todoId: number, data: UpdateTodoRequest): Promise<ApiResponse<Todo>> {
  const res = await apiClient.patch(`/api/todos/${todoId}`, data);
  return res.data;
}

export async function deleteTodo(todoId: number): Promise<void> {
  await apiClient.delete(`/api/todos/${todoId}`);
}

export async function toggleCompletion(todoId: number): Promise<ApiResponse<Todo>> {
  const res = await apiClient.patch(`/api/todos/${todoId}/completion`);
  return res.data;
}
