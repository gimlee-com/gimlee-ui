import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  NotificationDto,
  NotificationCategory,
  NotificationListDto,
} from '../types/notification';

// --- Entity adapter for normalized notifications ---

const notificationsAdapter = createEntityAdapter<NotificationDto>();

// --- Per-category query cache ---

export interface QueryState {
  /** Ordered notification IDs for this query */
  ids: string[];
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
}

const initialQueryState: QueryState = {
  ids: [],
  hasMore: true,
  loading: false,
  loadingMore: false,
  error: null,
};

// 'all' key + one per category
type QueryKey = 'all' | NotificationCategory;

export interface NotificationState {
  entities: ReturnType<typeof notificationsAdapter.getInitialState>;
  queries: Partial<Record<QueryKey, QueryState>>;
  unreadCount: number;
  activeCategory: NotificationCategory | null;
  streamConnected: boolean;
}

const initialState: NotificationState = {
  entities: notificationsAdapter.getInitialState(),
  queries: {},
  unreadCount: 0,
  activeCategory: null,
  streamConnected: false,
};

// --- Helpers ---

const getQueryKey = (category: NotificationCategory | null): QueryKey =>
  category ?? 'all';

const ensureQuery = (state: NotificationState, key: QueryKey): QueryState => {
  if (!state.queries[key]) {
    state.queries[key] = { ...initialQueryState };
  }
  return state.queries[key]!;
};

// --- Slice ---

export const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Initial page loaded from REST
    setNotifications: (
      state,
      action: PayloadAction<{ category: NotificationCategory | null; data: NotificationListDto }>
    ) => {
      const { category, data } = action.payload;
      const key = getQueryKey(category);
      const query = ensureQuery(state, key);

      // Upsert all entities
      notificationsAdapter.upsertMany(state.entities, data.notifications);

      query.ids = data.notifications.map((n) => n.id);
      query.hasMore = data.hasMore;
      query.loading = false;
      query.loadingMore = false;
      query.error = null;

      // Server count is authoritative
      state.unreadCount = data.unreadCount;
    },

    // Load-more page appended
    appendPage: (
      state,
      action: PayloadAction<{ category: NotificationCategory | null; data: NotificationListDto }>
    ) => {
      const { category, data } = action.payload;
      const key = getQueryKey(category);
      const query = ensureQuery(state, key);

      notificationsAdapter.upsertMany(state.entities, data.notifications);

      const newIds = data.notifications.map((n) => n.id);
      const existingSet = new Set(query.ids);
      for (const id of newIds) {
        if (!existingSet.has(id)) {
          query.ids.push(id);
        }
      }

      query.hasMore = data.hasMore;
      query.loadingMore = false;
      query.error = null;

      state.unreadCount = data.unreadCount;
    },

    // SSE: new notification arrived
    prependNotification: (state, action: PayloadAction<NotificationDto>) => {
      const notification = action.payload;
      notificationsAdapter.upsertOne(state.entities, notification);

      // Prepend to 'all' query if it exists
      const allQuery = state.queries.all;
      if (allQuery && !allQuery.ids.includes(notification.id)) {
        allQuery.ids.unshift(notification.id);
      }

      // Prepend to matching category query if it exists
      const catQuery = state.queries[notification.category];
      if (catQuery && !catQuery.ids.includes(notification.id)) {
        catQuery.ids.unshift(notification.id);
      }
    },

    // SSE: single notification marked read
    markOneRead: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const entity = state.entities.entities[id];
      if (entity) {
        entity.read = true;
      }
    },

    // SSE: all notifications marked read (optional category)
    markAllReadInState: (
      state,
      action: PayloadAction<{ category?: NotificationCategory }>
    ) => {
      const { category } = action.payload;
      const allEntities = Object.values(state.entities.entities);

      for (const entity of allEntities) {
        if (!entity) continue;
        if (!category || entity.category === category) {
          entity.read = true;
        }
      }
    },

    // SSE: authoritative unread count from server
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },

    // UI: switch active category
    setActiveCategory: (
      state,
      action: PayloadAction<NotificationCategory | null>
    ) => {
      state.activeCategory = action.payload;
    },

    // Loading states
    setQueryLoading: (
      state,
      action: PayloadAction<{ category: NotificationCategory | null; loading: boolean }>
    ) => {
      const key = getQueryKey(action.payload.category);
      const query = ensureQuery(state, key);
      query.loading = action.payload.loading;
    },

    setQueryLoadingMore: (
      state,
      action: PayloadAction<{ category: NotificationCategory | null; loading: boolean }>
    ) => {
      const key = getQueryKey(action.payload.category);
      const query = ensureQuery(state, key);
      query.loadingMore = action.payload.loading;
    },

    setQueryError: (
      state,
      action: PayloadAction<{ category: NotificationCategory | null; error: string | null }>
    ) => {
      const key = getQueryKey(action.payload.category);
      const query = ensureQuery(state, key);
      query.error = action.payload.error;
    },

    // Stream connection status
    setStreamConnected: (state, action: PayloadAction<boolean>) => {
      state.streamConnected = action.payload;
    },

    // Reset state on logout
    resetNotifications: () => initialState,
  },
});

export const {
  setNotifications,
  appendPage,
  prependNotification,
  markOneRead,
  markAllReadInState,
  setUnreadCount,
  setActiveCategory,
  setQueryLoading,
  setQueryLoadingMore,
  setQueryError,
  setStreamConnected,
  resetNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
