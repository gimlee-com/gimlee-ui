import type { Meta, StoryObj } from '@storybook/react';
import ReportStatusBadge from './ReportStatusBadge';

const meta: Meta<typeof ReportStatusBadge> = {
  title: 'Admin/Reports/ReportStatusBadge',
  component: ReportStatusBadge,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['OPEN', 'IN_REVIEW', 'RESOLVED', 'DISMISSED'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ReportStatusBadge>;

export const Open: Story = { args: { status: 'OPEN' } };
export const InReview: Story = { args: { status: 'IN_REVIEW' } };
export const Resolved: Story = { args: { status: 'RESOLVED' } };
export const Dismissed: Story = { args: { status: 'DISMISSED' } };

export const AllStatuses: Story = {
  render: () => (
    <div className="uk-flex uk-flex-wrap" style={{ gap: '8px' }}>
      <ReportStatusBadge status="OPEN" />
      <ReportStatusBadge status="IN_REVIEW" />
      <ReportStatusBadge status="RESOLVED" />
      <ReportStatusBadge status="DISMISSED" />
    </div>
  ),
};
