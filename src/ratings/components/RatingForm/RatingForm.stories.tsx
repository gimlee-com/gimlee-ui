import type { Meta, StoryObj } from '@storybook/react';
import RatingForm from './RatingForm';

const meta: Meta<typeof RatingForm> = {
  title: 'Ratings/RatingForm',
  component: RatingForm,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RatingForm>;

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    onSubmit: () => {},
    contextId: 'ord_123',
  },
};

export const Edit: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    onSubmit: () => {},
    existingRating: {
      id: '1',
      score: 4,
      title: 'Good product',
      body: 'I liked it.',
      // ... minimal mock needed for form
    } as any,
  },
};
