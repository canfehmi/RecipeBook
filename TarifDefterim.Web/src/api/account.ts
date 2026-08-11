import { apiClient } from './client';
import { getCurrentUser } from './auth';

export async function getAccount() {
  return getCurrentUser();
}

export async function updateDisplayName(displayName: string): Promise<{ displayName: string }> {
  const response = await apiClient.put<{ displayName: string }>('/api/account/display-name', {
    displayName,
  });
  return response.data;
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  await apiClient.post('/api/account/change-password', {
    currentPassword,
    newPassword,
  });
}
