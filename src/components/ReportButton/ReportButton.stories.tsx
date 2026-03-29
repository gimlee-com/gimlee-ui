import type { Meta, StoryObj } from '@storybook/react';
import ReportButton from './ReportButton';

const meta: Meta<typeof ReportButton> = {
  title: 'Components/ReportButton',
  component: ReportButton,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 400 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ReportButton>;

export const ReportAd: Story = {
  args: {
    targetType: 'AD',
    targetId: 'ad-123',
  },
};

export const ReportUser: Story = {
  args: {
    targetType: 'USER',
    targetId: 'user-456',
  },
};

export const ReportMessage: Story = {
  args: {
    targetType: 'MESSAGE',
    targetId: 'msg-789',
  },
};
