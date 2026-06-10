import type { Meta, StoryObj } from '@storybook/react';
import ReputationSummary from './ReputationSummary';

const meta: Meta<typeof ReputationSummary> = {
  title: 'Ratings/ReputationSummary',
  component: ReputationSummary,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ReputationSummary>;

export const Default: Story = {
  args: {
    userId: 'user_1',
  },
};

export const BuyerReputation: Story = {
  args: {
    userId: 'user_1',
    initialRepKind: 'BUY',
  },
};
