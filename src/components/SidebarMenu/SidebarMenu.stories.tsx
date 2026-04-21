import type { Meta, StoryObj } from '@storybook/react-vite';
import SidebarMenu from './SidebarMenu';
import type { Theme } from '../../context/ThemeContext';

const meta: Meta<typeof SidebarMenu> = {
  title: 'Components/SidebarMenu',
  component: SidebarMenu,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 300, background: 'var(--global-background)', padding: 20 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    theme: {
      control: 'select',
      options: ['light', 'dark', 'dark-unicorn', 'iron-age'] as Theme[],
    },
  },
};

export default meta;
type Story = StoryObj<typeof SidebarMenu>;

const baseProps = {
  isMenuOpen: true,
  onRequestClose: () => console.log('close'),
  onLogout: () => console.log('logout'),
  setTheme: (t: Theme) => console.log('theme:', t),
  setGuestCountryCode: (c: string | null) => console.log('country:', c),
};

export const Authenticated: Story = {
  args: {
    ...baseProps,
    isAuthenticated: true,
    username: 'satoshi',
    userProfile: { userId: '1', avatarUrl: '', updatedAt: 0 },
    roles: ['USER'],
    presence: { status: 'ONLINE' },
    theme: 'dark',
    notifUnreadCount: 5,
    guestCountryCode: null,
  },
};

export const AuthenticatedAdmin: Story = {
  name: 'Authenticated (Admin)',
  args: {
    ...baseProps,
    isAuthenticated: true,
    username: 'admin_user',
    userProfile: { userId: '2', avatarUrl: '', updatedAt: 0 },
    roles: ['USER', 'ADMIN'],
    presence: { status: 'BUSY', customStatus: 'Reviewing reports' },
    theme: 'light',
    notifUnreadCount: 142,
    guestCountryCode: null,
  },
};

export const Guest: Story = {
  args: {
    ...baseProps,
    isAuthenticated: false,
    username: null,
    userProfile: null,
    roles: [],
    presence: null,
    theme: 'light',
    notifUnreadCount: 0,
    guestCountryCode: 'US',
  },
};

export const GuestDarkUnicorn: Story = {
  name: 'Guest (Dark Unicorn)',
  args: {
    ...baseProps,
    isAuthenticated: false,
    username: null,
    userProfile: null,
    roles: [],
    presence: null,
    theme: 'dark-unicorn',
    notifUnreadCount: 0,
    guestCountryCode: null,
  },
};
