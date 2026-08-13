import { apiClient } from './client';
import type {
  AdminFamily,
  AdminUser,
  BulkImportRecipeItem,
  BulkImportRecipesResult,
  Category,
  CreateRecipe,
  Recipe,
  UpdateRecipe,
} from './types';

export async function getAdminFamilies(): Promise<AdminFamily[]> {
  const response = await apiClient.get<AdminFamily[]>('/api/admin/families');
  return response.data;
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const response = await apiClient.get<AdminUser[]>('/api/admin/users');
  return response.data;
}

export async function lockUser(userId: string): Promise<void> {
  await apiClient.post(`/api/admin/users/${userId}/lock`);
}

export async function unlockUser(userId: string): Promise<void> {
  await apiClient.post(`/api/admin/users/${userId}/unlock`);
}

export async function createGlobalRecipe(data: CreateRecipe): Promise<Recipe> {
  const response = await apiClient.post<Recipe>('/api/admin/recipes', data);
  return response.data;
}

export async function bulkImportGlobalRecipes(
  items: BulkImportRecipeItem[],
): Promise<BulkImportRecipesResult> {
  const response = await apiClient.post<BulkImportRecipesResult>(
    '/api/admin/recipes/bulk-import',
    items,
  );
  return response.data;
}

export async function updateGlobalRecipe(id: string, data: UpdateRecipe): Promise<Recipe> {
  const response = await apiClient.put<Recipe>(`/api/admin/recipes/${id}`, data);
  return response.data;
}

export async function deleteGlobalRecipe(id: string): Promise<void> {
  await apiClient.delete(`/api/admin/recipes/${id}`);
}

export async function updateCategory(id: string, name: string): Promise<Category> {
  const response = await apiClient.put<Category>(`/api/admin/categories/${id}`, { name });
  return response.data;
}

export async function deleteCategory(id: string): Promise<void> {
  await apiClient.delete(`/api/admin/categories/${id}`);
}
