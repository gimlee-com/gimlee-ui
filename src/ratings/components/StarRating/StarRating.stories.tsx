import type { Meta, StoryObj } from '@storybook/react-vite';
import StarRating from './StarRating';

const meta: Meta<typeof StarRating> = {
  title: 'Ratings/StarRating',
  component: StarRating,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof StarRating>;

export const Default: Story = {
  args: {
    value: 3.5,
  },
};

export const Interactive: Story = {
  args: {
    value: 0,
    interactive: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <StarRating value={4} size="sm" />
      <StarRating value={4} size="md" />
      <StarRating value={4} size="lg" />
    </div>
  ),
};
