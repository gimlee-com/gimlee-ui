import type { Meta, StoryObj } from '@storybook/react-vite';
import SupplementForm from './SupplementForm';

const meta: Meta<typeof SupplementForm> = {
  title: 'Ratings/SupplementForm',
  component: SupplementForm,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SupplementForm>;

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    onSubmit: () => {},
  },
};
