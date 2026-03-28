import type { Meta, StoryObj } from '@storybook/react';
import UserStatusBadge from './UserStatusBadge';

const meta: Meta<typeof UserStatusBadge> = {
  title: 'Admin/UserStatusBadge',
  component: UserStatusBadge,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['ACTIVE', 'PENDING_VERIFICATION', 'BANNED', 'SUSPENDED'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof UserStatusBadge>;

export const Active: Story = {
  args: { status: 'ACTIVE' },
};

export const PendingVerification: Story = {
  args: { status: 'PENDING_VERIFICATION' },
};

export const Banned: Story = {
  args: { status: 'BANNED' },
};

export const Suspended: Story = {
  args: { status: 'SUSPENDED' },
};

export const AllStatuses: Story = {
  render: () => (
    <div className="uk-flex uk-flex-wrap" style={{ gap: '8px' }}>
      <UserStatusBadge status="ACTIVE" />
      <UserStatusBadge status="PENDING_VERIFICATION" />
      <UserStatusBadge status="BANNED" />
      <UserStatusBadge status="SUSPENDED" />
    </div>
  ),
};
