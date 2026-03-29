import type { Meta, StoryObj } from '@storybook/react';
import ReportActionModal from './ReportActionModal';

const meta: Meta<typeof ReportActionModal> = {
  title: 'Admin/ReportActionModal',
  component: ReportActionModal,
  tags: ['autodocs'],
  argTypes: {
    isOpen: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof ReportActionModal>;

export const Closed: Story = {
  args: {
    isOpen: false,
    onConfirm: (dto) => console.log('Confirmed:', dto),
    onClose: () => console.log('Closed'),
  },
};

export const Open: Story = {
  args: {
    isOpen: true,
    onConfirm: (dto) => console.log('Confirmed:', dto),
    onClose: () => console.log('Closed'),
  },
};
