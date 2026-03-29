import type { Meta, StoryObj } from '@storybook/react';
import ReportFilterBadges from './ReportFilters';

const meta: Meta<typeof ReportFilterBadges> = {
  title: 'Admin/ReportFilterBadges',
  component: ReportFilterBadges,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ReportFilterBadges>;

export const NoFilters: Story = {
  args: {
    search: '',
    status: '',
    targetType: '',
    reason: '',
    onRemoveSearch: () => {},
    onRemoveStatus: () => {},
    onRemoveTargetType: () => {},
    onRemoveReason: () => {},
  },
};

export const SearchOnly: Story = {
  args: {
    search: 'suspicious listing',
    status: '',
    targetType: '',
    reason: '',
    onRemoveSearch: () => {},
    onRemoveStatus: () => {},
    onRemoveTargetType: () => {},
    onRemoveReason: () => {},
  },
};

export const AllFiltersActive: Story = {
  args: {
    search: 'fraud',
    status: 'OPEN',
    targetType: 'AD',
    reason: 'FRAUD',
    onRemoveSearch: () => {},
    onRemoveStatus: () => {},
    onRemoveTargetType: () => {},
    onRemoveReason: () => {},
  },
};

export const StatusAndReason: Story = {
  args: {
    search: '',
    status: 'IN_REVIEW',
    targetType: '',
    reason: 'HARASSMENT',
    onRemoveSearch: () => {},
    onRemoveStatus: () => {},
    onRemoveTargetType: () => {},
    onRemoveReason: () => {},
  },
};
