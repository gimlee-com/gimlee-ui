import type { Meta, StoryObj } from '@storybook/react';
import { BanNotificationBanner } from './BanNotificationBanner';
import { AuthContext } from '../../context/AuthContext';

const mockAuthValue = (overrides: Record<string, unknown>) => ({
  isAuthenticated: true,
  userId: 'user-1',
  userProfile: null,
  preferredCurrency: 'USD',
  setPreferredCurrency: () => {},
  username: 'testuser',
  roles: ['USER'],
  publicChatId: null,
  isBanned: false,
  banReason: null,
  bannedAt: null,
  bannedUntil: null,
  login: async () => {},
  logout: () => {},
  loading: false,
  refreshSession: async () => {},
  ...overrides,
});

const meta: Meta<typeof BanNotificationBanner> = {
  title: 'Components/BanNotificationBanner',
  component: BanNotificationBanner,
  tags: ['autodocs'],
  decorators: [
    (Story, context) => (
      <AuthContext.Provider value={mockAuthValue(context.args as Record<string, unknown>)}>
        <Story />
      </AuthContext.Provider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BanNotificationBanner>;

export const NotBanned: Story = {
  args: { isBanned: false } as unknown as Record<string, unknown>,
};

export const PermanentBan: Story = {
  args: {
    isBanned: true,
    banReason: 'Repeated violation of marketplace policies.',
    bannedAt: (Date.now() - 86400000) * 1000,
    bannedUntil: null,
  } as unknown as Record<string, unknown>,
};

export const TemporaryBan: Story = {
  args: {
    isBanned: true,
    banReason: 'Spam detected in ad listings.',
    bannedAt: (Date.now() - 3600000) * 1000,
    bannedUntil: (Date.now() + 86400000) * 1000, // 24h from now
  } as unknown as Record<string, unknown>,
};
