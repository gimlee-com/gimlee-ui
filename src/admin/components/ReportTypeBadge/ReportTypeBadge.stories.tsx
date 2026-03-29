import type { Meta, StoryObj } from '@storybook/react';
import ReportTypeBadge from './ReportTypeBadge';

const meta: Meta<typeof ReportTypeBadge> = {
  title: 'Admin/Reports/ReportTypeBadge',
  component: ReportTypeBadge,
  tags: ['autodocs'],
  argTypes: {
    targetType: {
      control: 'select',
      options: ['AD', 'USER', 'MESSAGE', 'QUESTION', 'ANSWER'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ReportTypeBadge>;

export const Ad: Story = { args: { targetType: 'AD' } };
export const User: Story = { args: { targetType: 'USER' } };
export const Message: Story = { args: { targetType: 'MESSAGE' } };
export const Question: Story = { args: { targetType: 'QUESTION' } };
export const Answer: Story = { args: { targetType: 'ANSWER' } };

export const AllTypes: Story = {
  render: () => (
    <div className="uk-flex uk-flex-wrap" style={{ gap: '8px' }}>
      <ReportTypeBadge targetType="AD" />
      <ReportTypeBadge targetType="USER" />
      <ReportTypeBadge targetType="MESSAGE" />
      <ReportTypeBadge targetType="QUESTION" />
      <ReportTypeBadge targetType="ANSWER" />
    </div>
  ),
};
