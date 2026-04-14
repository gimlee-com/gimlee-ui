import { useCallback, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { notificationService } from '../services/notificationService';
import {
  setNotifications,
  appendPage,
  markOneRead as markOneReadAction,
  markAllReadInState,
  setUnreadCount,
  setActiveCategory,
  setQueryLoading,
  setQueryLoadingMore,
  setQueryError,
} from '../store/notificationSlice';
import type { NotificationCategory, NotificationDto } from '../types/notification';

const QUERY_KEY = (cat: NotificationCategory | null) => cat ?? 'all';

/**
 * Orchestration hook exposing notification state and actions.
 * Manages initial REST fetches, pagination, and category switching.
 */
export const useNotifications = () => {
  const dispatch = useAppDispatch();
  const { entities, queries, unreadCount, activeCategory } = useAppSelector(
    (state) => state.notifications
  );
  const fetchedCategoriesRef = useRef<Set<string>>(new Set());

  const queryKey = QUERY_KEY(activeCategory);
  const query = queries[queryKey];
  const loading = query?.loading ?? false;
  const loadingMore = query?.loadingMore ?? false;
  const hasMore = query?.hasMore ?? true;
  const error = query?.error ?? null;

  // Resolve notification DTOs from entity map
  const notifications: NotificationDto[] = (query?.ids ?? [])
    .map((id) => entities.entities[id])
    .filter((n): n is NotificationDto => n != null);

  // Fetch initial page for a category when it's first selected
  const fetchCategory = useCallback(
    async (category: NotificationCategory | null) => {
      const key = QUERY_KEY(category);
      if (fetchedCategoriesRef.current.has(key)) return;
      fetchedCategoriesRef.current.add(key);

      dispatch(setQueryLoading({ category, loading: true }));
      try {
        const data = await notificationService.list({
          category: category ?? undefined,
        });
        dispatch(setNotifications({ category, data }));
      } catch (e) {
        const message =
          e instanceof Error ? e.message : 'Failed to load notifications';
        dispatch(setQueryError({ category, error: message }));
        dispatch(setQueryLoading({ category, loading: false }));
        // Allow retry
        fetchedCategoriesRef.current.delete(key);
      }
    },
    [dispatch]
  );

  // On first mount, fetch the 'all' category + unread count
  useEffect(() => {
    fetchCategory(null);
    notificationService
      .getUnreadCount()
      .then((res) => {
        if (typeof res?.count === 'number') {
          dispatch(setUnreadCount(res.count));
        }
      })
      .catch(() => {});
  }, [fetchCategory, dispatch]);

  // Fetch when active category changes
  useEffect(() => {
    fetchCategory(activeCategory);
  }, [activeCategory, fetchCategory]);

  // --- Public actions ---

  const loadMore = useCallback(async () => {
    if (!query || loadingMore || !hasMore) return;
    const ids = query.ids;
    const lastId = ids[ids.length - 1];
    if (!lastId) return;

    dispatch(setQueryLoadingMore({ category: activeCategory, loading: true }));
    try {
      const data = await notificationService.list({
        category: activeCategory ?? undefined,
        beforeId: lastId,
      });
      dispatch(appendPage({ category: activeCategory, data }));
    } catch (e) {
      const message =
        e instanceof Error ? e.message : 'Failed to load more';
      dispatch(setQueryError({ category: activeCategory, error: message }));
      dispatch(setQueryLoadingMore({ category: activeCategory, loading: false }));
    }
  }, [activeCategory, query, loadingMore, hasMore, dispatch]);

  const markRead = useCallback(
    async (id: string) => {
      // Optimistic update
      dispatch(markOneReadAction(id));
      try {
        await notificationService.markRead(id);
      } catch {
        // SSE will reconcile state; no local rollback needed
      }
    },
    [dispatch]
  );

  const markAllRead = useCallback(
    async (category?: NotificationCategory) => {
      // Optimistic update
      dispatch(markAllReadInState({ category }));
      try {
        await notificationService.markAllRead(category);
      } catch {
        // SSE will reconcile
      }
    },
    [dispatch]
  );

  const setCategory = useCallback(
    (category: NotificationCategory | null) => {
      dispatch(setActiveCategory(category));
    },
    [dispatch]
  );

  return {
    notifications,
    unreadCount,
    hasMore,
    loading,
    loadingMore,
    error,
    activeCategory,
    loadMore,
    markRead,
    markAllRead,
    setCategory,
  };
};
