import type { Meta, StoryObj } from '@storybook/react';
import TicketStatusBadge from './TicketStatusBadge';

const meta: Meta<typeof TicketStatusBadge> = {
  title: 'Admin/HelpDesk/TicketStatusBadge',
  component: TicketStatusBadge,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['OPEN', 'IN_PROGRESS', 'AWAITING_USER', 'RESOLVED', 'CLOSED'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof TicketStatusBadge>;

export const Open: Story = { args: { status: 'OPEN' } };
export const InProgress: Story = { args: { status: 'IN_PROGRESS' } };
export const AwaitingUser: Story = { args: { status: 'AWAITING_USER' } };
export const Resolved: Story = { args: { status: 'RESOLVED' } };
export const Closed: Story = { args: { status: 'CLOSED' } };

export const AllStatuses: Story = {
  render: () => (
    <div className="uk-flex uk-flex-wrap" style={{ gap: '8px' }}>
      <TicketStatusBadge status="OPEN" />
      <TicketStatusBadge status="IN_PROGRESS" />
      <TicketStatusBadge status="AWAITING_USER" />
      <TicketStatusBadge status="RESOLVED" />
      <TicketStatusBadge status="CLOSED" />
    </div>
  ),
};
