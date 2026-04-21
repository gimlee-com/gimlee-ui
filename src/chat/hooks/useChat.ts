import { useEffect, useCallback, useRef } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchChatHistory, addMessage, setTyping, setConversationStatus } from '../store/chatSlice';
import { chatService } from '../services/chatService';
import { apiClient } from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';
import type { InternalChatEvent, ConversationStatus } from '../types';
import { isConversationLocked, isConversationArchived } from '../types';

export const useChat = (conversationId: string, conversationStatus?: ConversationStatus) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, username } = useAuth();
  const chatState = useAppSelector((state) => state.chat.chats[conversationId]);
  const typingTimeouts = useRef<Record<string, NodeJS.Timeout>>({});
  const lastTypingSent = useRef<number>(0);

  // Sync conversation status to Redux if provided
  useEffect(() => {
    if (conversationId && conversationStatus) {
      dispatch(setConversationStatus({ chatId: conversationId, status: conversationStatus }));
    }
  }, [conversationId, conversationStatus, dispatch]);

  useEffect(() => {
    if (!conversationId) return;

    if (!chatState || chatState.messages.length === 0) {
      dispatch(fetchChatHistory({ chatId: conversationId }));
    }

    const url = chatService.getEventsUrl(conversationId);
    const token = apiClient.getToken();
    const abortController = new AbortController();

    if (token) {
      fetchEventSource(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/event-stream',
        },
        signal: abortController.signal,
        onopen: async (response) => {
          if (response.ok && response.headers.get('content-type')?.includes('text/event-stream')) {
            return;
          }
          console.error('SSE connection failed', response.status, response.statusText);
        },
        onmessage: (event) => {
          if (!event.data) return;
          if (event.event === 'heartbeat') return;
          
          try {
            const events = JSON.parse(event.data);
            if (Array.isArray(events)) {
              events.forEach((data: InternalChatEvent) => {
                if (data.type === 'MESSAGE') {
                  const message = {
                    id: `${data.author}-${new Date(data.timestamp).getTime()}`,
                    chatId: data.chatId,
                    author: { username: data.author, userId: data.author },
                    message: data.data || '',
                    timestamp: data.timestamp,
                    messageType: data.messageType,
                    systemCode: data.systemCode,
                    systemArgs: data.systemArgs,
                  };
                  dispatch(addMessage({ chatId: conversationId, message }));
                } else if (data.type === 'TYPING_INDICATOR') {
                  dispatch(setTyping({ chatId: conversationId, username: data.author, typing: true }));
                  
                  if (typingTimeouts.current[data.author]) {
                    clearTimeout(typingTimeouts.current[data.author]);
                  }
                  
                  typingTimeouts.current[data.author] = setTimeout(() => {
                    dispatch(setTyping({ chatId: conversationId, username: data.author, typing: false }));
                    delete typingTimeouts.current[data.author];
                  }, 3000);
                }
              });
            }
          } catch (e) {
            console.error('Failed to parse chat event', e, event.data);
          }
        },
        onerror: (err) => {
          console.error('SSE error', err);
        }
      });
    }

    return () => {
      abortController.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, dispatch, isAuthenticated]);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;
    try {
      await chatService.sendMessage(conversationId, { message });
    } catch (e) {
      console.error('Failed to send message', e);
    }
  }, [conversationId]);

  const sendTyping = useCallback(() => {
    const now = Date.now();
    if (now - lastTypingSent.current > 2000) {
      lastTypingSent.current = now;
      chatService.notifyTyping(conversationId).catch(() => {});
    }
  }, [conversationId]);

  const loadMore = useCallback(() => {
    if (chatState?.loading || !chatState?.hasMore || chatState.messages.length === 0) return;
    const beforeId = chatState.messages[0].id;
    dispatch(fetchChatHistory({ chatId: conversationId, beforeId }));
  }, [conversationId, chatState, dispatch]);

  const isLocked = isConversationLocked(chatState?.conversationStatus);
  const isArchived = isConversationArchived(chatState?.conversationStatus);

  return {
    messages: chatState?.messages || [],
    loading: chatState?.loading || false,
    error: chatState?.error || null,
    typingUsers: (chatState?.typingUsers || []).filter(u => u !== username),
    sendMessage,
    sendTyping,
    loadMore,
    hasMore: chatState?.hasMore ?? true,
    isLocked,
    isArchived,
    conversationStatus: chatState?.conversationStatus,
  };
};
