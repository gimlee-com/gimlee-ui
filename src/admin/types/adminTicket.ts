/**
 * Admin Help Desk Ticket types.
 *
 * ⚠️ Timestamps from the backend are in **epoch microseconds**.
 * Convert to JS milliseconds: `ts / 1000` before passing to `new Date()`.
 */

import type { PageMetadata } from '../../types/api';

/** Ticket lifecycle status */
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'AWAITING_USER' | 'RESOLVED' | 'CLOSED';

/** Ticket priority level */
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

/** Ticket category describing the type of support request */
export type TicketCategory =
  | 'ACCOUNT_ISSUE'
  | 'PAYMENT_PROBLEM'
  | 'ORDER_DISPUTE'
  | 'TECHNICAL_BUG'
  | 'FEATURE_REQUEST'
  | 'SAFETY_CONCERN'
  | 'OTHER';

/** Sort fields accepted by GET /admin/tickets */
export type TicketSortField = 'createdAt' | 'updatedAt' | 'lastMessageAt' | 'priority';

/** Sort direction */
export type SortDirection = 'ASC' | 'DESC';

/** Single ticket in the admin list response */
export interface TicketListItemDto {
  id: string;
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  creatorUsername: string;
  creatorUserId: string;
  assigneeUsername: string | null;
  assigneeUserId: string | null;
  lastMessageAt: number | null;
  messageCount: number;
  createdAt: number;
  updatedAt: number;
}

/** Full ticket detail (GET /admin/tickets/{ticketId}) */
export interface TicketDetailDto extends TicketListItemDto {
  messages: TicketMessageDto[];
  relatedReportIds: string[];
}

/** Single message in a ticket conversation */
export interface TicketMessageDto {
  id: string;
  authorUsername: string;
  authorUserId: string;
  authorRole: 'USER' | 'SUPPORT';
  body: string;
  createdAt: number;
}

/** Request body for POST /admin/tickets/{ticketId}/reply */
export interface ReplyToTicketDto {
  body: string;
}

/** Request body for PATCH /admin/tickets/{ticketId} */
export interface UpdateTicketDto {
  status?: TicketStatus;
  priority?: TicketPriority;
  assigneeUserId?: string | null;
}

/** Request body for POST /tickets (user-facing ticket creation) */
export interface CreateTicketDto {
  subject: string;
  category: TicketCategory;
  body: string;
}

/** Query parameters for GET /admin/tickets */
export interface TicketListFilterParams {
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  assigneeUserId?: string;
  search?: string;
  sort?: TicketSortField;
  direction?: SortDirection;
  page?: number;
  size?: number;
}

/** Paginated response for ticket list */
export interface PageTicketListItemDto {
  content: TicketListItemDto[];
  page: PageMetadata;
}

/** Dashboard stats (GET /admin/tickets/stats) */
export interface TicketStatsDto {
  open: number;
  inProgress: number;
  awaitingUser: number;
  resolvedToday: number;
  averageResolutionTimeMicros: number | null;
}

/** Default filter values */
export const DEFAULT_TICKET_LIST_PARAMS: TicketListFilterParams = {
  page: 0,
  size: 30,
};
