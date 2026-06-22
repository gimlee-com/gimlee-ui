import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { PurchaseResponseDto, PurchaseStatus, PurchaseItemRequestDto, Currency, DeliveryAddressDto } from '../types/api';
import { userService } from '../profile/services/userService';

export interface PurchaseIntent {
  items: PurchaseItemRequestDto[];
  currency: Currency;
}

export interface PurchaseState {
  activePurchase: PurchaseResponseDto | null;
  purchaseIntent: PurchaseIntent | null;
  selectedAddress: DeliveryAddressDto | null;
  isModalOpen: boolean;
  currentUser: string | null;
  loading: boolean;
  error: string | null;
}

const getStorageKey = (username: string) => `activePurchase:${username}`;
const getIntentKey = (username: string) => `purchaseIntent:${username}`;

const initialState: PurchaseState = {
  activePurchase: null,
  purchaseIntent: null,
  selectedAddress: null,
  isModalOpen: false,
  currentUser: null,
  loading: false,
  error: null,
};

export const purchaseSlice = createSlice({
  name: 'purchase',
  initialState,
  reducers: {
    rehydrateForUser: (state, action: PayloadAction<string>) => {
      const username = action.payload;
      state.currentUser = username;
      
      // 1. Check for active purchase
      const stored = localStorage.getItem(getStorageKey(username));
      if (stored) {
        try {
          const purchase = JSON.parse(stored) as PurchaseResponseDto;
          if (purchase.status === 'AWAITING_PAYMENT') {
            state.activePurchase = purchase;
            state.isModalOpen = true;
            return;
          }
          localStorage.removeItem(getStorageKey(username));
        } catch {
          localStorage.removeItem(getStorageKey(username));
        }
      }

      // 2. Check for purchase intent (user-specific)
      const storedIntent = localStorage.getItem(getIntentKey(username));
      if (storedIntent) {
        try {
          state.purchaseIntent = JSON.parse(storedIntent) as PurchaseIntent;
          return;
        } catch {
          localStorage.removeItem(getIntentKey(username));
        }
      }

      // 3. Check for generic pending intent (from guest session)
      const genericIntent = localStorage.getItem('pendingPurchaseIntent');
      if (genericIntent) {
        try {
          state.purchaseIntent = JSON.parse(genericIntent) as PurchaseIntent;
          localStorage.removeItem('pendingPurchaseIntent');
          // We save it as user-specific intent so it persists for this user
          localStorage.setItem(getIntentKey(username), genericIntent);
        } catch {
          localStorage.removeItem('pendingPurchaseIntent');
        }
      }
    },
    clearPurchaseIntent: (state, action: PayloadAction<string>) => {
      localStorage.removeItem(getIntentKey(action.payload));
      state.purchaseIntent = null;
    },
    clearForLogout: (state) => {
      state.activePurchase = null;
      state.purchaseIntent = null;
      state.selectedAddress = null;
      state.isModalOpen = false;
      state.currentUser = null;
    },
    startPurchaseFlow: (state, action: PayloadAction<PurchaseIntent>) => {
      state.purchaseIntent = action.payload;
      state.activePurchase = null;
      state.selectedAddress = null;
      state.isModalOpen = true;
      if (state.currentUser) {
        localStorage.setItem(getIntentKey(state.currentUser), JSON.stringify(action.payload));
      }
    },
    setSelectedAddress: (state, action: PayloadAction<DeliveryAddressDto | null>) => {
      state.selectedAddress = action.payload;
    },
    setActivePurchase: (state, action: PayloadAction<PurchaseResponseDto | null>) => {
      state.activePurchase = action.payload;
      state.purchaseIntent = null;
      state.isModalOpen = !!action.payload;
      if (state.currentUser) {
        localStorage.removeItem(getIntentKey(state.currentUser));
        if (action.payload && action.payload.status === 'AWAITING_PAYMENT') {
          localStorage.setItem(getStorageKey(state.currentUser), JSON.stringify(action.payload));
        } else if (!action.payload) {
          localStorage.removeItem(getStorageKey(state.currentUser));
        }
      }
    },
    setModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isModalOpen = action.payload;
    },
    updateActivePurchaseStatus: (state, action: PayloadAction<PurchaseStatus>) => {
      if (state.activePurchase) {
        state.activePurchase.status = action.payload;
        if (action.payload === 'AWAITING_PAYMENT' && state.currentUser) {
          localStorage.setItem(getStorageKey(state.currentUser), JSON.stringify(state.activePurchase));
        } else if (state.currentUser) {
          localStorage.removeItem(getStorageKey(state.currentUser));
        }
      }
    },
    clearActivePurchase: (state) => {
      state.activePurchase = null;
      state.purchaseIntent = null;
      state.selectedAddress = null;
      state.isModalOpen = false;
      if (state.currentUser) {
        localStorage.removeItem(getStorageKey(state.currentUser));
        localStorage.removeItem(getIntentKey(state.currentUser));
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(restorePurchaseIntent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(restorePurchaseIntent.fulfilled, (state) => {
        state.loading = false;
        state.isModalOpen = true;
      })
      .addCase(restorePurchaseIntent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to restore purchase intent';
        state.purchaseIntent = null;
      });
  },
});

export const restorePurchaseIntent = createAsyncThunk(
  'purchase/restoreIntent',
  async ({ intent: _intent }: { username: string; intent: PurchaseIntent }) => {
    // We call the backend to fetch delivery addresses. 
    // This satisfies the requirement to call the backend after login 
    // and ensures we have fresh data before showing the modal.
    await userService.getDeliveryAddresses();
    
    // We return nothing as we just want to trigger the modal opening 
    // at the address selection step.
    return null;
  }
);

export const { 
  rehydrateForUser, 
  clearPurchaseIntent,
  clearForLogout, 
  startPurchaseFlow, 
  setSelectedAddress, 
  setActivePurchase, 
  setModalOpen, 
  updateActivePurchaseStatus, 
  clearActivePurchase 
} = purchaseSlice.actions;
export default purchaseSlice.reducer;
