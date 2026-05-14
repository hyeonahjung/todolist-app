import { apiClient } from './apiClient';
import type { ApiResponse } from '../types/common.types';
import type { User } from '../types/user.types';

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterData {
  userId: number;
  email: string;
  name: string;
}

interface LoginData {
  accessToken: string;
  refreshToken: string;
  user: User;
}

interface RefreshData {
  accessToken: string;
}

export async function register(data: RegisterRequest): Promise<ApiResponse<RegisterData>> {
  const res = await apiClient.post('/api/auth/register', data);
  return res.data;
}

export async function login(data: LoginRequest): Promise<ApiResponse<LoginData>> {
  const res = await apiClient.post('/api/auth/login', data);
  return res.data;
}

export async function logout(): Promise<ApiResponse<null>> {
  const res = await apiClient.post('/api/auth/logout');
  return res.data;
}

export async function refreshToken(token: string): Promise<ApiResponse<RefreshData>> {
  const res = await apiClient.post('/api/auth/refresh', null, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}
