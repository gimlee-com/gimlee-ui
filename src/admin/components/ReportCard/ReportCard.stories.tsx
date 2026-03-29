import type { Meta, StoryObj } from '@storybook/react';
import ReportCard from './ReportCard';
import type { ReportListItemDto } from '../../types/adminReport';

const baseReport: ReportListItemDto = {
  id: 'rpt-001',
  targetType: 'AD',
  targetId: 'ad-123',
  targetTitle: 'Suspicious Electronics Listing',
  reason: 'FRAUD',
  status: 'OPEN',
  reporterUsername: 'johndoe',
  reporterUserId: 'usr-001',
  assigneeUsername: null,
  assigneeUserId: null,
  createdAt: Date.now() * 1000,
  updatedAt: Date.now() * 1000,
  siblingCount: 1,
  description: 'This listing looks fraudulent.',
};

const meta: Meta<typeof ReportCard> = {
  title: 'Admin/ReportCard',
  component: ReportCard,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 600 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ReportCard>;

export const OpenReport: Story = {
  args: { report: baseReport },
};

export const InReview: Story = {
  args: {
    report: { ...baseReport, id: 'rpt-002', status: 'IN_REVIEW', assigneeUsername: 'admin1', reason: 'SPAM' },
  },
};

export const Resolved: Story = {
  args: {
    report: { ...baseReport, id: 'rpt-003', status: 'RESOLVED', reason: 'HARASSMENT', targetType: 'USER', targetTitle: 'Abusive User Profile' },
  },
};

export const Dismissed: Story = {
  args: {
    report: { ...baseReport, id: 'rpt-004', status: 'DISMISSED', reason: 'WRONG_CATEGORY' },
  },
};

export const MultipleSiblings: Story = {
  args: {
    report: { ...baseReport, id: 'rpt-005', siblingCount: 7, reason: 'COUNTERFEIT' },
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="uk-grid uk-grid-small uk-child-width-1-1" uk-grid="">
      <div><ReportCard report={baseReport} /></div>
      <div><ReportCard report={{ ...baseReport, id: 'rpt-r2', status: 'IN_REVIEW', reason: 'SPAM' }} /></div>
      <div><ReportCard report={{ ...baseReport, id: 'rpt-r3', status: 'RESOLVED', targetType: 'MESSAGE', targetTitle: 'Offensive Message' }} /></div>
      <div><ReportCard report={{ ...baseReport, id: 'rpt-r4', status: 'DISMISSED', reason: 'OTHER', siblingCount: 3 }} /></div>
    </div>
  ),
};
