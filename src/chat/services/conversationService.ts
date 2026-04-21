import { apiClient } from '../../services/apiClient';
import type { ConversationListResponseDto } from '../../types/api';
import type { ConversationDto, OrderConversationResponseDto } from '../types';

export const conversationService = {
  listConversations: async (limit = 20, beforeActivityAt?: string) => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (beforeActivityAt) params.append('beforeActivityAt', beforeActivityAt);
    const response = await apiClient.get<{ data: ConversationListResponseDto }>(`/conversations?${params.toString()}`);
    return response.data;
  },

  getConversation: async (conversationId: string) => {
    const response = await apiClient.get<{ data: ConversationDto }>(`/conversations/${conversationId}`);
    return response.data;
  },

  getOrderConversation: async (purchaseId: string, recentMessagesLimit = 20) => {
    const params = new URLSearchParams({ recentMessagesLimit: recentMessagesLimit.toString() });
    const response = await apiClient.get<{ data: OrderConversationResponseDto }>(`/purchases/${purchaseId}/conversation?${params.toString()}`);
    return response.data;
  },
};
