import type { TicketCategory } from '../types/adminTicket';

/** Maps each ticket category to a UIkit icon name for visual differentiation. */
export const ticketCategoryIcon: Record<TicketCategory, string> = {
  ACCOUNT_ISSUE: 'user',
  PAYMENT_PROBLEM: 'credit-card',
  ORDER_DISPUTE: 'warning',
  TECHNICAL_BUG: 'cog',
  FEATURE_REQUEST: 'star',
  SAFETY_CONCERN: 'ban',
  OTHER: 'more',
};
