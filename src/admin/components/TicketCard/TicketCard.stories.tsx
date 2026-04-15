import type { Meta, StoryObj } from '@storybook/react';
import TicketCard from './TicketCard';
import type { TicketListItemDto } from '../../types/adminTicket';

const now = Date.now() * 1000;
const hoursAgo = (h: number) => now - h * 3600 * 1_000_000;

const paymentTicket: TicketListItemDto = {
  id: 'tkt-001',
  subject: 'Cannot withdraw funds from my wallet',
  category: 'PAYMENT_PROBLEM',
  status: 'OPEN',
  priority: 'HIGH',
  creatorUsername: 'alice',
  creatorUserId: 'usr-001',
  assigneeUsername: null,
  assigneeUserId: null,
  lastMessageAt: hoursAgo(1),
  messageCount: 3,
  createdAt: hoursAgo(24),
  updatedAt: hoursAgo(1),
};

const bugTicket: TicketListItemDto = {
  id: 'tkt-002',
  subject: 'Page crashes when uploading images larger than 10MB',
  category: 'TECHNICAL_BUG',
  status: 'IN_PROGRESS',
  priority: 'MEDIUM',
  creatorUsername: 'bob_dev',
  creatorUserId: 'usr-002',
  assigneeUsername: 'support_agent',
  assigneeUserId: 'usr-050',
  lastMessageAt: hoursAgo(3),
  messageCount: 8,
  createdAt: hoursAgo(72),
  updatedAt: hoursAgo(3),
};

const featureTicket: TicketListItemDto = {
  id: 'tkt-003',
  subject: 'Add dark mode support for the marketplace',
  category: 'FEATURE_REQUEST',
  status: 'RESOLVED',
  priority: 'LOW',
  creatorUsername: 'themefan',
  creatorUserId: 'usr-003',
  assigneeUsername: 'admin1',
  assigneeUserId: 'usr-099',
  lastMessageAt: hoursAgo(48),
  messageCount: 2,
  createdAt: hoursAgo(168),
  updatedAt: hoursAgo(48),
};

const safetyTicket: TicketListItemDto = {
  id: 'tkt-004',
  subject: 'User threatening behaviour in chat — immediate action needed',
  category: 'SAFETY_CONCERN',
  status: 'OPEN',
  priority: 'URGENT',
  creatorUsername: 'concerned_user',
  creatorUserId: 'usr-004',
  assigneeUsername: null,
  assigneeUserId: null,
  lastMessageAt: hoursAgo(0.5),
  messageCount: 12,
  createdAt: hoursAgo(2),
  updatedAt: hoursAgo(0.5),
};

const awaitingTicket: TicketListItemDto = {
  id: 'tkt-005',
  subject: 'General inquiry about marketplace policies and seller verification process',
  category: 'OTHER',
  status: 'AWAITING_USER',
  priority: 'LOW',
  creatorUsername: 'newbie',
  creatorUserId: 'usr-005',
  assigneeUsername: 'support_agent',
  assigneeUserId: 'usr-050',
  lastMessageAt: null,
  messageCount: 0,
  createdAt: hoursAgo(6),
  updatedAt: hoursAgo(6),
};

const closedTicket: TicketListItemDto = {
  id: 'tkt-006',
  subject: 'Order dispute — seller never shipped the item',
  category: 'ORDER_DISPUTE',
  status: 'CLOSED',
  priority: 'HIGH',
  creatorUsername: 'buyer99',
  creatorUserId: 'usr-006',
  assigneeUsername: 'admin1',
  assigneeUserId: 'usr-099',
  lastMessageAt: hoursAgo(120),
  messageCount: 15,
  createdAt: hoursAgo(240),
  updatedAt: hoursAgo(120),
};

const accountTicket: TicketListItemDto = {
  id: 'tkt-007',
  subject: 'Cannot change my email address',
  category: 'ACCOUNT_ISSUE',
  status: 'IN_PROGRESS',
  priority: 'MEDIUM',
  creatorUsername: 'emailuser',
  creatorUserId: 'usr-007',
  assigneeUsername: 'support_agent',
  assigneeUserId: 'usr-050',
  lastMessageAt: hoursAgo(12),
  messageCount: 4,
  createdAt: hoursAgo(48),
  updatedAt: hoursAgo(12),
};

const meta: Meta<typeof TicketCard> = {
  title: 'Admin/TicketCard',
  component: TicketCard,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 720 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TicketCard>;

export const PaymentProblem: Story = {
  args: { ticket: paymentTicket },
};

export const TechnicalBug: Story = {
  args: { ticket: bugTicket },
};

export const FeatureRequest: Story = {
  args: { ticket: featureTicket },
};

export const UrgentSafetyConcern: Story = {
  args: { ticket: safetyTicket },
};

export const AwaitingUser: Story = {
  args: { ticket: awaitingTicket },
};

export const ClosedDispute: Story = {
  args: { ticket: closedTicket },
};

export const AccountIssue: Story = {
  args: { ticket: accountTicket },
};

export const AllStates: Story = {
  render: () => (
    <div className="uk-grid uk-grid-small uk-child-width-1-1" uk-grid="">
      <div><TicketCard ticket={paymentTicket} /></div>
      <div><TicketCard ticket={bugTicket} /></div>
      <div><TicketCard ticket={featureTicket} /></div>
      <div><TicketCard ticket={safetyTicket} /></div>
      <div><TicketCard ticket={awaitingTicket} /></div>
      <div><TicketCard ticket={closedTicket} /></div>
      <div><TicketCard ticket={accountTicket} /></div>
    </div>
  ),
};
