import type { Meta, StoryObj } from '@storybook/react-vite';
import ReputationBadge from './ReputationBadge';

const meta: Meta<typeof ReputationBadge> = {
  title: 'Ratings/ReputationBadge',
  component: ReputationBadge,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ReputationBadge>;

const createAggregate = (average: number, count = 10) => ({
  rateeId: 'user-1',
  repKind: 'SEL' as const,
  count,
  average,
  dist: {},
  lastRatingAt: Date.now(),
});

export const Excellent: Story = {
  args: {
    aggregate: createAggregate(4.8, 123),
  },
};

export const Good: Story = {
  args: {
    aggregate: createAggregate(4.2, 50),
  },
};

export const Average: Story = {
  args: {
    aggregate: createAggregate(3.5, 20),
  },
};

export const Poor: Story = {
  args: {
    aggregate: createAggregate(2.1, 5),
  },
};

export const Small: Story = {
  args: {
    aggregate: createAggregate(4.5, 100),
    size: 'sm',
  },
};
