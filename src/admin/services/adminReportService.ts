import { apiClient } from '../../services/apiClient';
import type { StatusResponseDto } from '../../types/api';
import type {
  ReportListFilterParams,
  ReportSiblingFilterParams,
  PageReportListItemDto,
  ReportDetailDto,
  AssignReportDto,
  ResolveReportDto,
  AddReportNoteDto,
  ReportStatsDto,
  ReportStatus,
} from '../types/adminReport';

function buildReportListQuery(params: ReportListFilterParams): string {
  const qs = new URLSearchParams();
  if (params.page != null) qs.set('page', params.page.toString());
  if (params.size != null) qs.set('size', params.size.toString());
  if (params.status) qs.set('status', params.status);
  if (params.targetType) qs.set('targetType', params.targetType);
  if (params.reason) qs.set('reason', params.reason);
  if (params.assigneeUserId) qs.set('assigneeUserId', params.assigneeUserId);
  if (params.search) qs.set('search', params.search);
  if (params.sort) qs.set('sort', params.sort);
  if (params.direction) qs.set('direction', params.direction);
  return qs.toString();
}

function buildSiblingQuery(params: ReportSiblingFilterParams): string {
  const qs = new URLSearchParams();
  qs.set('targetType', params.targetType);
  qs.set('targetId', params.targetId);
  if (params.excludeReportId) qs.set('excludeReportId', params.excludeReportId);
  if (params.page != null) qs.set('page', params.page.toString());
  if (params.size != null) qs.set('size', params.size.toString());
  return qs.toString();
}

export const adminReportService = {
  listReports: (params: ReportListFilterParams) =>
    apiClient.get<PageReportListItemDto>(`/admin/reports?${buildReportListQuery(params)}`),

  getReportsByTarget: (params: ReportSiblingFilterParams) =>
    apiClient.get<PageReportListItemDto>(`/admin/reports/by-target?${buildSiblingQuery(params)}`),

  getReportDetail: async (reportId: string) => {
    const res = await apiClient.get<StatusResponseDto & { data: ReportDetailDto }>(`/admin/reports/${reportId}`);
    return res.data;
  },

  assignReport: (reportId: string, dto: AssignReportDto) =>
    apiClient.patch<StatusResponseDto>(`/admin/reports/${reportId}/assign`, dto),

  updateStatus: (reportId: string, status: ReportStatus) =>
    apiClient.patch<StatusResponseDto>(`/admin/reports/${reportId}/status`, { status }),

  resolveReport: (reportId: string, dto: ResolveReportDto) =>
    apiClient.post<StatusResponseDto>(`/admin/reports/${reportId}/resolve`, dto),

  addNote: (reportId: string, dto: AddReportNoteDto) =>
    apiClient.post<StatusResponseDto>(`/admin/reports/${reportId}/notes`, dto),

  getStats: () =>
    apiClient.get<ReportStatsDto>('/admin/reports/stats'),
};
