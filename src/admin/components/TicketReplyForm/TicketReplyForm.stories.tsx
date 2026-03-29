import type { Meta, StoryObj } from '@storybook/react';
import TicketReplyForm from './TicketReplyForm';

const meta: Meta<typeof TicketReplyForm> = {
  title: 'Admin/TicketReplyForm',
  component: TicketReplyForm,
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
type Story = StoryObj<typeof TicketReplyForm>;

export const Default: Story = {
  args: {
    onSubmit: (dto) => console.log('Submitted:', dto),
    isSubmitting: false,
  },
};

export const Submitting: Story = {
  args: {
    onSubmit: (dto) => console.log('Submitted:', dto),
    isSubmitting: true,
  },
};
