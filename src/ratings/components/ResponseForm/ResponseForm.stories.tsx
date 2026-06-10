import type { Meta, StoryObj } from '@storybook/react';
import ResponseForm from './ResponseForm';

const meta: Meta<typeof ResponseForm> = {
  title: 'Ratings/ResponseForm',
  component: ResponseForm,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ResponseForm>;

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    onSubmit: () => {},
  },
};
