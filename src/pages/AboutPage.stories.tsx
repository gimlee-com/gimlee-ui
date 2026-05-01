import type { Meta, StoryObj } from '@storybook/react-vite';
import AboutPage from './AboutPage';

const meta = {
  title: 'Pages/About',
  component: AboutPage,
  tags: ['autodocs'],
} satisfies Meta<typeof AboutPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
