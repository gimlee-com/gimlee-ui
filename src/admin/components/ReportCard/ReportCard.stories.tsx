import type { Meta, StoryObj } from '@storybook/react';
import ReportCard from './ReportCard';
import type { ReportListItemDto } from '../../types/adminReport';

const now = Date.now() * 1000;
const hoursAgo = (h: number) => now - h * 3600 * 1_000_000;

const adReport: ReportListItemDto = {
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
  createdAt: hoursAgo(2),
  updatedAt: hoursAgo(1),
  siblingCount: 3,
  description: 'This listing looks fraudulent. The price is way too low for this type of product.',
  targetSnapshot: {
    title: 'ARRR+YEC Ad Cozy Studio Apartment - Krakow',
    description: 'Charming studio apartment available for rent.',
    price: '337.92',
    currency: 'YEC',
    status: 'ACTIVE',
    mediaPaths: ['/019cab2d-a825-71eb-a3bd-80fbf5bb261a.jpg'],
    userId: 'usr-seller-001',
  },
};

const userReport: ReportListItemDto = {
  id: 'rpt-002',
  targetType: 'USER',
  targetId: 'usr-bad-001',
  targetTitle: 'playground_seller',
  reason: 'HARASSMENT',
  status: 'IN_REVIEW',
  reporterUsername: 'reporter42',
  reporterUserId: 'usr-042',
  assigneeUsername: 'admin1',
  assigneeUserId: 'usr-admin-001',
  createdAt: hoursAgo(24),
  updatedAt: hoursAgo(6),
  siblingCount: 1,
  description: 'This user is sending harassing messages to multiple sellers.',
  targetSnapshot: {
    username: 'playground_seller',
    displayName: 'Playground Seller',
    avatarUrl: null,
    status: 'ACTIVE',
  },
};

const questionReport: ReportListItemDto = {
  id: 'rpt-003',
  targetType: 'QUESTION',
  targetId: 'q-456',
  targetTitle: 'Is this product available in blue color? I really want to know because I need it urgently.',
  reason: 'SPAM',
  status: 'OPEN',
  reporterUsername: 'janedoe',
  reporterUserId: 'usr-jane',
  assigneeUsername: null,
  assigneeUserId: null,
  createdAt: hoursAgo(5),
  updatedAt: hoursAgo(5),
  siblingCount: 1,
  description: 'User keeps posting spam questions on multiple ads.',
  targetSnapshot: {
    adId: '69a5fbca6ccd454bf5682226',
    authorId: '69b860f75b22376791d5c9c6',
    text: 'Is this product available in blue color? I really want to know because I need it urgently for my project.',
    status: 'PENDING',
  },
};

const answerReport: ReportListItemDto = {
  id: 'rpt-004',
  targetType: 'ANSWER',
  targetId: 'a-789',
  targetTitle: 'Yes absolutely, contact me on external-scam-site.com for details!',
  reason: 'FRAUD',
  status: 'RESOLVED',
  reporterUsername: 'vigilant_user',
  reporterUserId: 'usr-vig',
  assigneeUsername: 'mod2',
  assigneeUserId: 'usr-mod-002',
  createdAt: hoursAgo(72),
  updatedAt: hoursAgo(12),
  siblingCount: 5,
  description: 'This answer is directing users to an external scam site.',
  targetSnapshot: {
    adId: '69a5fbca6ccd454bf5682226',
    authorId: '69b860f75b22376791d5c9c7',
    text: 'Yes absolutely, contact me on external-scam-site.com for details!',
    status: 'PENDING',
  },
};

const messageReport: ReportListItemDto = {
  id: 'rpt-005',
  targetType: 'MESSAGE',
  targetId: 'msg-101',
  targetTitle: 'Buy cheap crypto at scamcrypto.net now!!!',
  reason: 'SPAM',
  status: 'DISMISSED',
  reporterUsername: 'clean_user',
  reporterUserId: 'usr-clean',
  assigneeUsername: 'admin1',
  assigneeUserId: 'usr-admin-001',
  createdAt: hoursAgo(48),
  updatedAt: hoursAgo(24),
  siblingCount: 1,
  description: 'Spam message in our conversation.',
  targetSnapshot: {
    senderId: 'usr-spammer',
    text: 'Buy cheap crypto at scamcrypto.net now!!! Best deals guaranteed!',
    conversationId: 'conv-202',
  },
};

const noSnapshotReport: ReportListItemDto = {
  id: 'rpt-006',
  targetType: 'AD',
  targetId: 'ad-999',
  targetTitle: 'Fallback: Ad Without Snapshot Data',
  reason: 'WRONG_CATEGORY',
  status: 'OPEN',
  reporterUsername: 'tidy_admin',
  reporterUserId: 'usr-tidy',
  assigneeUsername: null,
  assigneeUserId: null,
  createdAt: hoursAgo(1),
  updatedAt: hoursAgo(1),
  siblingCount: 1,
  description: 'This ad is in the wrong category.',
};

const meta: Meta<typeof ReportCard> = {
  title: 'Admin/ReportCard',
  component: ReportCard,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 720 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ReportCard>;

export const AdReport: Story = {
  args: { report: adReport },
};

export const UserReport: Story = {
  args: { report: userReport },
};

export const QuestionReport: Story = {
  args: { report: questionReport },
};

export const AnswerReport: Story = {
  args: { report: answerReport },
};

export const MessageReport: Story = {
  args: { report: messageReport },
};

export const FallbackNoSnapshot: Story = {
  args: { report: noSnapshotReport },
};

export const AllStates: Story = {
  render: () => (
    <div className="uk-grid uk-grid-small uk-child-width-1-1" uk-grid="">
      <div><ReportCard report={adReport} /></div>
      <div><ReportCard report={userReport} /></div>
      <div><ReportCard report={questionReport} /></div>
      <div><ReportCard report={answerReport} /></div>
      <div><ReportCard report={messageReport} /></div>
      <div><ReportCard report={noSnapshotReport} /></div>
    </div>
  ),
};
