// --- Categories ---

export const NOTIFICATION_CATEGORIES = [
  'orders',
  'messages',
  'ads',
  'qa',
  'support',
  'account',
] as const;

export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

// --- Severity ---

export const NOTIFICATION_SEVERITIES = ['info', 'success', 'warning', 'danger'] as const;

export type NotificationSeverity = (typeof NOTIFICATION_SEVERITIES)[number];

// --- Core DTO ---

export type SuggestedActionType =
  | 'PURCHASE_LIST'
  | 'PURCHASE_DETAILS'
  | 'SALE_LIST'
  | 'SALE_DETAILS'
  | 'AD_DETAILS'
  | 'SELLER_AD_DETAILS'
  | 'AD_EDIT'
  | 'BUYER_QA_DETAILS'
  | 'SELLER_QA_DETAILS'
  | 'ADMIN_REPORT_DETAILS'
  | 'ADMIN_TICKET_DETAILS'
  | 'TICKET_DETAILS'
  | 'SUPPORT_CENTER'
  | 'GETTING_STARTED';

export interface SuggestedActionDto {
  type: SuggestedActionType;
  target?: string;
}

export interface NotificationDto {
  id: string;
  type: string;
  category: NotificationCategory;
  severity: NotificationSeverity;
  title: string;
  message: string;
  read: boolean;
  createdAt: number; // epoch millis
  /** @deprecated use suggestedAction */
  actionUrl?: string;
  suggestedAction?: SuggestedActionDto;
  metadata?: Record<string, string>;
}

// --- List response ---

export interface NotificationListDto {
  notifications: NotificationDto[];
  hasMore: boolean;
  unreadCount: number;
}

// --- Unread count response ---

export interface UnreadCountDto {
  count: number;
}

// --- SSE event payloads ---

export interface NotificationReadEvent {
  id: string;
}

export interface NotificationsAllReadEvent {
  category?: NotificationCategory;
}

export interface UnreadCountEvent {
  count: number;
}

// --- SSE event names ---

export const SSE_EVENTS = {
  NOTIFICATION: 'notification',
  NOTIFICATION_READ: 'notification-read',
  NOTIFICATIONS_ALL_READ: 'notifications-all-read',
  UNREAD_COUNT: 'unread-count',
} as const;

// --- Category metadata (icons, labels) ---

export const CATEGORY_ICON_MAP: Record<NotificationCategory, string> = {
  orders: 'cart',
  messages: 'comment',
  ads: 'tag',
  qa: 'question',
  support: 'receiver',
  account: 'user',
};

export const SEVERITY_CLASS_MAP: Record<NotificationSeverity, string> = {
  info: 'uk-text-primary',
  success: 'uk-text-success',
  warning: 'uk-text-warning',
  danger: 'uk-text-danger',
};
