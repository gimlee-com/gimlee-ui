import { apiClient } from '../../services/apiClient';
import type { NewMessageRequestDto, ChatMessageDto } from '../types';

export const chatService = {
  getHistory: (chatId: string, limit = 20, beforeId?: string) => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (beforeId) params.append('beforeId', beforeId);
    return apiClient.get<unknown>(`/chat/${chatId}/messages?${params.toString()}`);
  },

  sendMessage: (chatId: string, data: NewMessageRequestDto) => {
    return apiClient.post<ChatMessageDto>(`/chat/${chatId}/messages`, data);
  },

  notifyTyping: (chatId: string) => {
    return apiClient.post(`/chat/${chatId}/typing`, {});
  },

  touchChat: (chatId: string) => {
    return apiClient.post(`/chat/${chatId}/touch`, {});
  },

  getEventsUrl: (chatId: string) => {
    const API_URL = import.meta.env.VITE_API_URL || '';
    return `${API_URL}/api/chat/${chatId}/events`;
  }
};
