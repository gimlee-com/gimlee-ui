import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdDetailsPage from './AdDetailsPage';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore } from '../../store';
import { AuthProvider } from '../../context/AuthContext';
import { adService } from '../services/adService';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import styles from './AdDetailsPage.module.scss';
import type { AdDiscoveryDetailsDto } from '../../types/api';

vi.mock('../services/adService', () => ({
  adService: {
    getAdById: vi.fn(),
  },
}));

vi.mock('../services/qaService', () => ({
  qaService: {
    getQuestions: vi.fn().mockResolvedValue({ content: [], page: { size: 10, number: 0, totalElements: 0, totalPages: 0 } }),
    getMyUnanswered: vi.fn().mockResolvedValue([]),
    getSellerUnanswered: vi.fn().mockResolvedValue({ content: [], page: { size: 10, number: 0, totalElements: 0, totalPages: 0 } }),
    getStats: vi.fn().mockResolvedValue({ totalAnswered: 0, totalUnanswered: 0 }),
  },
}));

const mockAd: AdDiscoveryDetailsDto = {
  id: '1',
  title: 'Test Ad',
  description: 'Test Description',
  price: { amount: 100, currency: 'ARRR' },
  pricingMode: 'FIXED_CRYPTO',
  settlementCurrencies: ['ARRR'],
  settlementPrices: [{ amount: 100, currency: 'ARRR' }],
  preferredPrice: { amount: 100, currency: 'ARRR' },
  frozenCurrencies: [],
  isBuyable: true,
  userCanPurchase: true,
  mediaPaths: ['image1.jpg', 'image2.jpg'],
  location: { city: { id: 'c1', name: 'Test City', country: 'Test Country' } },
  availableStock: 5
};

const renderAdDetailsPage = (id = '1') => {
  return render(
    <Provider store={createStore()}>
      <I18nextProvider i18n={i18n}>
        <AuthProvider>
          <div id="navbar-focused-content"></div>
          <MemoryRouter initialEntries={[`/ads/${id}`]}>
            <Routes>
              <Route path="/ads/:id" element={<AdDetailsPage />} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </I18nextProvider>
    </Provider>
  );
};

