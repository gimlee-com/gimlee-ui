import { apiClient } from '../../services/apiClient';
import type { StatusResponseDto } from '../../types/api';
import type {
  AdminUserListFilterParams,
  PageAdminUserListItemDto,
  AdminUserDetailDto,
  AdminBanDto,
  BanUserRequestDto,
} from '../types/adminUser';

function buildUserListQuery(params: AdminUserListFilterParams): string {
  const qs = new URLSearchParams();
  qs.set('page', params.page.toString());
  qs.set('size', params.size.toString());
  if (params.search) qs.set('search', params.search);
  if (params.status) qs.set('status', params.status);
  if (params.sort) qs.set('sort', params.sort);
  if (params.direction) qs.set('direction', params.direction);
  return qs.toString();
}

export const adminUserService = {
  listUsers: (params: AdminUserListFilterParams) =>
    apiClient.get<PageAdminUserListItemDto>(`/admin/users?${buildUserListQuery(params)}`),

  getUserDetail: (userId: string) =>
    apiClient.get<AdminUserDetailDto>(`/admin/users/${userId}`),

  banUser: (userId: string, dto: BanUserRequestDto) =>
    apiClient.post<StatusResponseDto>(`/admin/users/${userId}/ban`, dto),

  unbanUser: (userId: string) =>
    apiClient.post<StatusResponseDto>(`/admin/users/${userId}/unban`),

  getBanHistory: (userId: string) =>
    apiClient.get<AdminBanDto[]>(`/admin/users/${userId}/bans`),
};
