import type { Meta, StoryObj } from '@storybook/react-vite';
import EligibilityCard from './EligibilityCard';
import type { EligibilityResponseDto } from '../../types/ratings';

const mockEligibility: EligibilityResponseDto = {
  id: 'el_1',
  contextType: 'ORDER',
  contextId: 'ord_12345',
  raterId: 'user_1',
  rateeId: 'user_2',
  repKind: 'SEL',
  status: 'PND',
  activeFrom: (Date.now() - 3600000) * 1000,
  expiresAt: (Date.now() + 86400000) * 1000,
  snapshot: {
    refType: 'ORDER',
    items: [
      {
        adId: 'ad_1',
        name: 'Gimlee Logo Sticker',
        quantity: 2,
        unitPrice: '5.00',
        currency: 'ARRR',
        thumbPath: null,
      },
    ],
  },
  createdAt: (Date.now() - 7200000) * 1000,
};

const meta: Meta<typeof EligibilityCard> = {
  title: 'Ratings/EligibilityCard',
  component: EligibilityCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof EligibilityCard>;

export const Default: Story = {
  args: {
    eligibility: mockEligibility,
  },
};

export const Pending: Story = {
  args: {
    eligibility: {
      ...mockEligibility,
      activeFrom: (Date.now() + 3600000) * 1000,
    },
  },
};

export const Expired: Story = {
  args: {
    eligibility: {
      ...mockEligibility,
      expiresAt: (Date.now() - 3600000) * 1000,
    },
  },
};
