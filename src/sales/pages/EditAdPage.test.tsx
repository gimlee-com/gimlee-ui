import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EditAdPage from './EditAdPage';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { salesService } from '../services/salesService';
import { cityService } from '../../ads/services/cityService';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import { createStore } from '../../store';
import i18n from '../../i18n';

vi.mock('../services/salesService', () => ({
  salesService: {
    getAdById: vi.fn(),
    updateAd: vi.fn(),
    getAllowedCurrencies: vi.fn(),
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
  title: 'Test Ad',
  description: 'Test Description',
  price: { amount: 10, currency: 'ARRR' },
  pricingMode: 'FIXED_CRYPTO',
  settlementCurrencies: ['ARRR'],
  frozenCurrencies: [],
  isBuyable: true,
  volatilityProtection: false,
  location: {
    city: {
      id: 'city-1',
      name: 'Warszawa',
      country: 'PL',
      district: 'Mokotów'
    }
  },
  mediaPaths: [],
  mainPhotoPath: null,
  status: 'ACTIVE',
  stock: 1,
  availableStock: 1
};

const renderEditAdPage = () => {
  return render(
    <Provider store={createStore()}>
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={['/sales/ads/edit/1']}>
          <Routes>
            <Route path="/sales/ads/edit/:id" element={<EditAdPage />} />
          </Routes>
        </MemoryRouter>
      </I18nextProvider>
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
      expect(cityInput.value).toBe('Warszawa (Mokotów), PL');
    });
  });

  it('should display district in suggestions when searching', async () => {
    const mockSuggestions = [
      {
        city: {
          id: 'waw-1',
          name: 'Warszawa',
          country: 'PL',
          district: ''
        },
        score: 1
      },
      {
        city: {
          id: 'waw-2',
          name: 'Warszawa',
          country: 'PL',
          district: 'Bemowo'
        },
        score: 0.9
      }
    ];
    vi.mocked(cityService.getSuggestions).mockResolvedValue(mockSuggestions);

    renderEditAdPage();

    const cityInput = await screen.findByPlaceholderText(/Search for a city/i);
    fireEvent.change(cityInput, { target: { value: 'Wars' } });

    await waitFor(() => {
      expect(screen.getByText('Warszawa, PL')).toBeInTheDocument();
      expect(screen.getByText('Warszawa (Bemowo), PL')).toBeInTheDocument();
    });
  });

  it('should update input value with district when a suggestion is selected', async () => {
     const mockSuggestions = [
      {
        city: {
          id: 'waw-2',
          name: 'Warszawa',
          country: 'PL',
          district: 'Bemowo'
        },
        score: 1
      }
    ];
    vi.mocked(cityService.getSuggestions).mockResolvedValue(mockSuggestions);

    renderEditAdPage();

    const cityInput = await screen.findByPlaceholderText(/Search for a city/i) as HTMLInputElement;
    fireEvent.change(cityInput, { target: { value: 'Wars' } });

    const suggestion = await screen.findByText('Warszawa (Bemowo), PL');
    fireEvent.click(suggestion);

    expect(cityInput.value).toBe('Warszawa (Bemowo), PL');
  });
});
