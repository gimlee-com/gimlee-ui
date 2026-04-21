import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { AvatarWithPresence } from '../AvatarWithPresence';
import { Nav, NavItem, NavDivider } from '../uikit/Nav/Nav';
import { Icon } from '../uikit/Icon/Icon';
import { CountrySelector } from '../CountrySelector/CountrySelector';
import type { Theme } from '../../context/ThemeContext';
import type { UserProfileDto, PresenceStatus } from '../../types/api';
import styles from './SidebarMenu.module.scss';

const THEMES: Theme[] = ['light', 'dark', 'dark-unicorn', 'iron-age'];

interface SidebarMenuProps {
  isAuthenticated: boolean;
  username: string | null;
  userProfile: UserProfileDto | null;
  roles: string[];
  presence: { status?: PresenceStatus; customStatus?: string } | null;
  theme: Theme;
  setTheme: (t: Theme) => void;
  notifUnreadCount: number;
  guestCountryCode: string | null;
  setGuestCountryCode: (code: string | null) => void;
  onLogout: (e: React.MouseEvent) => void;
  onRequestClose: () => void;
  isMenuOpen: boolean;
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring' as const, stiffness: 400, damping: 40 },
  },
};

const SidebarMenu: React.FC<SidebarMenuProps> = ({
  isAuthenticated,
  username,
  userProfile,
  roles,
  presence,
  theme,
  setTheme,
  notifUnreadCount,
  guestCountryCode,
  setGuestCountryCode,
  onLogout,
  onRequestClose,
  isMenuOpen,
}) => {
  const { t } = useTranslation();

  const handleNav = (e?: React.MouseEvent) => {
    // Allow the Link to navigate normally, but close the sidebar
    void e;
    onRequestClose();
  };

  const handleLogout = (e: React.MouseEvent) => {
    onRequestClose();
    onLogout(e);
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  return (
    <AnimatePresence>
      {isMenuOpen && (
        <motion.div
          className={styles.sidebar}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {isAuthenticated ? (
            <AuthenticatedMenu
              username={username}
              userProfile={userProfile}
              roles={roles}
              presence={presence}
              theme={theme}
              notifUnreadCount={notifUnreadCount}
              onNav={handleNav}
              onLogout={handleLogout}
              onThemeChange={handleThemeChange}
              t={t}
            />
          ) : (
            <GuestMenu
              theme={theme}
              guestCountryCode={guestCountryCode}
              setGuestCountryCode={setGuestCountryCode}
              onNav={handleNav}
              onThemeChange={handleThemeChange}
              t={t}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Authenticated Menu ---

interface AuthenticatedMenuProps {
  username: string | null;
  userProfile: UserProfileDto | null;
  roles: string[];
  presence: { status?: PresenceStatus; customStatus?: string } | null;
  theme: Theme;
  notifUnreadCount: number;
  onNav: (e?: React.MouseEvent) => void;
  onLogout: (e: React.MouseEvent) => void;
  onThemeChange: (t: Theme) => void;
  t: (key: string) => string;
}

const AuthenticatedMenu: React.FC<AuthenticatedMenuProps> = ({
  username,
  userProfile,
  roles,
  presence,
  theme,
  notifUnreadCount,
  onNav,
  onLogout,
  onThemeChange,
  t,
}) => (
  <>
    {/* User identity card */}
    <motion.div variants={itemVariants} className={styles.userCard}>
      <AvatarWithPresence
        username={username || ''}
        avatarUrl={userProfile?.avatarUrl}
        size={36}
        status={presence?.status}
        customStatus={presence?.customStatus}
        badgeSize={10}
      />
      <div className={styles.userCardInfo}>
        <div className={styles.userName}>{username}</div>
        <div className={styles.userRoles}>{roles.join(', ')}</div>
      </div>
    </motion.div>

    {/* Navigation sections */}
    <Nav variant="default" className={styles.nav}>
      {/* Marketplace */}
      <motion.li variants={itemVariants} className="uk-nav-header">
        <span className={styles.sectionHeader}>
          <Icon icon="search" ratio={0.7} />
          {t('navbar.sections.marketplace')}
        </span>
      </motion.li>
      <MotionNavItem variants={itemVariants}>
        <Link to="/ads" onClick={onNav}>{t('navbar.browseAds')}</Link>
      </MotionNavItem>

      <NavDivider />

      {/* My Account */}
      <motion.li variants={itemVariants} className="uk-nav-header">
        <span className={styles.sectionHeader}>
          <Icon icon="user" ratio={0.7} />
          {t('navbar.sections.account')}
        </span>
      </motion.li>
      <MotionNavItem variants={itemVariants}>
        <Link to="/sales/ads" onClick={onNav}>{t('navbar.myAds')}</Link>
      </MotionNavItem>
      <MotionNavItem variants={itemVariants}>
        <Link to="/purchases" onClick={onNav}>{t('navbar.purchases')}</Link>
      </MotionNavItem>
      <MotionNavItem variants={itemVariants}>
        <Link to="/watchlist" onClick={onNav}>{t('navbar.watchlist')}</Link>
      </MotionNavItem>
      <MotionNavItem variants={itemVariants}>
        <Link to="/conversations" onClick={onNav}>{t('chat.conversations')}</Link>
      </MotionNavItem>
      <MotionNavItem variants={itemVariants}>
        <Link to="/notifications" onClick={onNav}>
          <Icon icon="bell" className="uk-margin-small-right" ratio={0.8} />
          {t('notifications.title')}
          {notifUnreadCount > 0 && (
            <span className={styles.notifBadge}>
              {notifUnreadCount > 99 ? '99+' : notifUnreadCount}
            </span>
          )}
        </Link>
      </MotionNavItem>

      <NavDivider />

      {/* Settings & Support */}
      <motion.li variants={itemVariants} className="uk-nav-header">
        <span className={styles.sectionHeader}>
          <Icon icon="cog" ratio={0.7} />
          {t('navbar.sections.settings')}
        </span>
      </motion.li>
      <MotionNavItem variants={itemVariants}>
        <Link to="/profile" onClick={onNav}>{t('navbar.profile')}</Link>
      </MotionNavItem>
      <MotionNavItem variants={itemVariants}>
        <Link to="/profile/tickets" onClick={onNav}>{t('navbar.support')}</Link>
      </MotionNavItem>
      <MotionNavItem variants={itemVariants}>
        <Link to="/terms" onClick={onNav}>{t('navbar.terms')}</Link>
      </MotionNavItem>
      {(roles.includes('ADMIN') || roles.includes('SUPPORT')) && (
        <MotionNavItem variants={itemVariants}>
          <Link to="/admin" onClick={onNav}>{t('navbar.admin')}</Link>
        </MotionNavItem>
      )}

      <NavDivider />

      {/* Appearance */}
      <motion.li variants={itemVariants} className="uk-nav-header">
        <span className={styles.sectionHeader}>
          <Icon icon="paint-bucket" ratio={0.7} />
          {t('navbar.sections.appearance')}
        </span>
      </motion.li>
      <motion.li variants={itemVariants}>
        <ThemeSwitcher theme={theme} onThemeChange={onThemeChange} t={t} />
      </motion.li>

      <NavDivider />

      {/* Logout */}
      <motion.li variants={itemVariants}>
        <button type="button" className={styles.logoutButton} onClick={handleLogoutClick(onLogout)}>
          {t('navbar.logout')}
        </button>
      </motion.li>
    </Nav>
  </>
);

// --- Guest Menu ---

interface GuestMenuProps {
  theme: Theme;
  guestCountryCode: string | null;
  setGuestCountryCode: (code: string | null) => void;
  onNav: (e?: React.MouseEvent) => void;
  onThemeChange: (t: Theme) => void;
  t: (key: string) => string;
}

const GuestMenu: React.FC<GuestMenuProps> = ({
  theme,
  guestCountryCode,
  setGuestCountryCode,
  onNav,
  onThemeChange,
  t,
}) => (
  <Nav variant="default" className={styles.nav}>
    {/* Marketplace */}
    <motion.li variants={itemVariants} className="uk-nav-header">
      <span className={styles.sectionHeader}>
        <Icon icon="search" ratio={0.7} />
        {t('navbar.sections.marketplace')}
      </span>
    </motion.li>
    <MotionNavItem variants={itemVariants}>
      <Link to="/ads" onClick={onNav}>{t('navbar.browseAds')}</Link>
    </MotionNavItem>

    <NavDivider />

    {/* Account */}
    <motion.li variants={itemVariants} className="uk-nav-header">
      <span className={styles.sectionHeader}>
        <Icon icon="sign-in" ratio={0.7} />
        {t('navbar.sections.account')}
      </span>
    </motion.li>
    <MotionNavItem variants={itemVariants}>
      <Link to="/login" onClick={onNav}>{t('navbar.login')}</Link>
    </MotionNavItem>
    <MotionNavItem variants={itemVariants}>
      <Link to="/register" onClick={onNav}>{t('navbar.register')}</Link>
    </MotionNavItem>

    <NavDivider />

    {/* Info */}
    <motion.li variants={itemVariants} className="uk-nav-header">
      <span className={styles.sectionHeader}>
        <Icon icon="info" ratio={0.7} />
        {t('navbar.sections.info')}
      </span>
    </motion.li>
    <MotionNavItem variants={itemVariants}>
      <Link to="/terms" onClick={onNav}>{t('navbar.terms')}</Link>
    </MotionNavItem>

    <NavDivider />

    {/* Appearance */}
    <motion.li variants={itemVariants} className="uk-nav-header">
      <span className={styles.sectionHeader}>
        <Icon icon="paint-bucket" ratio={0.7} />
        {t('navbar.sections.appearance')}
      </span>
    </motion.li>
    <motion.li variants={itemVariants}>
      <ThemeSwitcher theme={theme} onThemeChange={onThemeChange} t={t} />
    </motion.li>
    <motion.li variants={itemVariants}>
      <div className={styles.countrySection}>
        <div className={styles.countryLabel}>
          <Icon icon="world" ratio={0.7} />
          {t('navbar.country')}
        </div>
        <CountrySelector
          value={guestCountryCode}
          onChange={(code) => setGuestCountryCode(code)}
        />
      </div>
    </motion.li>
  </Nav>
);

// --- Shared Sub-components ---

const MotionNavItem = motion.create(NavItem);

interface ThemeSwitcherProps {
  theme: Theme;
  onThemeChange: (t: Theme) => void;
  t: (key: string) => string;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ theme, onThemeChange, t }) => (
  <div className={styles.themeSwitcher}>
    {THEMES.map((th) => (
      <button
        key={th}
        type="button"
        className={`${styles.themeButton}${theme === th ? ` ${styles.themeButtonActive}` : ''}`}
        onClick={() => onThemeChange(th)}
      >
        {t(`profile.themes.${th}`)}
      </button>
    ))}
  </div>
);

const handleLogoutClick = (onLogout: (e: React.MouseEvent) => void) => (e: React.MouseEvent) => {
  e.preventDefault();
  onLogout(e);
};

export default SidebarMenu;
