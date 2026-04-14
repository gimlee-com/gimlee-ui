import { apiClient } from '../../services/apiClient';
import type {
  NotificationListDto,
  NotificationCategory,
  UnreadCountDto,
} from '../types/notification';

const API_URL = import.meta.env.VITE_API_URL || '';

export const notificationService = {
  list: (options?: {
    category?: NotificationCategory;
    limit?: number;
    beforeId?: string;
  }) => {
    const params = new URLSearchParams();
    if (options?.category) params.set('category', options.category);
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.beforeId) params.set('beforeId', options.beforeId);
    const qs = params.toString();
    return apiClient.get<NotificationListDto>(`/notifications${qs ? `?${qs}` : ''}`);
  },

  markRead: (id: string) =>
    apiClient.patch<Record<string, never>>(`/notifications/${id}/read`),

  markAllRead: (category?: NotificationCategory) => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    const qs = params.toString();
    return apiClient.patch<Record<string, never>>(`/notifications/read-all${qs ? `?${qs}` : ''}`);
  },

  getUnreadCount: () =>
    apiClient.get<UnreadCountDto>('/notifications/unread-count'),

  getStreamUrl: () => `${API_URL}/api/notifications/stream`,
};
