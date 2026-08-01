import { apiClient } from './client';
import type {
  ApproveJoinRequestResult,
  Family,
  FamilyJoinRequest,
  FamilyMember,
  JoinFamilyRequest,
} from './types';

export async function getMyFamily(): Promise<Family> {
  const response = await apiClient.get<Family>('/api/families/me');
  return response.data;
}

export async function getFamilyMembers(): Promise<FamilyMember[]> {
  const response = await apiClient.get<FamilyMember[]>('/api/families/members');
  return response.data;
}

export async function joinFamily(data: JoinFamilyRequest): Promise<FamilyJoinRequest> {
  const response = await apiClient.post<FamilyJoinRequest>('/api/families/join', data);
  return response.data;
}

export async function getJoinRequests(): Promise<FamilyJoinRequest[]> {
  const response = await apiClient.get<FamilyJoinRequest[]>('/api/families/join-requests');
  return response.data;
}

export async function approveJoinRequest(requestId: string): Promise<ApproveJoinRequestResult> {
  const response = await apiClient.post<ApproveJoinRequestResult>(
    `/api/families/join-requests/${requestId}/approve`,
  );
  return response.data;
}

export async function rejectJoinRequest(requestId: string): Promise<void> {
  await apiClient.post(`/api/families/join-requests/${requestId}/reject`);
}

export async function promoteToHead(familyId: string, targetUserId: string): Promise<void> {
  await apiClient.post(`/api/families/${familyId}/members/${targetUserId}/promote-head`);
}

export async function demoteToMember(familyId: string, targetUserId: string): Promise<void> {
  await apiClient.post(`/api/families/${familyId}/members/${targetUserId}/demote-member`);
}

export async function removeMember(familyId: string, targetUserId: string): Promise<void> {
  await apiClient.delete(`/api/families/${familyId}/members/${targetUserId}`);
}

export async function leaveFamily(): Promise<void> {
  await apiClient.post('/api/families/leave');
}
