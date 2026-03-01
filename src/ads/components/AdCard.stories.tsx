import type { Meta, StoryObj } from '@storybook/react-vite';
import { AdCard } from './AdCard';
import type { AdDiscoveryPreviewDto } from '../../types/api';

const meta: Meta<typeof AdCard> = {
  title: 'Ads/AdCard',
  component: AdCard,
  decorators: [
    (Story) => (
      <div style={{ padding: '2rem', maxWidth: '350px' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AdCard>;

export const Default: Story = {
  args: {
    ad: {
      id: '1',
      title: 'Vintage Camera - Nikon FM2 in Excellent Condition',
      preferredPrice: { amount: 12.5, currency: 'ARRR' },
      pricingMode: 'PEGGED',
      settlementCurrencies: ['ARRR', 'YEC'],
      mainPhotoPath: '',
      location: {
        city: { id: 'warsaw', name: 'Warsaw', district: 'Mokotów', country: 'Poland' }
      },
      isBuyable: true,
    },
  },
};

export const New: Story = {
  args: {
    ad: {
      ...Default.args?.ad,
      id: '2',
      title: 'New Listing: Mechanical Keyboard',
    } as AdDiscoveryPreviewDto,
  },
};

export const Sold: Story = {
  args: {
    ad: {
      ...Default.args?.ad,
      id: '3',
      isBuyable: false,
    } as AdDiscoveryPreviewDto,
  },
};

export const LowStock: Story = {
  args: {
    ad: {
      ...Default.args?.ad,
      id: '4',
    } as AdDiscoveryPreviewDto,
  },
};

export const OutOfStock: Story = {
  args: {
    ad: {
      ...Default.args?.ad,
      id: '5',
      isBuyable: false,
    } as AdDiscoveryPreviewDto,
  },
};

export const LongTitle: Story = {
  args: {
    ad: {
      ...Default.args?.ad,
      id: '6',
      title: 'This is a very long title that should definitely be truncated after two lines of text to ensure the card remains mature and tidy even with long user input',
    } as AdDiscoveryPreviewDto,
  },
};
