import { apiClient } from '../../services/apiClient';
import type { NewMessageRequestDto, ChatMessageDto } from '../types';

export const chatService = {
  getHistory: (conversationId: string, limit = 20, beforeId?: string) => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (beforeId) params.append('beforeId', beforeId);
    return apiClient.get<unknown>(`/chat/${conversationId}/messages?${params.toString()}`);
  },

  sendMessage: (conversationId: string, data: NewMessageRequestDto) => {
    return apiClient.post<ChatMessageDto>(`/chat/${conversationId}/messages`, data);
  },

  notifyTyping: (conversationId: string) => {
    return apiClient.post(`/chat/${conversationId}/typing`, {});
  },

  getEventsUrl: (conversationId: string) => {
    const API_URL = import.meta.env.VITE_API_URL || '';
    return `${API_URL}/api/chat/${conversationId}/events`;
  }
};
