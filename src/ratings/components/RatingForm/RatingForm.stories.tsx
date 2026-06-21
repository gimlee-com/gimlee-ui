import type { Meta, StoryObj } from '@storybook/react-vite';
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
      raterId: 'u1',
      rateeId: 'u2',
      contextType: 'ORDER',
      contextId: 'o1',
      repKind: 'SEL',
      status: 'PUB',
      edited: false,
      editableUntil: 0,
      helpfulCount: 0,
      createdAt: 0,
      updatedAt: 0,
      photoPaths: null,
      snapshot: null,
      supplements: null,
      response: null,
      publishedAt: null,
    },
  },
};
