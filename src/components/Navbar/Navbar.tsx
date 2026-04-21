import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'motion/react';
import UIkit from 'uikit';
import { useAuth } from '../../context/AuthContext';
import { useUIKit } from '../../hooks/useUIkit';
import { useAppSelector, useAppDispatch } from '../../store';
import { NAVBAR_PORTAL_ID } from './NavbarPortal';
import Logo from '../Logo/Logo';
import {
  Navbar as UkNavbar,
  NavbarLeft,
  NavbarRight,
  NavbarNav,
  NavbarItem,
  NavbarToggle,
} from '../uikit/Navbar/Navbar';
import { Icon } from '../uikit/Icon/Icon';
import { Container } from '../uikit/Container/Container';
import { Offcanvas, OffcanvasBar, OffcanvasClose } from '../uikit/Offcanvas/Offcanvas';
import { usePresence } from '../../context/PresenceContext';
import { useTheme } from '../../context/ThemeContext';
import { useGuestCountry } from '../../hooks/useGuestCountry';
import { NotificationBell } from '../../notifications/components/NotificationBell/NotificationBell';
import { NotificationPanel } from '../../notifications/components/NotificationPanel/NotificationPanel';
import { markOneRead as markOneReadAction, markAllReadInState } from '../../notifications/store/notificationSlice';
import { notificationService } from '../../notifications/services/notificationService';
import type { NotificationDto } from '../../notifications/types/notification';
import SidebarMenu from '../SidebarMenu/SidebarMenu';
import styles from './Navbar.module.scss';

const MotionLogo = motion.create(Logo);

