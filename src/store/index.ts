import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import purchaseReducer from './purchaseSlice';
import navbarReducer from './navbarSlice';
import chatReducer from '../chat/store/chatSlice';
import notificationsReducer from '../notifications/store/notificationSlice';

export const createStore = () => configureStore({
  reducer: {
    purchase: purchaseReducer,
    navbar: navbarReducer,
    chat: chatReducer,
    notifications: notificationsReducer,
  },
});

export const store = createStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
