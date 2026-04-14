import { apiClient } from '../../services/apiClient';
import type {
  NotificationListDto,
  NotificationCategory,
  UnreadCountDto,
} from '../types/notification';

const API_URL = import.meta.env.VITE_API_URL || '';

interface DataEnvelope<T> {
  success: boolean;
  status: string;
  message?: string;
  data: T;
}

export const notificationService = {
  list: async (options?: {
    category?: NotificationCategory;
    limit?: number;
    beforeId?: string;
  }) => {
    const params = new URLSearchParams();
    if (options?.category) params.set('category', options.category);
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.beforeId) params.set('beforeId', options.beforeId);
    const qs = params.toString();
    const res = await apiClient.get<DataEnvelope<NotificationListDto>>(`/notifications${qs ? `?${qs}` : ''}`);
    return res.data;
  },

  markRead: (id: string) =>
    apiClient.patch<DataEnvelope<Record<string, never>>>(`/notifications/${id}/read`),

  markAllRead: (category?: NotificationCategory) => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    const qs = params.toString();
    return apiClient.patch<DataEnvelope<Record<string, never>>>(`/notifications/read-all${qs ? `?${qs}` : ''}`);
  },

  getUnreadCount: async () => {
    const res = await apiClient.get<DataEnvelope<UnreadCountDto>>('/notifications/unread-count');
    return res.data;
  },

  getStreamUrl: () => `${API_URL}/api/notifications/stream`,
};
