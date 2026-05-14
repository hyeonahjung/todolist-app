import { apiClient } from './apiClient';
import type { ApiResponse } from '../types/common.types';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../types/category.types';

export async function getCategories(): Promise<ApiResponse<Category[]>> {
  const res = await apiClient.get('/api/categories');
  return res.data;
}

export async function createCategory(data: CreateCategoryRequest): Promise<ApiResponse<Category>> {
  const res = await apiClient.post('/api/categories', data);
  return res.data;
}

export async function updateCategory(categoryId: number, data: UpdateCategoryRequest): Promise<ApiResponse<Category>> {
  const res = await apiClient.patch(`/api/categories/${categoryId}`, data);
  return res.data;
}

export async function deleteCategory(categoryId: number): Promise<void> {
  await apiClient.delete(`/api/categories/${categoryId}`);
}
