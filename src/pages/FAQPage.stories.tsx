import type { Meta, StoryObj } from '@storybook/react-vite';
import FAQPage from './FAQPage';

const meta = {
  title: 'Pages/FAQ',
  component: FAQPage,
  tags: ['autodocs'],
} satisfies Meta<typeof FAQPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
