import type { Meta, StoryObj } from '@storybook/react';
import CreateTicketForm from './CreateTicketForm';

const meta: Meta<typeof CreateTicketForm> = {
  title: 'Profile/CreateTicketForm',
  component: CreateTicketForm,
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
type Story = StoryObj<typeof CreateTicketForm>;

export const Default: Story = {
  args: {
    onSuccess: () => console.log('Ticket created'),
  },
};
