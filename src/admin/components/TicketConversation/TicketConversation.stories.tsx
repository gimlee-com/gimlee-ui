import type { Meta, StoryObj } from '@storybook/react';
import TicketConversation from './TicketConversation';
import type { TicketMessageDto } from '../../types/adminTicket';

const now = Date.now() * 1000;

const sampleMessages: TicketMessageDto[] = [
  {
    id: 'msg-001',
    authorUsername: 'alice',
    authorUserId: 'usr-001',
    authorRole: 'USER',
    body: 'I tried to withdraw funds from my wallet but the transaction is stuck in pending state for over 24 hours. Can someone please help?',
    createdAt: now - 7_200_000_000,
  },
  {
    id: 'msg-002',
    authorUsername: 'support_agent',
    authorUserId: 'usr-050',
    authorRole: 'SUPPORT',
    body: 'Hi Alice, thank you for reaching out. Could you please provide your transaction ID so we can investigate this further?',
    createdAt: now - 3_600_000_000,
  },
  {
    id: 'msg-003',
    authorUsername: 'alice',
    authorUserId: 'usr-001',
    authorRole: 'USER',
    body: 'Sure! The transaction ID is TX-ABC123456. I initiated it yesterday around 3 PM.',
    createdAt: now - 1_800_000_000,
  },
  {
    id: 'msg-004',
    authorUsername: 'support_agent',
    authorUserId: 'usr-050',
    authorRole: 'SUPPORT',
    body: 'Thank you. I can see the transaction was delayed due to network congestion. It has now been processed and should reflect in your wallet within the next hour.',
    createdAt: now,
  },
];

const meta: Meta<typeof TicketConversation> = {
  title: 'Admin/TicketConversation',
  component: TicketConversation,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 700 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TicketConversation>;

export const WithMessages: Story = {
  args: { messages: sampleMessages },
};

export const Empty: Story = {
  args: { messages: [] },
};

export const SingleUserMessage: Story = {
  args: { messages: [sampleMessages[0]] },
};

export const SingleSupportReply: Story = {
  args: { messages: [sampleMessages[1]] },
};
