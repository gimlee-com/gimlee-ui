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
  if (params.role) qs.set('role', params.role);
  if (params.sort) qs.set('sort', params.sort);
  if (params.direction) qs.set('direction', params.direction);
  return qs.toString();
}

export const adminUserService = {
  listUsers: (params: AdminUserListFilterParams) =>
    apiClient.get<PageAdminUserListItemDto>(`/admin/users?${buildUserListQuery(params)}`),

  getUserDetail: async (userId: string) => {
    const res = await apiClient.get<StatusResponseDto & { data: AdminUserDetailDto }>(`/admin/users/${userId}`);
    return res.data;
  },

  banUser: (userId: string, dto: BanUserRequestDto) =>
    apiClient.post<StatusResponseDto>(`/admin/users/${userId}/ban`, dto),

  unbanUser: (userId: string) =>
    apiClient.post<StatusResponseDto>(`/admin/users/${userId}/unban`),

  getBanHistory: async (userId: string) => {
    const res = await apiClient.get<StatusResponseDto & { data: AdminBanDto[] }>(`/admin/users/${userId}/bans`);
    return res.data ?? [];
  },
};
