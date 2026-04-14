import { useEffect, useRef } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/apiClient';
import { useAppDispatch } from '../../store';
import { notificationService } from '../services/notificationService';
import {
  prependNotification,
  markOneRead,
  markAllReadInState,
  setUnreadCount,
  setStreamConnected,
  resetNotifications,
} from '../store/notificationSlice';
import { SSE_EVENTS } from '../types/notification';
import type {
  NotificationDto,
  NotificationReadEvent,
  NotificationsAllReadEvent,
  UnreadCountEvent,
} from '../types/notification';

/**
 * App-level hook that maintains a single SSE connection for real-time
 * notification delivery. Mount once in App.tsx.
 */
export const useNotificationStream = () => {
  const { isAuthenticated } = useAuth();
  const dispatch = useAppDispatch();
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
      dispatch(resetNotifications());
      return;
    }

    const token = apiClient.getToken();
    if (!token) return;

    // Abort any existing connection before establishing a new one
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    const url = notificationService.getStreamUrl();

    fetchEventSource(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'text/event-stream',
      },
      signal: controller.signal,

      async onopen(response) {
        if (response.ok) {
          dispatch(setStreamConnected(true));
          return;
        }
        if (response.status === 401 || response.status === 403) {
          throw new Error(`Auth error: ${response.status}`);
        }
      },

      onmessage(event) {
        if (!event.data || event.event === 'heartbeat') return;

        try {
          switch (event.event) {
            case SSE_EVENTS.NOTIFICATION: {
              const notification = JSON.parse(event.data) as NotificationDto;
              if (notification?.id && notification?.type) {
                dispatch(prependNotification(notification));
              }
              break;
            }
            case SSE_EVENTS.NOTIFICATION_READ: {
              const payload = JSON.parse(event.data) as NotificationReadEvent;
              if (payload?.id) {
                dispatch(markOneRead(payload.id));
              }
              break;
            }
            case SSE_EVENTS.NOTIFICATIONS_ALL_READ: {
              const payload = JSON.parse(event.data) as NotificationsAllReadEvent;
              dispatch(markAllReadInState({ category: payload?.category }));
              break;
            }
            case SSE_EVENTS.UNREAD_COUNT: {
              const payload = JSON.parse(event.data) as UnreadCountEvent;
              if (typeof payload?.count === 'number') {
                dispatch(setUnreadCount(payload.count));
              }
              break;
            }
          }
        } catch (e) {
          console.error('Failed to parse notification SSE event', e, event.data);
        }
      },

      onerror() {
        dispatch(setStreamConnected(false));
      },

      onclose() {
        dispatch(setStreamConnected(false));
      },
    });

    return () => {
      controller.abort();
      abortRef.current = null;
      dispatch(setStreamConnected(false));
    };
  }, [isAuthenticated, dispatch]);
};
