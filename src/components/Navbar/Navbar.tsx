import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'motion/react';
import UIkit from 'uikit';
import { useAuth } from '../../context/AuthContext';
import { useUIKit } from '../../hooks/useUIkit';
import { useAppSelector } from '../../store';
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
import { Nav, NavItem, NavHeader, NavDivider, SubNav } from '../uikit/Nav/Nav';
import { AvatarWithPresence } from '../AvatarWithPresence';
import { usePresence } from '../../context/PresenceContext';
import { useTheme } from '../../context/ThemeContext';
import styles from './Navbar.module.scss';

const MotionNavbarItem = motion.create(NavbarItem);
const MotionNavItem = motion.create(NavItem);
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

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 60);
  });

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

  const navLinks = (
    <AnimatePresence mode="wait">
      {isAuthenticated ? (
        <React.Fragment key="auth">
          <AnimatePresence>
            {mode === 'default' && (
              <MotionNavbarItem
                key="my-ads"
                className="uk-visible@m"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Link to="/sales/ads">{t('navbar.myAds')}</Link>
              </MotionNavbarItem>
            )}
            {mode === 'default' && (
              <MotionNavbarItem
                key="purchases"
                className="uk-visible@m"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, delay: 0.05 }}
              >
                <Link to="/purchases">{t('navbar.purchases')}</Link>
              </MotionNavbarItem>
            )}
            <MotionNavbarItem
              key="user-menu"
              className="uk-visible@m"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: mode === 'default' ? 0.1 : 0 }}
            >
              <Link to="#">
                <div className="uk-flex uk-flex-middle">
                  <AvatarWithPresence 
                    username={username || ''} 
                    avatarUrl={userProfile?.avatarUrl} 
                    size={32} 
                    status={presence?.status} 
                    customStatus={presence?.customStatus}
                    badgeSize={10}
                  />
                  <span className="uk-margin-small-left">{username}</span>
                  <span className="uk-margin-small-left" uk-icon="icon: triangle-down; ratio: 0.8"></span>
                </div>
              </Link>
              <div className="uk-navbar-dropdown" uk-dropdown="mode: click; pos: bottom-right">
                <Nav variant="dropdown">
                  <NavItem>
                    <Link to="/profile">
                      <Icon icon="user" className="uk-margin-small-right" />
                      {t('navbar.profile')}
                    </Link>
                  </NavItem>
                  <NavItem>
                    <Link to="/sales/ads">
                      <Icon icon="cart" className="uk-margin-small-right" />
                      {t('navbar.myAds')}
                    </Link>
                  </NavItem>
                  <NavItem>
                    <Link to="/purchases">
                      <Icon icon="bag" className="uk-margin-small-right" />
                      {t('navbar.purchases')}
                    </Link>
                  </NavItem>
                  <NavItem>
                    <Link to="/watchlist">
                      <Icon icon="heart" className="uk-margin-small-right" />
                      {t('navbar.watchlist')}
                    </Link>
                  </NavItem>
                  <NavItem>
                    <Link to="/terms">
                      <Icon icon="info" className="uk-margin-small-right" />
                      {t('navbar.terms')}
                    </Link>
                  </NavItem>
                  {(roles.includes('ADMIN') || roles.includes('SUPPORT')) && (
                    <>
                      <NavDivider />
                      <NavItem>
                        <Link to="/admin">
                          <Icon icon="cog" className="uk-margin-small-right" />
                          {t('navbar.admin')}
                        </Link>
                      </NavItem>
                    </>
                  )}
                  <NavDivider />
                  <NavHeader>{t('navbar.theme')}</NavHeader>
                  <NavItem active={theme === 'light'}>
                    <Link to="#" onClick={(e) => { e.preventDefault(); setTheme('light'); }}>
                      <Icon icon="bolt" className="uk-margin-small-right" />
                      {t('profile.themes.light')}
                    </Link>
                  </NavItem>
                  <NavItem active={theme === 'dark'}>
                    <Link to="#" onClick={(e) => { e.preventDefault(); setTheme('dark'); }}>
                      <Icon icon="star" className="uk-margin-small-right" />
                      {t('profile.themes.dark')}
                    </Link>
                  </NavItem>
                  <NavItem active={theme === 'dark-unicorn'}>
                    <Link to="#" onClick={(e) => { e.preventDefault(); setTheme('dark-unicorn'); }}>
                      <Icon icon="heart" className="uk-margin-small-right" />
                      {t('profile.themes.dark-unicorn')}
                    </Link>
                  </NavItem>
                  <NavItem active={theme === 'iron-age'}>
                    <Link to="#" onClick={(e) => { e.preventDefault(); setTheme('iron-age'); }}>
                      <Icon icon="nut" className="uk-margin-small-right" />
                      {t('profile.themes.iron-age')}
                    </Link>
                  </NavItem>
                  <NavDivider />
                  <NavItem>
                    <Link to="#" onClick={handleLogout}>
                      <Icon icon="sign-out" className="uk-margin-small-right" />
                      {t('navbar.logout')}
                    </Link>
                  </NavItem>
                </Nav>
              </div>
            </MotionNavbarItem>
          </AnimatePresence>
        </React.Fragment>
      ) : (
        <React.Fragment key="guest">
          <AnimatePresence>
            {mode === 'default' && (
              <MotionNavbarItem
                key="login"
                className="uk-visible@m"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Link to="/login">{t('navbar.login')}</Link>
              </MotionNavbarItem>
            )}
            {mode === 'default' && (
              <MotionNavbarItem
                key="register"
                className="uk-visible@m"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, delay: 0.05 }}
              >
                <Link to="/register">{t('navbar.register')}</Link>
              </MotionNavbarItem>
            )}
          </AnimatePresence>
        </React.Fragment>
      )}
    </AnimatePresence>
  );

  const offcanvasLinks = (
    <AnimatePresence mode="wait">
      {isMenuOpen && (
        isAuthenticated ? (
          <React.Fragment key="auth-off">
            <MotionNavItem
              key="user-info-off"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.05 }}
              className="uk-nav-header"
            >
              <div className="uk-flex uk-flex-middle">
                <AvatarWithPresence 
                  username={username || ''} 
                  avatarUrl={userProfile?.avatarUrl} 
                  size={40} 
                  status={presence?.status} 
                  customStatus={presence?.customStatus}
                  badgeSize={12}
                />
                <div className="uk-margin-small-left">
                  <div className="uk-text-bold uk-text-emphasis">{username}</div>
                  <div className="uk-text-meta uk-text-lowercase uk-text-truncate" style={{ maxWidth: '150px' }}>
                    {roles.join(', ')}
                  </div>
                </div>
              </div>
            </MotionNavItem>
            <MotionNavItem
              key="browse-off-auth"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <Link to="/ads" uk-toggle="target: #mobile-menu">{t('navbar.browseAds')}</Link>
            </MotionNavItem>
            <li className="uk-nav-divider"></li>
            <MotionNavItem
              key="my-ads-off"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.15 }}
            >
              <Link to="/sales/ads" uk-toggle="target: #mobile-menu">{t('navbar.myAds')}</Link>
            </MotionNavItem>
            <MotionNavItem
              key="purchases-off"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.2 }}
            >
              <Link to="/purchases" uk-toggle="target: #mobile-menu">{t('navbar.purchases')}</Link>
            </MotionNavItem>
            <MotionNavItem
              key="watchlist-off"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.22 }}
            >
              <Link to="/watchlist" uk-toggle="target: #mobile-menu">{t('navbar.watchlist')}</Link>
            </MotionNavItem>
            <MotionNavItem
              key="profile-off"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.25 }}
            >
              <Link to="/profile" uk-toggle="target: #mobile-menu">{t('navbar.profile')}</Link>
            </MotionNavItem>
            <MotionNavItem
              key="terms-off"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.27 }}
            >
              <Link to="/terms" uk-toggle="target: #mobile-menu">{t('navbar.terms')}</Link>
            </MotionNavItem>
            {(roles.includes('ADMIN') || roles.includes('SUPPORT')) && (
              <MotionNavItem
                key="admin-off"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, delay: 0.29 }}
              >
                <Link to="/admin" uk-toggle="target: #mobile-menu">
                  <Icon icon="cog" className="uk-margin-small-right" />
                  {t('navbar.admin')}
                </Link>
              </MotionNavItem>
            )}
            <li className="uk-nav-divider"></li>
            <MotionNavItem
              key="theme-off"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.3 }}
              parent
            >
              <Link to="#">
                <Icon icon="paint-bucket" className="uk-margin-small-right" />
                {t('navbar.theme')}: <span className="uk-text-bold">{t(`profile.themes.${theme}`)}</span>
              </Link>
              <SubNav>
                <NavItem active={theme === 'light'}><Link to="#" onClick={(e) => { e.preventDefault(); setTheme('light'); }} uk-toggle="target: #mobile-menu">{t('profile.themes.light')}</Link></NavItem>
                <NavItem active={theme === 'dark'}><Link to="#" onClick={(e) => { e.preventDefault(); setTheme('dark'); }} uk-toggle="target: #mobile-menu">{t('profile.themes.dark')}</Link></NavItem>
                <NavItem active={theme === 'dark-unicorn'}><Link to="#" onClick={(e) => { e.preventDefault(); setTheme('dark-unicorn'); }} uk-toggle="target: #mobile-menu">{t('profile.themes.dark-unicorn')}</Link></NavItem>
                <NavItem active={theme === 'iron-age'}><Link to="#" onClick={(e) => { e.preventDefault(); setTheme('iron-age'); }} uk-toggle="target: #mobile-menu">{t('profile.themes.iron-age')}</Link></NavItem>
              </SubNav>
            </MotionNavItem>
            <MotionNavItem
              key="logout-off"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.3 }}
            >
              <Link to="#" onClick={handleLogout} uk-toggle="target: #mobile-menu">{t('navbar.logout')}</Link>
            </MotionNavItem>
          </React.Fragment>
        ) : (
          <React.Fragment key="guest-off">
            <MotionNavItem
              key="browse-off-guest"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.05 }}
            >
              <Link to="/ads" uk-toggle="target: #mobile-menu">{t('navbar.browseAds')}</Link>
            </MotionNavItem>
            <MotionNavItem
              key="login-off"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <Link to="/login" uk-toggle="target: #mobile-menu">{t('navbar.login')}</Link>
            </MotionNavItem>
            <MotionNavItem
              key="register-off"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.15 }}
            >
              <Link to="/register" uk-toggle="target: #mobile-menu">{t('navbar.register')}</Link>
            </MotionNavItem>
            <MotionNavItem
              key="terms-off-guest"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.17 }}
            >
              <Link to="/terms" uk-toggle="target: #mobile-menu">{t('navbar.terms')}</Link>
            </MotionNavItem>
            <li className="uk-nav-divider"></li>
            <MotionNavItem
              key="theme-off-guest"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.2 }}
              parent
            >
              <Link to="#">
                <Icon icon="paint-bucket" className="uk-margin-small-right" />
                {t('navbar.theme')}: <span className="uk-text-bold">{t(`profile.themes.${theme}`)}</span>
              </Link>
              <SubNav>
                <NavItem active={theme === 'light'}><Link to="#" onClick={(e) => { e.preventDefault(); setTheme('light'); }} uk-toggle="target: #mobile-menu">{t('profile.themes.light')}</Link></NavItem>
                <NavItem active={theme === 'dark'}><Link to="#" onClick={(e) => { e.preventDefault(); setTheme('dark'); }} uk-toggle="target: #mobile-menu">{t('profile.themes.dark')}</Link></NavItem>
                <NavItem active={theme === 'dark-unicorn'}><Link to="#" onClick={(e) => { e.preventDefault(); setTheme('dark-unicorn'); }} uk-toggle="target: #mobile-menu">{t('profile.themes.dark-unicorn')}</Link></NavItem>
                <NavItem active={theme === 'iron-age'}><Link to="#" onClick={(e) => { e.preventDefault(); setTheme('iron-age'); }} uk-toggle="target: #mobile-menu">{t('profile.themes.iron-age')}</Link></NavItem>
              </SubNav>
            </MotionNavItem>
          </React.Fragment>
        )
      )}
    </AnimatePresence>
  );

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
                  {navLinks}
                  <NavbarItem className="uk-hidden@m">
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
          <Nav variant="primary" className="uk-margin-large-top">
            {offcanvasLinks}
          </Nav>
        </OffcanvasBar>
      </Offcanvas>
    </>
  );
};

export default Navbar;
