import { apiClient } from './client';
import type { Category } from './types';

export async function getCategories(): Promise<Category[]> {
  const response = await apiClient.get<Category[]>('/api/categories');
  return response.data;
}

export async function createCategory(name: string): Promise<Category> {
  const response = await apiClient.post<Category>('/api/categories', { name });
  return response.data;
}