const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, logout, userProfile, username, roles } = useAuth();
  const { presence } = usePresence();
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, backLink } = useAppSelector(state => state.navbar);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(scrollY.get() > 60);
  const { guestCountryCode, setGuestCountryCode } = useGuestCountry();
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const notificationPanelRef = useRef<HTMLDivElement>(null);
  const notificationBellRef = useRef<HTMLDivElement>(null);
  const appDispatch = useAppDispatch();

  const notifState = useAppSelector((state) => state.notifications);
  const notifUnreadCount = notifState.unreadCount;
  const notifLoading = notifState.queries.all?.loading ?? false;
  const notifItems: NotificationDto[] = (notifState.queries.all?.ids ?? [])
    .map((id) => notifState.entities.entities[id])
    .filter((n): n is NotificationDto => n != null);

  const notifMarkRead = useCallback(
    (id: string) => {
      appDispatch(markOneReadAction(id));
      notificationService.markRead(id).catch(() => {});
    },
    [appDispatch]
  );

  const notifMarkAllRead = useCallback(() => {
    appDispatch(markAllReadInState({}));
    notificationService.markAllRead().catch(() => {});
  }, [appDispatch]);

  const toggleNotificationPanel = useCallback(() => {
    setIsNotificationPanelOpen((prev) => !prev);
  }, []);

  const closeNotificationPanel = useCallback(() => {
    setIsNotificationPanelOpen(false);
  }, []);

  // Close notification panel on outside click
  useEffect(() => {
    if (!isNotificationPanelOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        notificationPanelRef.current &&
        !notificationPanelRef.current.contains(target) &&
        notificationBellRef.current &&
        !notificationBellRef.current.contains(target)
      ) {
        setIsNotificationPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotificationPanelOpen]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 60);
  });

  useEffect(() => {
    document.documentElement.style.setProperty('--navbar-height', isScrolled ? '60px' : '80px');
  }, [isScrolled]);

  const { ref: offcanvasRef, instance: offcanvasInstance } = useUIKit<
    UIkit.UIkitOffcanvasElement,
    HTMLDivElement
  >('offcanvas', {
    overlay: true,
    flip: true,
  });

  // Hide offcanvas when navigating to a new page
  useEffect(() => {
    if (offcanvasInstance && isMenuOpen) {
      offcanvasInstance.hide();
    }
    setIsNotificationPanelOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Sync isMenuOpen state with UIkit offcanvas events
  useEffect(() => {
    const el = offcanvasRef.current;
    if (!el) return;

    const handleShow = () => setIsMenuOpen(true);
    const handleHide = () => setIsMenuOpen(false);

    el.addEventListener('show', handleShow);
    el.addEventListener('hide', handleHide);

    return () => {
      el.removeEventListener('show', handleShow);
      el.removeEventListener('hide', handleHide);
    };
  }, [offcanvasRef]);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
    navigate('/');
  };

  const handleMenuClose = useCallback(() => {
    offcanvasInstance?.hide();
  }, [offcanvasInstance]);

  return (
    <>
      <div style={{ height: 80 }} />
      <motion.nav
        className={styles.navbarContainer}
        initial={false}
        animate={{
          height: isScrolled ? 60 : 80,
          backgroundColor: isScrolled ? 'var(--global-background)' : 'color-mix(in srgb, var(--global-background), transparent 100%)',
          boxShadow: isScrolled ? 'var(--navbar-shadow)' : '0 0 0 transparent',
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
      >
        <div className={styles.navbarWrapper}>
          <Container size="expand" className={styles.responsiveContainer}>
            <UkNavbar>
              <NavbarLeft 
                className={mode === 'focused' ? 'uk-flex-1' : undefined} 
                style={mode === 'focused' ? { minWidth: 0 } : undefined}
              >
                <AnimatePresence mode="wait">
                  {mode === 'default' ? (
                    <motion.div
                      key="default-left"
                      className="uk-flex uk-flex-middle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Link to="/" className={`uk-navbar-item uk-logo ${styles.logo}`}>
                        <MotionLogo
                          initial={false}
                          animate={{ 
                            height: isScrolled ? 30 : 40,
                            width: isScrolled ? 30 : 40
                          }}
                          transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                          className="uk-margin-right"
                          style={{ color: 'var(--global-primary-color)' }}
                          aria-label="Gimlee"
                        />
                      </Link>
                      <NavbarNav>
                        <NavbarItem>
                          <Link to="/ads">{t('navbar.browseAds')}</Link>
                        </NavbarItem>
                      </NavbarNav>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="focused-left"
                      className="uk-flex uk-flex-middle uk-flex-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ minWidth: 0 }}
                    >
                      <NavbarToggle
                        href={backLink || '#'}
                        onClick={(e) => {
                          e.preventDefault();
                          if (backLink && backLink !== '#') {
                            navigate(backLink);
                          } else {
                            navigate(-1);
                          }
                        }}
                        className={styles.hamburgerToggle}
                      >
                        <Icon icon="arrow-left" ratio={1.2} />
                      </NavbarToggle>
                      <div id={NAVBAR_PORTAL_ID} className="uk-navbar-item uk-flex-1 uk-flex-left" style={{ minWidth: 0, paddingLeft: 0 }} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </NavbarLeft>
              <NavbarRight>
                <NavbarNav>
                  {isAuthenticated && (
                    <NavbarItem className="uk-visible@m" style={{ position: 'relative' }}>
                      <NotificationBell
                        ref={notificationBellRef}
                        unreadCount={notifUnreadCount}
                        onClick={toggleNotificationPanel}
                      />
                      <AnimatePresence>
                        {isNotificationPanelOpen && (
                          <motion.div
                            ref={notificationPanelRef}
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ type: 'spring' as const, stiffness: 400, damping: 40 }}
                            style={{ position: 'absolute', top: '100%', right: 0, zIndex: 1020, marginTop: 8 }}
                          >
                            <NotificationPanel
                              notifications={notifItems}
                              unreadCount={notifUnreadCount}
                              loading={notifLoading}
                              onMarkRead={notifMarkRead}
                              onMarkAllRead={notifMarkAllRead}
                              onClose={closeNotificationPanel}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </NavbarItem>
                  )}
                  <NavbarItem>
                    <NavbarToggle uk-toggle="target: #mobile-menu" className={styles.hamburgerToggle}>
                      <AnimatePresence mode="wait" initial={false}>
                        {isMenuOpen ? (
                          <motion.span
                            key="close"
                            uk-icon="icon: close"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            style={{ display: 'inline-flex' }}
                          />
                        ) : (
                          <motion.span
                            key="menu"
                            uk-navbar-toggle-icon=""
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            style={{ display: 'inline-flex' }}
                          />
                        )}
                      </AnimatePresence>
                      {isAuthenticated && notifUnreadCount > 0 && !isMenuOpen && (
                        <span className={styles.notifDot} />
                      )}
                    </NavbarToggle>
                  </NavbarItem>
                </NavbarNav>
              </NavbarRight>
            </UkNavbar>
          </Container>
        </div>
      </motion.nav>

      <Offcanvas ref={offcanvasRef} id="mobile-menu" overlay flip>
        <OffcanvasBar>
          <OffcanvasClose />
          <div className="uk-margin-large-top">
            <SidebarMenu
              isAuthenticated={isAuthenticated}
              username={username}
              userProfile={userProfile}
              roles={roles}
              presence={presence}
              theme={theme}
              setTheme={setTheme}
              notifUnreadCount={notifUnreadCount}
              guestCountryCode={guestCountryCode}
              setGuestCountryCode={setGuestCountryCode}
              onLogout={handleLogout}
              onRequestClose={handleMenuClose}
              isMenuOpen={isMenuOpen}
            />
          </div>
        </OffcanvasBar>
      </Offcanvas>
    </>
  );
};

export default Navbar;
