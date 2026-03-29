import type { Meta, StoryObj } from '@storybook/react';
import ReportReasonBadge from './ReportReasonBadge';
import type { ReportReason } from '../../types/adminReport';

const allReasons: ReportReason[] = [
  'SPAM', 'FRAUD', 'INAPPROPRIATE_CONTENT', 'COUNTERFEIT',
  'HARASSMENT', 'COPYRIGHT', 'WRONG_CATEGORY', 'OTHER',
];

const meta: Meta<typeof ReportReasonBadge> = {
  title: 'Admin/Reports/ReportReasonBadge',
  component: ReportReasonBadge,
  tags: ['autodocs'],
  argTypes: {
    reason: {
      control: 'select',
      options: allReasons,
    },
  },
};

export default meta;
type Story = StoryObj<typeof ReportReasonBadge>;

export const Spam: Story = { args: { reason: 'SPAM' } };
export const Fraud: Story = { args: { reason: 'FRAUD' } };
export const InappropriateContent: Story = { args: { reason: 'INAPPROPRIATE_CONTENT' } };
export const Counterfeit: Story = { args: { reason: 'COUNTERFEIT' } };
export const Harassment: Story = { args: { reason: 'HARASSMENT' } };
export const Copyright: Story = { args: { reason: 'COPYRIGHT' } };
export const WrongCategory: Story = { args: { reason: 'WRONG_CATEGORY' } };
export const Other: Story = { args: { reason: 'OTHER' } };

export const AllReasons: Story = {
  render: () => (
    <div className="uk-flex uk-flex-wrap" style={{ gap: '8px' }}>
      {allReasons.map((reason) => (
        <ReportReasonBadge key={reason} reason={reason} />
      ))}
    </div>
  ),
};
