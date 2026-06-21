import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EditAdPage from './EditAdPage';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { salesService } from '../services/salesService';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import { createStore } from '../../store';
import { AuthProvider } from '../../context/AuthContext';
import i18n from '../../i18n';

vi.mock('../services/salesService', () => ({
  salesService: {
    getAdById: vi.fn(),
    updateAd: vi.fn(),
    getAllowedCurrencies: vi.fn(),
  },
}));

vi.mock('../../services/apiClient', () => ({
  apiClient: {
    getToken: vi.fn(),
    setToken: vi.fn(),
    get: vi.fn().mockResolvedValue({ accessToken: '', userProfile: null }),
    post: vi.fn().mockResolvedValue({}),
    getRefreshToken: vi.fn().mockReturnValue(null),
    setRefreshToken: vi.fn(),
    clearTokens: vi.fn(),
    getDeviceId: vi.fn().mockReturnValue('test-device-id'),
    refreshTokens: vi.fn(),
  },
}));

vi.mock('../../ads/components/CategorySelector/CategorySelector', () => ({
  CategorySelector: () => <div data-testid="category-selector" />,
}));

const mockAd = {
  id: '1',
  userId: 'user-1',
  title: 'Test Ad',
  description: 'Test Description',
  price: { amount: 10, currency: 'ARRR' },
  pricingMode: 'FIXED_CRYPTO' as const,
  settlementCurrencies: ['ARRR'],
  frozenCurrencies: [],
  isBuyable: true,
  volatilityProtection: false,
  categoryId: 123,
  categoryPath: [
    { id: 1, name: 'Electronics' },
    { id: 123, name: 'Laptops' }
  ],
  location: {
    city: {
      id: 'city-1',
      name: 'Warszawa',
      countryCode: 'PL',
    }
  },
  mediaPaths: [],
  status: 'ACTIVE' as const,
  stock: 1,
  lockedStock: 0,
  availableStock: 1,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z'
};

const renderEditAdPage = () => {
  return render(
    <Provider store={createStore()}>
      <AuthProvider>
        <I18nextProvider i18n={i18n}>
          <MemoryRouter initialEntries={['/sales/ads/edit/1']}>
            <Routes>
              <Route path="/sales/ads/edit/:id" element={<EditAdPage />} />
            </Routes>
          </MemoryRouter>
        </I18nextProvider>
      </AuthProvider>
    </Provider>
  );
};

describe('EditAdPage Category', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(salesService.getAdById).mockResolvedValue(mockAd as any);
    vi.mocked(salesService.getAllowedCurrencies).mockResolvedValue({
      settlementCurrencies: [
        { code: 'ARRR', name: 'Pirate Chain' }
      ],
      referenceCurrencies: [
        { code: 'USD', name: 'US Dollar' }
      ]
    });
  });

  it('should display category path on initial load', async () => {
    renderEditAdPage();
    
    await waitFor(() => {
      // CategoryBreadcrumbs should render the path
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('Laptops')).toBeInTheDocument();
      expect(screen.queryByText('Select category')).not.toBeInTheDocument();
    });
  });
});
