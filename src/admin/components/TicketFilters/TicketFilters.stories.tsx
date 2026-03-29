import type { Meta, StoryObj } from '@storybook/react';
import TicketFilterBadges from './TicketFilters';

const meta: Meta<typeof TicketFilterBadges> = {
  title: 'Admin/TicketFilterBadges',
  component: TicketFilterBadges,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TicketFilterBadges>;

export const NoFilters: Story = {
  args: {
    search: '',
    status: '',
    priority: '',
    category: '',
    onRemoveSearch: () => console.log('Remove search'),
    onRemoveStatus: () => console.log('Remove status'),
    onRemovePriority: () => console.log('Remove priority'),
    onRemoveCategory: () => console.log('Remove category'),
  },
};

export const SearchOnly: Story = {
  args: {
    search: 'wallet issue',
    status: '',
    priority: '',
    category: '',
    onRemoveSearch: () => console.log('Remove search'),
    onRemoveStatus: () => console.log('Remove status'),
    onRemovePriority: () => console.log('Remove priority'),
    onRemoveCategory: () => console.log('Remove category'),
  },
};

export const AllFiltersActive: Story = {
  args: {
    search: 'payment',
    status: 'OPEN',
    priority: 'HIGH',
    category: 'PAYMENT_PROBLEM',
    onRemoveSearch: () => console.log('Remove search'),
    onRemoveStatus: () => console.log('Remove status'),
    onRemovePriority: () => console.log('Remove priority'),
    onRemoveCategory: () => console.log('Remove category'),
  },
};

export const StatusAndPriority: Story = {
  args: {
    search: '',
    status: 'IN_PROGRESS',
    priority: 'URGENT',
    category: '',
    onRemoveSearch: () => console.log('Remove search'),
    onRemoveStatus: () => console.log('Remove status'),
    onRemovePriority: () => console.log('Remove priority'),
    onRemoveCategory: () => console.log('Remove category'),
  },
};
