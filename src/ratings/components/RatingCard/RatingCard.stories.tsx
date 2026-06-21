import type { Meta, StoryObj } from '@storybook/react-vite';
import RatingCard from './RatingCard';
import type { RatingResponseDto } from '../../types/ratings';

const mockRating: RatingResponseDto = {
  id: '1',
  contextType: 'ORDER',
  contextId: 'ord_12345',
  repKind: 'SEL',
  raterId: 'user_1',
  rateeId: 'user_2',
  score: 5,
  title: 'Excellent transaction!',
  body: 'The item was exactly as described and the shipping was fast. Highly recommended seller!',
  photoPaths: null,
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
  status: 'PUB',
  edited: false,
  editableUntil: Date.now() * 1000 + 3600000000, // Long in the future
  supplements: null,
  response: null,
  helpfulCount: 0,
  createdAt: (Date.now() - 86400000) * 1000,
  updatedAt: (Date.now() - 86400000) * 1000,
  publishedAt: (Date.now() - 86400000) * 1000,
};

const meta: Meta<typeof RatingCard> = {
  title: 'Ratings/RatingCard',
  component: RatingCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RatingCard>;

export const Default: Story = {
  args: {
    rating: mockRating,
  },
};

export const WithResponse: Story = {
  args: {
    rating: {
      ...mockRating,
      response: {
        body: 'Thank you for your kind words! It was a pleasure doing business with you.',
        createdAt: Date.now() * 1000,
        updatedAt: Date.now() * 1000,
      },
    },
  },
};

export const WithSupplements: Story = {
  args: {
    rating: {
      ...mockRating,
      supplements: [
        {
          id: 's1',
          body: 'Actually, I wanted to add that the packaging was also very secure.',
          status: 'PUB',
          editableUntil: Date.now() * 1000 + 3600000,
          createdAt: Date.now() * 1000,
        },
      ],
    },
  },
};

export const AdminView: Story = {
  args: {
    rating: {
      ...mockRating,
      status: 'HID',
    },
    viewerRole: 'admin',
  },
};
