import type { Meta, StoryObj } from '@storybook/react';
import TicketCategoryBadge from './TicketCategoryBadge';
import type { TicketCategory } from '../../types/adminTicket';

const allCategories: TicketCategory[] = [
  'ACCOUNT_ISSUE', 'PAYMENT_PROBLEM', 'ORDER_DISPUTE',
  'TECHNICAL_BUG', 'FEATURE_REQUEST', 'SAFETY_CONCERN', 'OTHER',
];

const meta: Meta<typeof TicketCategoryBadge> = {
  title: 'Admin/HelpDesk/TicketCategoryBadge',
  component: TicketCategoryBadge,
  tags: ['autodocs'],
  argTypes: {
    category: {
      control: 'select',
      options: allCategories,
    },
  },
};

export default meta;
type Story = StoryObj<typeof TicketCategoryBadge>;

export const AccountIssue: Story = { args: { category: 'ACCOUNT_ISSUE' } };
export const PaymentProblem: Story = { args: { category: 'PAYMENT_PROBLEM' } };
export const OrderDispute: Story = { args: { category: 'ORDER_DISPUTE' } };
export const TechnicalBug: Story = { args: { category: 'TECHNICAL_BUG' } };
export const FeatureRequest: Story = { args: { category: 'FEATURE_REQUEST' } };
export const SafetyConcern: Story = { args: { category: 'SAFETY_CONCERN' } };
export const Other: Story = { args: { category: 'OTHER' } };

export const AllCategories: Story = {
  render: () => (
    <div className="uk-flex uk-flex-wrap" style={{ gap: '8px' }}>
      {allCategories.map((category) => (
        <TicketCategoryBadge key={category} category={category} />
      ))}
    </div>
  ),
};
