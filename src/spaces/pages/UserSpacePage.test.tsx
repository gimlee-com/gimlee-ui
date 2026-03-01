import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import UserSpacePage from './UserSpacePage';
import { spacesService } from '../services/spacesService';
import { AuthProvider } from '../../context/AuthContext';
import { PresenceProvider } from '../../context/PresenceContext';
import type { UserSpaceDto } from '../../types/api';

vi.mock('../services/spacesService', () => ({
  spacesService: {
    fetchUserSpace: vi.fn(),
  },
}));

vi.mock('../../profile/services/presenceService', () => ({
  presenceService: {
    getUserPresence: vi.fn().mockResolvedValue({ status: 'ONLINE', userId: '1' }),
  },
}));

// Mock store for tests
const createMockStore = () => configureStore({
  reducer: {
    navbar: (state = { mode: 'default' }) => state,
  },
});

const mockData = {
  user: {
    username: 'johndoe',
  },
  ads: {
    content: [
      { id: '1', title: 'Ad 1', price: { amount: 100, currency: 'ARRR' } },
      { id: '2', title: 'Ad 2', price: { amount: 200, currency: 'ARRR' } },
    ],
    page: {
      number: 0,
      size: 10,
      totalElements: 2,
      totalPages: 1,
    },
  },
};

describe('UserSpacePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', async () => {
    vi.mocked(spacesService.fetchUserSpace).mockReturnValue(new Promise(() => {}));
    
    render(
      <Provider store={createMockStore()}>
        <AuthProvider>
          <PresenceProvider>
            <MemoryRouter initialEntries={['/u/johndoe']}>
              <Routes>
                <Route path="/u/:userName" element={<UserSpacePage />} />
              </Routes>
            </MemoryRouter>
          </PresenceProvider>
        </AuthProvider>
      </Provider>
    );

    expect(await screen.findByRole('status')).toBeDefined();
  });

  it('renders user data and ads after successful fetch', async () => {
    vi.mocked(spacesService.fetchUserSpace).mockResolvedValue(mockData as unknown as UserSpaceDto);

    render(
      <Provider store={createMockStore()}>
        <AuthProvider>
          <PresenceProvider>
            <MemoryRouter initialEntries={['/u/johndoe']}>
              <Routes>
                <Route path="/u/:userName" element={<UserSpacePage />} />
              </Routes>
            </MemoryRouter>
          </PresenceProvider>
        </AuthProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('johndoe')).toBeDefined();
      expect(screen.getByText('Ad 1')).toBeDefined();
      expect(screen.getByText('Ad 2')).toBeDefined();
    });
  });

  it('renders error message on fetch failure', async () => {
    vi.mocked(spacesService.fetchUserSpace).mockRejectedValue(new Error('Failed to fetch'));

    render(
      <Provider store={createMockStore()}>
        <AuthProvider>
          <PresenceProvider>
            <MemoryRouter initialEntries={['/u/johndoe']}>
              <Routes>
                <Route path="/u/:userName" element={<UserSpacePage />} />
              </Routes>
            </MemoryRouter>
          </PresenceProvider>
        </AuthProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch')).toBeDefined();
    });
  });
});
