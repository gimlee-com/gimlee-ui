import { apiClient } from './apiClient';
import type { StatusResponseDto } from '../types/api';
import type {
  CreateTicketDto,
  ReplyToTicketDto,
  PageTicketListItemDto,
  TicketDetailDto,
} from '../admin/types/adminTicket';

export const ticketService = {
  createTicket: (dto: CreateTicketDto) =>
    apiClient.post<StatusResponseDto>('/tickets', dto),

  getMyTickets: (params: { page?: number; size?: number }) => {
    const qs = new URLSearchParams();
    if (params.page != null) qs.set('page', params.page.toString());
    if (params.size != null) qs.set('size', params.size.toString());
    return apiClient.get<PageTicketListItemDto>(`/tickets/mine?${qs.toString()}`);
  },

  getTicketDetail: (ticketId: string) =>
    apiClient.get<TicketDetailDto>(`/tickets/${ticketId}`),

  replyToTicket: (ticketId: string, dto: ReplyToTicketDto) =>
    apiClient.post<StatusResponseDto>(`/tickets/${ticketId}/reply`, dto),
};
