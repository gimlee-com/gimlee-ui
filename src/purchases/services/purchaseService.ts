import { apiClient } from '../../services/apiClient';
import type { 
  PagePurchaseHistoryDto,
  PurchaseRequestDto,
  PurchaseResponseDto,
  PurchaseStatusResponseDto,
  PurchaseDetailDto,
  PurchaseStatus,
  PurchaseSortField,
  SortDirection,
} from '../../types/api';

export interface PurchasesRequestDto {
  p?: number;
  status?: PurchaseStatus[];
  q?: string;
  from?: string;
  to?: string;
  by?: PurchaseSortField;
  dir?: SortDirection;
}

const buildPurchasesQuery = (params: PurchasesRequestDto): string => {
  const query = new URLSearchParams();
  if (params.p != null) query.append('p', params.p.toString());
  if (params.status) params.status.forEach(s => query.append('status', s));
  if (params.q) query.append('q', params.q);
  if (params.from) query.append('from', params.from);
  if (params.to) query.append('to', params.to);
  if (params.by) query.append('by', params.by);
  if (params.dir) query.append('dir', params.dir);
  return query.toString();
};

export const purchaseService = {
  getPurchases: (params: PurchasesRequestDto = {}) =>
    apiClient.get<PagePurchaseHistoryDto>(`/purchases/?${buildPurchasesQuery(params)}`),

  getPurchaseById: (id: string) =>
    apiClient.get<PurchaseDetailDto>(`/purchases/${id}`),

  createPurchase: (data: PurchaseRequestDto) =>
    apiClient.post<PurchaseResponseDto>('/purchases', data),

  getPurchaseStatus: (purchaseId: string) =>
    apiClient.get<PurchaseStatusResponseDto>(`/purchases/${purchaseId}/status`),

  cancelPurchase: (purchaseId: string) =>
    apiClient.post<void>(`/purchases/${purchaseId}/cancel`),
};
