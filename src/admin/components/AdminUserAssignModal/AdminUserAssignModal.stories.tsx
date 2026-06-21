import type { Meta, StoryObj } from '@storybook/react-vite';
import AdminUserAssignModal from './AdminUserAssignModal';

const meta: Meta<typeof AdminUserAssignModal> = {
  title: 'Admin/AdminUserAssignModal',
  component: AdminUserAssignModal,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof AdminUserAssignModal>;

export const Open: Story = {
  args: {
    isOpen: true,
    onConfirm: (userId: string) => console.log('Selected user:', userId),
    onClose: () => console.log('Modal closed'),
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    onConfirm: (userId: string) => console.log('Selected user:', userId),
    onClose: () => console.log('Modal closed'),
  },
};
