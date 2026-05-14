import { apiClient } from './apiClient';
import type { ApiResponse } from '../types/common.types';
import type { User, UpdateUserRequest, DeleteUserRequest } from '../types/user.types';

export async function getMe(): Promise<ApiResponse<User>> {
  const res = await apiClient.get('/api/users/me');
  return res.data;
}

export async function updateMe(data: UpdateUserRequest): Promise<ApiResponse<User>> {
  const res = await apiClient.patch('/api/users/me', data);
  return res.data;
}

export async function deleteMe(data: DeleteUserRequest): Promise<void> {
  await apiClient.delete('/api/users/me', { data });
}
