import { apiClient } from './client';
import type { CreateRecipe, Recipe, UpdateRecipe } from './types';

export interface GlobalRecipesParams {
  search?: string;
  categoryId?: string;
}

export async function getGlobalRecipes(params?: GlobalRecipesParams): Promise<Recipe[]> {
  const response = await apiClient.get<Recipe[]>('/api/recipes/global', { params });
  return response.data;
}

export async function getGlobalRecipeById(idOrSlug: string): Promise<Recipe> {
  const response = await apiClient.get<Recipe>(`/api/recipes/${encodeURIComponent(idOrSlug)}`);
  return response.data;
}

export async function getMyRecipes(): Promise<Recipe[]> {
  const response = await apiClient.get<Recipe[]>('/api/recipes/mine');
  return response.data;
}

export async function createRecipe(data: CreateRecipe): Promise<Recipe> {
  const response = await apiClient.post<Recipe>('/api/recipes', data);
  return response.data;
}

export async function updateRecipe(id: string, data: UpdateRecipe): Promise<Recipe> {
  const response = await apiClient.put<Recipe>(`/api/recipes/${id}`, data);
  return response.data;
}

export async function deleteRecipe(id: string): Promise<void> {
  await apiClient.delete(`/api/recipes/${id}`);
}

export async function getPendingApprovalRecipes(): Promise<Recipe[]> {
  const response = await apiClient.get<Recipe[]>('/api/recipes/pending-approval');
  return response.data;
}

export async function approveRecipe(id: string): Promise<void> {
  await apiClient.post(`/api/recipes/${id}/approve`);
}

export async function rejectRecipe(id: string): Promise<void> {
  await apiClient.post(`/api/recipes/${id}/reject`);
}