describe('AdDetailsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render ad details', async () => {
    vi.mocked(adService.getAdById).mockResolvedValue(mockAd);

    renderAdDetailsPage();

    await waitFor(() => {
      expect(screen.getAllByText('Test Ad')[0]).toBeInTheDocument();
    }, { timeout: 5000 });

    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getAllByText(/ARRR 100\.00/).length).toBeGreaterThan(0);
    expect(screen.getByText('Test City, Test Country')).toBeInTheDocument();
  });

  it('should change active image when thumbnail is clicked', async () => {
    vi.mocked(adService.getAdById).mockResolvedValue(mockAd);

    renderAdDetailsPage();

    await waitFor(() => {
      expect(screen.getAllByText('Test Ad')[0]).toBeInTheDocument();
    }, { timeout: 5000 });

    // Initial state: only first image has thumbs-md due to progressive loading
    const getMdImages = () => screen.getAllByRole('img').filter(img => (img as HTMLImageElement).src.includes('thumbs-md'));
    
    expect(getMdImages()).toHaveLength(1);

    // Click the second thumbnail
    const thumbLinks = screen.getAllByRole('link').filter(link => {
        const img = link.querySelector('img') as HTMLImageElement | null;
        return img && img.src.includes('thumbs-xs');
    });

    fireEvent.click(thumbLinks[1]);

    // Now second image should also have thumbs-md (as it's now visited)
    await waitFor(() => {
      expect(getMdImages()).toHaveLength(2);
    }, { timeout: 5000 });
  });

  it('should still update active index on swipe after clicking a thumbnail', async () => {
    vi.mocked(adService.getAdById).mockResolvedValue({
        ...mockAd,
        mediaPaths: ['image1.jpg', 'image2.jpg', 'image3.jpg']
    });

    renderAdDetailsPage();

    await waitFor(() => {
      expect(screen.getAllByText('Test Ad')[0]).toBeInTheDocument();
    }, { timeout: 5000 });

    const getMdImages = () => screen.getAllByRole('img').filter(img => (img as HTMLImageElement).src.includes('thumbs-md'));
    
    // 1. Initially 1 high-res image
    expect(getMdImages()).toHaveLength(1);

    // 2. Click second thumbnail
    const thumbLinks = screen.getAllByRole('link').filter(link => {
        const img = link.querySelector('img') as HTMLImageElement | null;
        return img && img.src.includes('thumbs-xs');
    });
    fireEvent.click(thumbLinks[1]);

    await waitFor(() => {
      expect(getMdImages()).toHaveLength(2);
    }, { timeout: 5000 });

    // Find main slider and items
    const allSliders = document.querySelectorAll('[uk-slider]');
    const mainSlider = Array.from(allSliders).find(s => s.querySelector('a[data-caption]'));
    const sliderItems = mainSlider!.querySelectorAll('li[data-index]');

    // Manually trigger itemshow for index 1 to "complete" the jump in JSDOM
    fireEvent(sliderItems[1], new CustomEvent('itemshow', { bubbles: true }));

    // 3. Simulate swipe to third image (index 2)
    await waitFor(() => {
        fireEvent(sliderItems[2], new CustomEvent('itemshow', { bubbles: true }));
        expect(getMdImages()).toHaveLength(3);
    }, { timeout: 5000 });
  });

  it('should have correct styling for the main image', async () => {
    vi.mocked(adService.getAdById).mockResolvedValue(mockAd);

    renderAdDetailsPage();

    await waitFor(() => {
      const mainImages = screen.getAllByRole('img').filter(img => (img as HTMLImageElement).src.includes('thumbs-md'));
      expect(mainImages[0]).toHaveClass(styles.adDetailsLightboxImage);
      expect(mainImages[0]).toHaveClass('uk-object-cover');
    }, { timeout: 5000 });
  });

  it('should show "no images" placeholder if ad has no media', async () => {
    vi.mocked(adService.getAdById).mockResolvedValue({ ...mockAd, mediaPaths: [] });

    renderAdDetailsPage();

    await waitFor(() => {
      expect(screen.getByText(/No images available/i)).toBeInTheDocument();
      expect(screen.getByRole('img')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('should render slider items with data-index attributes for robust tracking', async () => {
    vi.mocked(adService.getAdById).mockResolvedValue(mockAd);

    renderAdDetailsPage();

    await waitFor(() => {
      expect(screen.getAllByText('Test Ad')[0]).toBeInTheDocument();
    }, { timeout: 5000 });

    // The main slider items should have data-index attributes
    const allItems = screen.getAllByRole('listitem');
    const itemsWithIndex = allItems.filter(item => item.hasAttribute('data-index'));
    
    // We expect at least the main slider items to have it.
    // mockAd has 2 images. Main slider has 2 items.
    expect(itemsWithIndex.length).toBeGreaterThanOrEqual(2);
    expect(itemsWithIndex[0]).toHaveAttribute('data-index', '0');
    expect(itemsWithIndex[1]).toHaveAttribute('data-index', '1');
  });

  it('should render category breadcrumbs in NavbarPortal', async () => {
    const adWithCategory: AdDiscoveryDetailsDto = {
      ...mockAd,
      categoryPath: [
        { id: 1, name: 'Electronics' },
        { id: 2, name: 'Computers' }
      ]
    };
    vi.mocked(adService.getAdById).mockResolvedValue(adWithCategory);

    renderAdDetailsPage();

    await waitFor(() => {
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('Computers')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('should render "Member since" as relative time', async () => {
    const oneYearAgo = (Date.now() - 365 * 24 * 60 * 60 * 1000) * 1000; // microseconds
    const adWithMemberSince: AdDiscoveryDetailsDto = {
      ...mockAd,
      user: {
        userId: 'u1',
        username: 'Seller1',
        memberSince: oneYearAgo
      }
    };
    vi.mocked(adService.getAdById).mockResolvedValue(adWithMemberSince);

    renderAdDetailsPage();

    await waitFor(() => {
      // "about 1 year ago" is the default for date-fns enUS locale for 365 days
      expect(screen.getByText(/Member since (about )?1 year ago/)).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('should limit other ads to 4 and show "Display all" button', async () => {
    const manyOtherAds = Array.from({ length: 10 }, (_, i) => ({
      id: `other-${i}`,
      title: `Other Ad ${i}`,
      preferredPrice: { amount: 10 + i, currency: 'ARRR' },
      pricingMode: 'FIXED_CRYPTO' as const,
      settlementCurrencies: ['ARRR'],
      isBuyable: true
    }));
    
    vi.mocked(adService.getAdById).mockResolvedValue({
      ...mockAd,
      user: {
        userId: 'u1',
        username: 'Seller1'
      },
      otherAds: manyOtherAds
    });

    renderAdDetailsPage();

    await waitFor(() => {
      const otherAdTitles = screen.queryAllByText(/Other Ad \d/);
      // It should only render 4 items due to slice(0, 4)
      expect(otherAdTitles).toHaveLength(4);
    }, { timeout: 5000 });

    // Should have "Display all" button
    expect(screen.getByText(/Display all/i)).toBeInTheDocument();
    expect(screen.getByText(/Display all/i).closest('a')).toHaveAttribute('href', '/u/Seller1');

    // Grid items should NOT have visibility classes anymore as they should always be visible
    const getGridItem = (text: string) => {
      const element = screen.getByText(text);
      // AdCard structure: Link -> CardBody -> Card -> motion.div -> Container Div
      return element.closest('.uk-card')?.parentElement?.parentElement;
    };

    const firstItem = getGridItem('Other Ad 0');
    expect(firstItem).not.toHaveClass('uk-visible@m');
    expect(firstItem).not.toHaveClass('uk-visible@l');

    const fourthItem = getGridItem('Other Ad 3');
    expect(fourthItem).not.toHaveClass('uk-visible@m');
    expect(fourthItem).not.toHaveClass('uk-visible@l');
  });
});
