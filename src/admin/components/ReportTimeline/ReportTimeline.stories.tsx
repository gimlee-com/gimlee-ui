import type { Meta, StoryObj } from '@storybook/react';
import ReportTimeline from './ReportTimeline';
import type { ReportTimelineEntryDto } from '../../types/adminReport';

const now = Date.now() * 1000;
const hour = 3_600_000_000; // 1 hour in microseconds

const sampleEntries: ReportTimelineEntryDto[] = [
  {
    id: 'tl-1',
    action: 'CREATED',
    performedByUsername: 'johndoe',
    detail: null,
    createdAt: now - hour * 24,
  },
  {
    id: 'tl-2',
    action: 'ASSIGNED',
    performedByUsername: 'admin1',
    detail: 'Assigned to admin1',
    createdAt: now - hour * 20,
  },
  {
    id: 'tl-3',
    action: 'STATUS_CHANGED',
    performedByUsername: 'admin1',
    detail: 'Status changed from OPEN to IN_REVIEW',
    createdAt: now - hour * 18,
  },
  {
    id: 'tl-4',
    action: 'NOTE_ADDED',
    performedByUsername: 'admin1',
    detail: 'Contacted the seller for clarification.',
    createdAt: now - hour * 10,
  },
  {
    id: 'tl-5',
    action: 'RESOLVED',
    performedByUsername: 'admin1',
    detail: 'Content removed — listing violated TOS.',
    createdAt: now - hour * 2,
  },
];

const meta: Meta<typeof ReportTimeline> = {
  title: 'Admin/ReportTimeline',
  component: ReportTimeline,
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
type Story = StoryObj<typeof ReportTimeline>;

export const FullTimeline: Story = {
  args: { entries: sampleEntries },
};

export const SingleEntry: Story = {
  args: { entries: [sampleEntries[0]] },
};

export const Empty: Story = {
  args: { entries: [] },
};
