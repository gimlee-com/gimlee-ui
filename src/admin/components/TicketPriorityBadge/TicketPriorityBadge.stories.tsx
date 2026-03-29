import type { Meta, StoryObj } from '@storybook/react';
import TicketPriorityBadge from './TicketPriorityBadge';

const meta: Meta<typeof TicketPriorityBadge> = {
  title: 'Admin/HelpDesk/TicketPriorityBadge',
  component: TicketPriorityBadge,
  tags: ['autodocs'],
  argTypes: {
    priority: {
      control: 'select',
      options: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof TicketPriorityBadge>;

export const Low: Story = { args: { priority: 'LOW' } };
export const Medium: Story = { args: { priority: 'MEDIUM' } };
export const High: Story = { args: { priority: 'HIGH' } };
export const Urgent: Story = { args: { priority: 'URGENT' } };

export const AllPriorities: Story = {
  render: () => (
    <div className="uk-flex uk-flex-wrap" style={{ gap: '8px' }}>
      <TicketPriorityBadge priority="LOW" />
      <TicketPriorityBadge priority="MEDIUM" />
      <TicketPriorityBadge priority="HIGH" />
      <TicketPriorityBadge priority="URGENT" />
    </div>
  ),
};
