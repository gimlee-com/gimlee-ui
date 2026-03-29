import type { Meta, StoryObj } from '@storybook/react';
import TicketCard from './TicketCard';
import type { TicketListItemDto } from '../../types/adminTicket';

const now = Date.now() * 1000;

const baseTicket: TicketListItemDto = {
  id: 'tkt-001',
  subject: 'Cannot withdraw funds from my wallet',
  category: 'PAYMENT_PROBLEM',
  status: 'OPEN',
  priority: 'HIGH',
  creatorUsername: 'alice',
  creatorUserId: 'usr-001',
  assigneeUsername: null,
  assigneeUserId: null,
  lastMessageAt: now,
  messageCount: 3,
  createdAt: now - 86_400_000_000,
  updatedAt: now,
};

const meta: Meta<typeof TicketCard> = {
  title: 'Admin/TicketCard',
  component: TicketCard,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 600 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TicketCard>;

export const OpenHighPriority: Story = {
  args: { ticket: baseTicket },
};

export const InProgressAssigned: Story = {
  args: {
    ticket: {
      ...baseTicket,
      id: 'tkt-002',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      assigneeUsername: 'support_agent',
      assigneeUserId: 'usr-050',
      category: 'TECHNICAL_BUG',
      subject: 'Page crashes when uploading images',
      messageCount: 8,
    },
  },
};

export const Resolved: Story = {
  args: {
    ticket: {
      ...baseTicket,
      id: 'tkt-003',
      status: 'RESOLVED',
      priority: 'LOW',
      category: 'FEATURE_REQUEST',
      subject: 'Add dark mode support',
      messageCount: 2,
      assigneeUsername: 'admin1',
      assigneeUserId: 'usr-099',
    },
  },
};

export const UrgentSafetyConcern: Story = {
  args: {
    ticket: {
      ...baseTicket,
      id: 'tkt-004',
      status: 'OPEN',
      priority: 'URGENT',
      category: 'SAFETY_CONCERN',
      subject: 'User threatening behaviour in chat',
      messageCount: 12,
    },
  },
};

export const NoMessages: Story = {
  args: {
    ticket: {
      ...baseTicket,
      id: 'tkt-005',
      status: 'AWAITING_USER',
      priority: 'LOW',
      category: 'OTHER',
      subject: 'General inquiry about marketplace policies',
      messageCount: 0,
      lastMessageAt: null,
    },
  },
};
