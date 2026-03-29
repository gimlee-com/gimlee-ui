import type { Meta, StoryObj } from '@storybook/react';
import ReportFormModal from './ReportFormModal';

const meta: Meta<typeof ReportFormModal> = {
  title: 'Components/ReportFormModal',
  component: ReportFormModal,
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
type Story = StoryObj<typeof ReportFormModal>;

export const Open: Story = {
  args: {
    targetType: 'AD',
    targetId: 'ad-123',
    isOpen: true,
    onClose: () => console.log('Modal closed'),
  },
};

export const Closed: Story = {
  args: {
    targetType: 'USER',
    targetId: 'user-456',
    isOpen: false,
    onClose: () => console.log('Modal closed'),
  },
};
