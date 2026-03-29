import { apiClient } from './apiClient';
import type { StatusResponseDto } from '../types/api';
import type { SubmitReportDto, PageReportListItemDto } from '../admin/types/adminReport';

export const reportService = {
  submitReport: (dto: SubmitReportDto) =>
    apiClient.post<StatusResponseDto>('/reports', dto),

  getMyReports: (params: { page?: number; size?: number }) => {
    const qs = new URLSearchParams();
    if (params.page != null) qs.set('page', params.page.toString());
    if (params.size != null) qs.set('size', params.size.toString());
    return apiClient.get<PageReportListItemDto>(`/reports/mine?${qs.toString()}`);
  },
};
