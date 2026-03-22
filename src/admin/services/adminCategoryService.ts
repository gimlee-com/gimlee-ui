import { apiClient } from '../../services/apiClient';
import type { StatusResponseDto } from '../../types/api';
import type {
  AdminCategoryTreeDto,
  AdminCategoryDetailDto,
  CreateAdminCategoryDto,
  UpdateAdminCategoryDto,
  ReorderAdminCategoryDto,
  MoveAdminCategoryDto,
} from '../types/admin';

export const adminCategoryService = {
  getRoots: (depth: number = 1) =>
    apiClient.get<AdminCategoryTreeDto[]>(`/admin/categories?depth=${depth}`),

  getDetail: (id: number) =>
    apiClient.get<StatusResponseDto & { data: AdminCategoryDetailDto }>(`/admin/categories/${id}`),

  getChildren: (id: number, depth: number = 1) =>
    apiClient.get<AdminCategoryTreeDto[]>(`/admin/categories/${id}/children?depth=${depth}`),

  search: (q: string, lang?: string, limit?: number) => {
    const params = new URLSearchParams({ q });
    if (lang) params.set('lang', lang);
    if (limit) params.set('limit', limit.toString());
    return apiClient.get<AdminCategoryTreeDto[]>(`/admin/categories/search?${params}`);
  },

  create: (dto: CreateAdminCategoryDto) =>
    apiClient.post<StatusResponseDto & { data: AdminCategoryDetailDto }>('/admin/categories', dto),

  update: (id: number, dto: UpdateAdminCategoryDto) =>
    apiClient.patch<StatusResponseDto & { data: AdminCategoryDetailDto }>(`/admin/categories/${id}`, dto),

  delete: (id: number) =>
    apiClient.delete<StatusResponseDto>(`/admin/categories/${id}`),

  reorder: (id: number, dto: ReorderAdminCategoryDto) =>
    apiClient.patch<StatusResponseDto>(`/admin/categories/${id}/reorder`, dto),

  move: (id: number, dto: MoveAdminCategoryDto) =>
    apiClient.patch<StatusResponseDto>(`/admin/categories/${id}/move`, dto),
};
