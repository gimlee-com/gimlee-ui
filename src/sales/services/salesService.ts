import { apiClient } from '../../services/apiClient';
import type { 
  AdDto, 
  PageSalesAdDto,
  CreateAdRequestDto, 
  UpdateAdRequestDto,
  PageSalesOrderDto,
  SalesOrderDetailDto,
  SalesStatsDto,
  AllowedCurrenciesDto,
  PurchaseStatus,
  PurchaseSortField,
  SortDirection,
  StatsPeriod,
} from '../../types/api';

export interface SalesAdsRequestDto {
  t?: string;
  s?: ('ACTIVE' | 'INACTIVE' | 'DELETED')[];
  by: 'CREATED_DATE';
  dir: 'ASC' | 'DESC';
  p: number;
}

export interface SalesOrdersRequestDto {
  p?: number;
  status?: PurchaseStatus[];
  q?: string;
  adId?: string;
  from?: string;
  to?: string;
  by?: PurchaseSortField;
  dir?: SortDirection;
}

const buildOrdersQuery = (params: SalesOrdersRequestDto): string => {
  const query = new URLSearchParams();
  if (params.p != null) query.append('p', params.p.toString());
  if (params.status) params.status.forEach(s => query.append('status', s));
  if (params.q) query.append('q', params.q);
  if (params.adId) query.append('adId', params.adId);
  if (params.from) query.append('from', params.from);
  if (params.to) query.append('to', params.to);
  if (params.by) query.append('by', params.by);
  if (params.dir) query.append('dir', params.dir);
  return query.toString();
};

export const salesService = {
  getMyAds: (params: SalesAdsRequestDto, options?: RequestInit) => {
    const query = new URLSearchParams();
    if (params.t) query.append('t', params.t);
    if (params.s) params.s.forEach(status => query.append('s', status));
    query.append('by', params.by);
    query.append('dir', params.dir);
    query.append('p', params.p.toString());
    return apiClient.get<PageSalesAdDto>(`/sales/ads/?${query.toString()}`, options);
  },

  createAd: (data: CreateAdRequestDto) =>
    apiClient.post<AdDto>('/sales/ads', data),

  getAdById: (id: string) =>
    apiClient.get<AdDto>(`/sales/ads/${id}`),

  getAllowedCurrencies: () =>
    apiClient.get<AllowedCurrenciesDto>('/sales/ads/allowed-currencies'),

  updateAd: (id: string, data: UpdateAdRequestDto) =>
    apiClient.put<AdDto>(`/sales/ads/${id}`, data),

  activateAd: (id: string) =>
    apiClient.post<AdDto>(`/sales/ads/${id}/activate`),

  deactivateAd: (id: string) =>
    apiClient.post<AdDto>(`/sales/ads/${id}/deactivate`),

  getSalesOrders: (params: SalesOrdersRequestDto = {}) =>
    apiClient.get<PageSalesOrderDto>(`/sales/orders/?${buildOrdersQuery(params)}`),

  getSalesOrderById: (id: string) =>
    apiClient.get<SalesOrderDetailDto>(`/sales/orders/${id}`),

  getStats: (period: StatsPeriod = 'ALL_TIME') =>
    apiClient.get<SalesStatsDto>(`/sales/stats?period=${period}`),
};
