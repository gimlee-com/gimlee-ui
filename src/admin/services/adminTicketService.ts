import { apiClient } from '../../services/apiClient';
import type { StatusResponseDto } from '../../types/api';
import type {
  TicketListFilterParams,
  PageTicketListItemDto,
  TicketDetailDto,
  UpdateTicketDto,
  ReplyToTicketDto,
  TicketMessageDto,
  TicketStatsDto,
} from '../types/adminTicket';

function buildTicketListQuery(params: TicketListFilterParams): string {
  const qs = new URLSearchParams();
  if (params.page != null) qs.set('page', params.page.toString());
  if (params.size != null) qs.set('size', params.size.toString());
  if (params.status) qs.set('status', params.status);
  if (params.priority) qs.set('priority', params.priority);
  if (params.category) qs.set('category', params.category);
  if (params.assigneeUserId) qs.set('assigneeUserId', params.assigneeUserId);
  if (params.search) qs.set('search', params.search);
  if (params.sort) qs.set('sort', params.sort);
  if (params.direction) qs.set('direction', params.direction);
  return qs.toString();
}

export const adminTicketService = {
  listTickets: (params: TicketListFilterParams) =>
    apiClient.get<PageTicketListItemDto>(`/admin/tickets?${buildTicketListQuery(params)}`),

  getTicketDetail: async (ticketId: string) => {
    const res = await apiClient.get<StatusResponseDto & { data: TicketDetailDto }>(`/admin/tickets/${ticketId}`);
    return res.data;
  },

  updateTicket: (ticketId: string, dto: UpdateTicketDto) =>
    apiClient.patch<StatusResponseDto>(`/admin/tickets/${ticketId}`, dto),

  replyToTicket: async (ticketId: string, dto: ReplyToTicketDto) => {
    const res = await apiClient.post<StatusResponseDto & { data: TicketMessageDto }>(
      `/admin/tickets/${ticketId}/reply`,
      dto,
    );
    return res.data;
  },

  getStats: () =>
    apiClient.get<TicketStatsDto>('/admin/tickets/stats'),
};
