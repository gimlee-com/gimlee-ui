import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { conversationService } from '../services/conversationService';
import type { ConversationDto, ConversationStatus } from '../types';

export interface ConversationsState {
  conversations: ConversationDto[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
}

const initialState: ConversationsState = {
  conversations: [],
  loading: false,
  error: null,
  hasMore: true,
};

export const fetchConversations = createAsyncThunk(
  'conversations/fetchList',
  async ({ limit, beforeActivityAt }: { limit?: number; beforeActivityAt?: string } = {}) => {
    return await conversationService.listConversations(limit, beforeActivityAt);
  }
);

export const conversationSlice = createSlice({
  name: 'conversations',
  initialState,
  reducers: {
    updateConversationLastActivity: (
      state,
      action: PayloadAction<{ conversationId: string; lastActivityAt: string }>
    ) => {
      const conv = state.conversations.find(c => c.id === action.payload.conversationId);
      if (conv) {
        conv.lastActivityAt = action.payload.lastActivityAt;
        // Re-sort by last activity (most recent first) — ISO-8601 strings are lexicographically sortable
        state.conversations.sort((a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt));
      }
    },
    updateConversationStatus: (
      state,
      action: PayloadAction<{ conversationId: string; status: ConversationStatus }>
    ) => {
      const conv = state.conversations.find(c => c.id === action.payload.conversationId);
      if (conv) {
        conv.status = action.payload.status;
      }
    },
    addConversation: (state, action: PayloadAction<ConversationDto>) => {
      if (!state.conversations.some(c => c.id === action.payload.id)) {
        state.conversations.unshift(action.payload);
      }
    },
    clearConversations: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        const { conversations, hasMore } = action.payload;
        const isInitial = !action.meta.arg?.beforeActivityAt;

        if (isInitial) {
          state.conversations = conversations;
        } else {
          // Append older conversations, dedup
          const existingIds = new Set(state.conversations.map(c => c.id));
          const newConversations = conversations.filter(c => !existingIds.has(c.id));
          state.conversations = [...state.conversations, ...newConversations];
        }

        state.hasMore = hasMore;
        state.loading = false;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch conversations';
      });
  },
});

export const {
  updateConversationLastActivity,
  updateConversationStatus,
  addConversation,
  clearConversations,
} = conversationSlice.actions;

export default conversationSlice.reducer;
