import { apiClient } from './client';
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from './types';

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/api/auth/login', data);
  return response.data;
}

export async function exchangeGoogleCode(code: string): Promise<LoginResponse> {
  const response = await apiClient.get<LoginResponse>('/api/auth/exchange', {
    params: { code },
  });
  return response.data;
}

export async function loginWithGoogle(idToken: string): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/api/auth/external/google', { idToken });
  return response.data;
}

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  const response = await apiClient.post<RegisterResponse>('/api/auth/register', data);
  return response.data;
}

export async function confirmEmail(userId: string, token: string): Promise<void> {
  await apiClient.get('/api/auth/verify-email', {
    params: { userId, token },
  });
}

export async function resendConfirmation(email: string): Promise<void> {
  await apiClient.post('/api/auth/resend-verification', { email });
}

export async function forgotPassword(email: string): Promise<void> {
  await apiClient.post('/api/auth/forgot-password', { email });
}

export async function resetPassword(
  userId: string,
  token: string,
  newPassword: string,
): Promise<void> {
  await apiClient.post('/api/auth/reset-password', { userId, token, newPassword });
}

export async function getCurrentUser(): Promise<{
  userId: string;
  roles: string[];
  displayName: string;
  hasPassword: boolean;
}> {
  const response = await apiClient.get<{
    userId: string;
    roles: string[];
    displayName: string;
    hasPassword: boolean;
  }>('/api/auth/me');
  return response.data;
}
