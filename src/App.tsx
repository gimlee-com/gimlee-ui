import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { useAppSelector, useAppDispatch } from './store';
import { useTheme } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';
import { PurchaseModal } from './purchases/components/PurchaseModal';
import { rehydrateForUser, clearForLogout } from './store/purchaseSlice';
import { VolatilityBanner } from './payments/components/VolatilityBanner/VolatilityBanner';
import { BanNotificationBanner } from './components/BanNotificationBanner/BanNotificationBanner';
import './i18n';
import Navbar from './components/Navbar/Navbar';
import { FLOATING_BUTTON_CONTAINER_ID } from './components/FloatingButton/FloatingButtonPortal';
import styles from './components/FloatingButton/FloatingButton.module.scss';
import HomePage from './pages/HomePage';
import LoginPage from './auth/pages/LoginPage';
import RegisterPage from './auth/pages/RegisterPage';
import VerifyPage from './auth/pages/VerifyPage';
import AdListingPage from './ads/pages/AdListingPage';
import AdDetailsPage from './ads/pages/AdDetailsPage';
const SalesPages = lazy(() => import('./sales/pages/SalesPages'));
import PurchasesPage from './purchases/pages/PurchasesPage';
import UserSpacePage from './spaces/pages/UserSpacePage';
import AdWatchlistPage from './ads/pages/AdWatchlistPage';
const ProfilePages = lazy(() => import('./profile/pages/ProfilePages'));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage'));
const AdminPages = lazy(() => import('./admin/pages/AdminPages'));


function App() {
  const { activePurchase, isModalOpen } = useAppSelector(state => state.purchase);
  const { isAuthenticated, username } = useAuth();
  const dispatch = useAppDispatch();
  const { theme } = useTheme();

  useEffect(() => {
    if (isAuthenticated && username) {
      dispatch(rehydrateForUser(username));
    } else if (!isAuthenticated) {
      dispatch(clearForLogout());
    }
  }, [isAuthenticated, username, dispatch]);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const colorMap = {
        'light': '#ffffff',
        'dark': '#1a1a1a',
        'dark-unicorn': '#0f0c29',
        'iron-age': '#121415'
      };
      const styleMap = {
        'light': Style.Light,
        'dark': Style.Dark,
        'dark-unicorn': Style.Dark,
        'iron-age': Style.Dark
      };
      
      StatusBar.setBackgroundColor({ color: colorMap[theme] }).catch(() => {});
      StatusBar.setStyle({ style: styleMap[theme] }).catch(() => {});
      StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {});
    }
  }, [theme]);

  return (
    <div className="App">
      <Navbar />
      <main className="uk-section uk-section-default">
        <div className="uk-container">
          <VolatilityBanner />
          <BanNotificationBanner />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify" element={<VerifyPage />} />
            <Route path="/ads" element={<AdListingPage />} />
            <Route path="/ads/:id" element={<AdDetailsPage />} />
            <Route path="/watchlist" element={<AdWatchlistPage />} />
            <Route path="/sales/*" element={<Suspense><SalesPages /></Suspense>} />
            <Route path="/purchases" element={<PurchasesPage />} />
            <Route path="/profile/*" element={<Suspense><ProfilePages /></Suspense>} />
            <Route path="/u/:userName" element={<UserSpacePage />} />
            <Route path="/terms" element={<Suspense><TermsOfServicePage /></Suspense>} />
            <Route path="/admin/*" element={<Suspense><AdminPages /></Suspense>} />
          </Routes>
        </div>
      </main>
      {isAuthenticated && activePurchase && isModalOpen && (
        <PurchaseModal 
          purchase={activePurchase} 
        />
      )}
      <div id={FLOATING_BUTTON_CONTAINER_ID} className={styles.floatingButtonContainer} />
    </div>
  );
}

export default App;
