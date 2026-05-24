import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EditAdPage from './EditAdPage';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { salesService } from '../services/salesService';
import { cityService } from '../../ads/services/cityService';
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

vi.mock('../../ads/services/cityService', () => ({
  cityService: {
    getSuggestions: vi.fn(),
  },
}));

vi.mock('../../components/Markdown/MarkdownEditor', () => ({
  MarkdownEditor: ({ value, onChange }: { value: string; onChange: (val: string) => void }) => (
    <textarea value={value} onChange={(e) => onChange(e.target.value)} data-testid="markdown-editor" />
  ),
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
  location: {
    city: {
      id: 'city-1',
      name: 'Warszawa',
      countryCode: 'PL',
      district: 'Mokotów',
      region: 'Masovian Voivodeship'
    }
  },
  mediaPaths: [],
  mainPhotoPath: undefined,
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

describe('EditAdPage City Suggester', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(salesService.getAdById).mockResolvedValue(mockAd);
    vi.mocked(salesService.getAllowedCurrencies).mockResolvedValue({
      settlementCurrencies: [
        { code: 'ARRR', name: 'Pirate Chain' },
        { code: 'YEC', name: 'YCash' }
      ],
      referenceCurrencies: [
        { code: 'USD', name: 'US Dollar' },
        { code: 'PLN', name: 'Polish Zloty' }
      ]
    });
  });

  it('should display city with district on initial load', async () => {
    renderEditAdPage();
    
    await waitFor(() => {
      const cityInput = screen.getByPlaceholderText(/Search for a city/i) as HTMLInputElement;
      expect(cityInput.value).toBe('Warszawa');
    });
  });

  it('should display district in suggestions when searching', async () => {
    const mockSuggestions = [
      {
        id: 'waw-1',
        name: 'Warszawa',
        countryCode: 'PL',
        region: 'Masovian Voivodeship',
        district: '',
        population: 1790658,
        latitude: 52.23,
        longitude: 21.01
      },
      {
        id: 'waw-2',
        name: 'Warszawa',
        countryCode: 'PL',
        region: 'Masovian Voivodeship',
        district: 'Bemowo',
        population: 120000,
        latitude: 52.24,
        longitude: 20.91
      }
    ];
    vi.mocked(cityService.getSuggestions).mockResolvedValue(mockSuggestions);

    renderEditAdPage();

    const cityInput = await screen.findByPlaceholderText(/Search for a city/i);
    fireEvent.change(cityInput, { target: { value: 'Wars' } });

    await waitFor(() => {
      expect(screen.getAllByText('Warszawa, PL')).toHaveLength(2);
      expect(screen.getByText('Masovian Voivodeship')).toBeInTheDocument();
      expect(screen.getByText('Bemowo, Masovian Voivodeship')).toBeInTheDocument();
    });
  });

  it('should update input value with district when a suggestion is selected', async () => {
     const mockSuggestions = [
      {
        id: 'waw-2',
        name: 'Warszawa',
        countryCode: 'PL',
        region: 'Masovian Voivodeship',
        district: 'Bemowo',
        population: 120000,
        latitude: 52.24,
        longitude: 20.91
      }
    ];
    vi.mocked(cityService.getSuggestions).mockResolvedValue(mockSuggestions);

    renderEditAdPage();

    const cityInput = await screen.findByPlaceholderText(/Search for a city/i) as HTMLInputElement;
    fireEvent.change(cityInput, { target: { value: 'Wars' } });

    const suggestion = await screen.findByText('Warszawa, PL');
    fireEvent.click(suggestion);

    expect(cityInput.value).toBe('Warszawa');
  });
});
