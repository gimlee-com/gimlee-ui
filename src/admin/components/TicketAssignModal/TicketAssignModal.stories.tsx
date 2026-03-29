import type { Meta, StoryObj } from '@storybook/react';
import TicketAssignModal from './TicketAssignModal';

const sampleStaff = [
  { userId: 'usr-050', username: 'support_agent', displayName: 'Support Agent' },
  { userId: 'usr-051', username: 'admin1', displayName: 'Admin One' },
  { userId: 'usr-052', username: 'mod_jane', displayName: 'Jane Moderator' },
];

const meta: Meta<typeof TicketAssignModal> = {
  title: 'Admin/TicketAssignModal',
  component: TicketAssignModal,
  tags: ['autodocs'],
  argTypes: {
    isOpen: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof TicketAssignModal>;

export const Closed: Story = {
  args: {
    isOpen: false,
    onConfirm: (userId) => console.log('Assigned to:', userId),
    onClose: () => console.log('Closed'),
    staff: sampleStaff,
  },
};

export const Open: Story = {
  args: {
    isOpen: true,
    onConfirm: (userId) => console.log('Assigned to:', userId),
    onClose: () => console.log('Closed'),
    staff: sampleStaff,
  },
};

export const EmptyStaffList: Story = {
  args: {
    isOpen: true,
    onConfirm: (userId) => console.log('Assigned to:', userId),
    onClose: () => console.log('Closed'),
    staff: [],
  },
};
