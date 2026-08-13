import { apiClient } from './client';

export interface PageContent {
  slug: string;
  title: string;
  contentHtml: string;
  updatedAt: string;
}

export interface UpdatePageContentRequest {
  title: string;
  contentHtml: string;
}

export async function getPageContent(slug: string): Promise<PageContent> {
  const response = await apiClient.get<PageContent>(`/api/page-content/${slug}`);
  return response.data;
}

export async function getAdminPageContents(): Promise<PageContent[]> {
  const response = await apiClient.get<PageContent[]>('/api/admin/page-content');
  return response.data;
}

export async function updatePageContent(
  slug: string,
  data: UpdatePageContentRequest,
): Promise<PageContent> {
  const response = await apiClient.put<PageContent>(`/api/admin/page-content/${slug}`, data);
  return response.data;
}
