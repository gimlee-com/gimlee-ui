import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import UIkit from 'uikit';
import { motion, AnimatePresence } from 'motion/react';
import { paymentService } from '../../payments/services/paymentService';
import { userService } from '../services/userService';
import { useAuth } from '../../context/AuthContext';
import { usePresence } from '../../context/PresenceContext';
import { useTheme } from '../../context/ThemeContext';
import type { PirateChainTransaction, YCashTransaction, CurrencyDto, PresenceStatus } from '../../types/api';
import { Heading } from '../../components/uikit/Heading/Heading';
import { Button } from '../../components/uikit/Button/Button';
import { Alert } from '../../components/uikit/Alert/Alert';
import { Spinner } from '../../components/uikit/Spinner/Spinner';
import { Input, FormLabel, FormControls, FormMessage } from '../../components/Form/Form';
import { Dropdown } from '../../components/uikit/Dropdown/Dropdown';
import { Nav, NavItem } from '../../components/uikit/Nav/Nav';
import { Card, CardBody } from '../../components/uikit/Card/Card';
import { Grid } from '../../components/uikit/Grid/Grid';
import { Tab, TabItem } from '../../components/uikit/Tab/Tab';
import { SwitcherContainer } from '../../components/uikit/Switcher/Switcher';
import { TransactionCard } from '../components/TransactionCard';
import ChangePasswordCard from '../components/ChangePasswordCard/ChangePasswordCard';
import AvatarUploadCard from '../components/AvatarUploadCard/AvatarUploadCard';
import DeliveryAddressCard from '../components/DeliveryAddressCard/DeliveryAddressCard';
import { CountrySelector } from '../../components/CountrySelector/CountrySelector';

const springConfig = { type: 'spring', stiffness: 400, damping: 40 } as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.18
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      ...springConfig,
      when: 'beforeChildren' as const,
      staggerChildren: 0.05,
    }
  }
};

const cardItemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 500, damping: 35 }
  }
};

const ProfilePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, preferredCurrency, setPreferredCurrency, countryOfResidence, setCountryOfResidence } = useAuth();
  const { theme, setTheme } = useTheme();
  const { presence, updatePresence } = usePresence();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [arrrViewKey, setArrrViewKey] = useState('');
  const [yecViewKey, setYecViewKey] = useState('');
  const [arrrTransactions, setArrrTransactions] = useState<PirateChainTransaction[]>([]);
  const [yecTransactions, setYecTransactions] = useState<YCashTransaction[]>([]);
  const [currencies, setCurrencies] = useState<CurrencyDto[]>([]);
  const [currencySearch, setCurrencySearch] = useState('');
  const [loadingArrr, setLoadingArrr] = useState(true);
  const [loadingYec, setLoadingYec] = useState(true);
  const [loadingCurrencies, setLoadingCurrencies] = useState(true);
  const [savingArrr, setSavingArrr] = useState(false);
  const [savingYec, setSavingYec] = useState(false);
  const [savingCurrency, setSavingCurrency] = useState(false);
  const [savingCountry, setSavingCountry] = useState(false);
  const [savingPresence, setSavingPresence] = useState(false);
  const [customStatus, setCustomStatus] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (presence) {
      setCustomStatus(presence.customStatus || '');
    }
  }, [presence]);

  const handleUpdatePresence = async (status: PresenceStatus) => {
    setSavingPresence(true);
    setError(null);
    setSuccess(null);
    try {
      await updatePresence(status, customStatus);
      setSuccess(t('presence.statusUpdated'));
    } catch (err: unknown) {
      setError((err as Error).message || t('presence.failedToUpdate'));
    } finally {
      setSavingPresence(false);
    }
  };

  const handleCustomStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (presence) {
      handleUpdatePresence(presence.status);
    }
  };

  const [arrrError, setArrrError] = useState<string | null>(null);
  const [yecError, setYecError] = useState<string | null>(null);
  const [arrrFocused, setArrrFocused] = useState(false);
  const [yecFocused, setYecFocused] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [showArrrTransactions, setShowArrrTransactions] = useState(false);
  const [showYecTransactions, setShowYecTransactions] = useState(false);

  const filteredCurrencies = currencies.filter(c => 
    c.code.toLowerCase().includes(currencySearch.toLowerCase()) || 
    c.name.toLowerCase().includes(currencySearch.toLowerCase())
  ).slice(0, 10);

  useEffect(() => {
    paymentService.getCurrencies()
      .then(setCurrencies)
      .catch(() => {})
      .finally(() => setLoadingCurrencies(false));

    paymentService.getPirateChainTransactions()
      .then(setArrrTransactions)
      .catch(() => {}) // Ignore if not set up yet
      .finally(() => setLoadingArrr(false));

    paymentService.getYCashTransactions()
      .then(setYecTransactions)
      .catch(() => {}) // Ignore if not set up yet
      .finally(() => setLoadingYec(false));
  }, []);

  const handleLanguageChange = async (lang: string) => {
    setError(null);
    setArrrError(null);
    setYecError(null);
    setSuccess(null);
    i18n.changeLanguage(lang);
    if (isAuthenticated) {
      try {
        await userService.updateUserPreferences({ language: lang });
        setSuccess(t('profile.preferencesUpdated'));
      } catch {
        setError(t('profile.failedToSaveLanguage'));
      }
    }
  };

  const handleCurrencySelect = async (currencyCode: string) => {
    if (!isAuthenticated) return;
    
    if (dropdownRef.current) {
      UIkit.dropdown(dropdownRef.current).hide(false);
    }

    setSavingCurrency(true);
    setError(null);
    setArrrError(null);
    setYecError(null);
    setSuccess(null);
    try {
      await userService.updateUserPreferences({ preferredCurrency: currencyCode });
      setPreferredCurrency(currencyCode);
      setSuccess(t('profile.preferencesUpdated'));
      setCurrencySearch('');
    } catch (err: unknown) {
      setError((err as Error).message || t('profile.failedToSaveCurrency'));
    } finally {
      setSavingCurrency(false);
    }
  };

  const handleCountrySelect = async (code: string | null) => {
    if (!isAuthenticated || !code) return;
    setSavingCountry(true);
    setError(null);
    setSuccess(null);
    try {
      await userService.updateUserPreferences({ countryOfResidence: code });
      setCountryOfResidence(code);
      setSuccess(t('profile.preferencesUpdated'));
    } catch (err: unknown) {
      setError((err as Error).message || t('profile.failedToSaveCountry'));
    } finally {
      setSavingCountry(false);
    }
  };

  const handleSaveArrrViewKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingArrr(true);
    setError(null);
    setArrrError(null);
    setSuccess(null);
    try {
      await paymentService.addPirateChainViewKey(arrrViewKey);
      setSuccess(t('profile.keyUpdated'));
      setArrrViewKey('');
      // Refresh transactions
      const txs = await paymentService.getPirateChainTransactions();
      setArrrTransactions(txs);
    } catch (err: unknown) {
      setArrrError((err as Error).message || t('auth.errors.generic'));
      setArrrFocused(false);
    } finally {
      setSavingArrr(false);
    }
  };

  const handleSaveYecViewKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingYec(true);
    setError(null);
    setYecError(null);
    setSuccess(null);
    try {
      await paymentService.addYCashViewKey(yecViewKey);
      setSuccess(t('profile.keyUpdated'));
      setYecViewKey('');
      // Refresh transactions
      const txs = await paymentService.getYCashTransactions();
      setYecTransactions(txs);
    } catch (err: unknown) {
      setYecError((err as Error).message || t('auth.errors.generic'));
      setYecFocused(false);
    } finally {
      setSavingYec(false);
    }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      <Heading as="h2">{t('profile.title')}</Heading>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key="error"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={springConfig}
            style={{ overflow: 'hidden' }}
          >
            <Alert variant="danger" onClose={() => setError(null)}>{error}</Alert>
          </motion.div>
        )}
        {success && (
          <motion.div
            key="success"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={springConfig}
            style={{ overflow: 'hidden' }}
          >
            <Alert variant="success" onClose={() => setSuccess(null)}>{success}</Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={cardVariants} layout transition={springConfig}>
        <Card className="uk-margin-bottom">
          <CardBody>
            <motion.div variants={cardItemVariants}>
              <Heading as="h4">{t('profile.regionalSettings')}</Heading>
            </motion.div>

            <motion.div variants={cardItemVariants} className="uk-margin">
              <FormLabel>{t('profile.language')}</FormLabel>
              <div className="uk-button-group uk-margin-small-top uk-display-block">
                <Button
                  size="small"
                  variant={i18n.resolvedLanguage === 'en-US' ? 'primary' : 'default'}
                  onClick={() => handleLanguageChange('en-US')}
                >
                  English
                </Button>
                <Button
                  size="small"
                  variant={i18n.resolvedLanguage === 'pl-PL' ? 'primary' : 'default'}
                  onClick={() => handleLanguageChange('pl-PL')}
                >
                  Polski
                </Button>
              </div>
            </motion.div>

            <motion.div variants={cardItemVariants} className="uk-margin">
              <FormLabel>{t('profile.theme')}</FormLabel>
              <div className="uk-button-group uk-margin-small-top uk-display-block">
                <Button
                  size="small"
                  variant={theme === 'light' ? 'primary' : 'default'}
                  onClick={() => setTheme('light')}
                >
                  {t('profile.themes.light')}
                </Button>
                <Button
                  size="small"
                  variant={theme === 'dark' ? 'primary' : 'default'}
                  onClick={() => setTheme('dark')}
                >
                  {t('profile.themes.dark')}
                </Button>
                <Button
                  size="small"
                  variant={theme === 'dark-unicorn' ? 'primary' : 'default'}
                  onClick={() => setTheme('dark-unicorn')}
                >
                  {t('profile.themes.dark-unicorn')}
                </Button>
                <Button
                  size="small"
                  variant={theme === 'iron-age' ? 'primary' : 'default'}
                  onClick={() => setTheme('iron-age')}
                >
                  {t('profile.themes.iron-age')}
                </Button>
              </div>
            </motion.div>

            <motion.div variants={cardItemVariants} className="uk-margin">
              <FormLabel>{t('profile.preferredCurrency')}</FormLabel>
              <div className="uk-margin-small-top">
                {loadingCurrencies ? (
                  <Spinner />
                ) : (
                  <div className="uk-inline uk-width-1-1">
                    <span className="uk-form-icon" uk-icon="icon: search"></span>
                    <Input
                      className="uk-width-1-1"
                      placeholder={t('profile.searchCurrency')}
                      value={currencySearch}
                      onChange={(e) => setCurrencySearch(e.target.value)}
                      disabled={savingCurrency}
                    />
                    <Dropdown ref={dropdownRef} mode="click" pos="bottom-left" className="uk-width-1-1">
                      <Nav variant="dropdown">
                        {filteredCurrencies.map(c => (
                          <NavItem 
                            key={c.code} 
                            onClick={() => handleCurrencySelect(c.code)}
                            active={c.code === preferredCurrency}
                          >
                            <a href="#" onClick={(e) => e.preventDefault()}>
                              <strong>{c.code}</strong> - {c.name}
                            </a>
                          </NavItem>
                        ))}
                        {filteredCurrencies.length === 0 && (
                          <NavItem disabled>
                            {t('ads.noAdsFound')}
                          </NavItem>
                        )}
                      </Nav>
                    </Dropdown>
                  </div>
                )}
                {preferredCurrency && (
                  <div className="uk-margin-small-top uk-text-meta">
                    {t('profile.preferredCurrency')}: <strong>{preferredCurrency}</strong>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div variants={cardItemVariants} className="uk-margin">
              <FormLabel>{t('profile.countryOfResidence')}</FormLabel>
              <div className="uk-margin-small-top">
                <CountrySelector
                  value={countryOfResidence ?? null}
                  onChange={handleCountrySelect}
                  disabled={savingCountry}
                />
              </div>
            </motion.div>

            <motion.div variants={cardItemVariants}>
              <hr />
            </motion.div>

            <motion.div variants={cardItemVariants} className="uk-margin">
              <FormLabel>{t('presence.status')}</FormLabel>
              <div className="uk-button-group uk-margin-small-top uk-display-block">
                <Button
                  size="small"
                  variant={presence?.status === 'ONLINE' ? 'primary' : 'default'}
                  onClick={() => handleUpdatePresence('ONLINE')}
                  disabled={savingPresence}
                >
                  {t('presence.online')}
                </Button>
                <Button
                  size="small"
                  variant={presence?.status === 'AWAY' ? 'primary' : 'default'}
                  onClick={() => handleUpdatePresence('AWAY')}
                  disabled={savingPresence}
                >
                  {t('presence.away')}
                </Button>
                <Button
                  size="small"
                  variant={presence?.status === 'BUSY' ? 'primary' : 'default'}
                  onClick={() => handleUpdatePresence('BUSY')}
                  disabled={savingPresence}
                >
                  {t('presence.busy')}
                </Button>
              </div>
            </motion.div>

            <motion.div variants={cardItemVariants} className="uk-margin">
              <FormLabel>{t('presence.customMessage')}</FormLabel>
              <form onSubmit={handleCustomStatusSubmit} className="uk-margin-small-top">
                <Grid gap="small">
                  <div className="uk-width-expand">
                    <Input
                      className="uk-width-1-1"
                      placeholder={t('presence.customMessagePlaceholder')}
                      value={customStatus}
                      onChange={(e) => setCustomStatus(e.target.value)}
                      disabled={savingPresence}
                      maxLength={100}
                    />
                  </div>
                  <div className="uk-width-auto">
                    <Button 
                      type="submit" 
                      variant="primary" 
                      size="small"
                      disabled={savingPresence || customStatus === (presence?.customStatus || '')}
                    >
                      {savingPresence ? <Spinner ratio={0.5} /> : t('presence.updateStatus')}
                    </Button>
                  </div>
                </Grid>
              </form>
            </motion.div>
          </CardBody>
        </Card>
      </motion.div>

      <motion.div variants={cardVariants} layout transition={springConfig}>
        <AvatarUploadCard />
      </motion.div>

      <motion.div variants={cardVariants} layout transition={springConfig}>
        <ChangePasswordCard />
      </motion.div>

      <motion.div variants={cardVariants} layout transition={springConfig}>
        <DeliveryAddressCard />
      </motion.div>

      <motion.div variants={cardVariants} layout transition={springConfig}>
        <Card>
          <CardBody>
            <motion.div variants={cardItemVariants}>
              <Heading as="h4">{t('profile.sellingAndPayments')}</Heading>
            </motion.div>
            
            <motion.div variants={cardItemVariants}>
              <Tab connect="#selling-payments-switcher" animation="uk-animation-fade">
              <TabItem><a href="#">{t('profile.paymentMonitoring')}</a></TabItem>
              <TabItem><a href="#">{t('profile.paymentMonitoringYec')}</a></TabItem>
            </Tab>
            </motion.div>

            <motion.div variants={cardItemVariants}>
            <SwitcherContainer id="selling-payments-switcher" className="uk-margin-medium-top">
              <div>
                <p className="uk-text-meta">{t('profile.paymentDesc')}</p>

                <form onSubmit={handleSaveArrrViewKey}>
                  <FormControls>
                    <Grid gap="small">
                      <div className="uk-width-1-1 uk-width-expand@s">
                        <Input
                          className="uk-width-1-1"
                          type="text"
                          placeholder={t('profile.viewKeyPlaceholder')}
                          value={arrrViewKey}
                          onChange={(e) => {
                            setArrrViewKey(e.target.value);
                            if (arrrError) setArrrError(null);
                          }}
                          onFocus={() => setArrrFocused(true)}
                          onBlur={() => setArrrFocused(false)}
                          status={arrrError && !arrrFocused ? 'danger' : undefined}
                          required
                        />
                      </div>
                      <div className="uk-width-1-1 uk-width-auto@s">
                        <Button type="submit" variant="primary" className="uk-width-1-1" disabled={savingArrr || !arrrViewKey}>
                          {savingArrr ? <Spinner ratio={0.6} /> : t('profile.saveKey')}
                        </Button>
                      </div>
                    </Grid>
                    <AnimatePresence>
                      {arrrError && !arrrFocused && (
                        <FormMessage type="error">{arrrError}</FormMessage>
                      )}
                    </AnimatePresence>
                  </FormControls>
                </form>

                <div className="uk-margin-large-top">
                  <div className="uk-flex uk-flex-between@s uk-flex-middle uk-flex-column uk-flex-row@s uk-margin-small-bottom">
                    <Heading as="h4" className="uk-margin-remove uk-margin-small-bottom uk-margin-remove@s">{t('profile.recentTransactions')}</Heading>
                    <Button 
                      size="small" 
                      variant="link" 
                      className="uk-width-1-1 uk-width-auto@s"
                      onClick={() => setShowArrrTransactions(!showArrrTransactions)}
                    >
                      {showArrrTransactions ? t('profile.hideTransactions') : t('profile.showTransactions')}
                      <span className="uk-margin-small-left" uk-icon={showArrrTransactions ? 'chevron-up' : 'chevron-down'}></span>
                    </Button>
                  </div>
                  
                  <AnimatePresence>
                    {showArrrTransactions && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={springConfig}
                        style={{ overflow: 'hidden' }}
                      >
                        {loadingArrr ? (
                          <div className="uk-flex uk-flex-center uk-padding-small">
                            <Spinner />
                          </div>
                        ) : (
                          <div>
                            {arrrTransactions.map((tx, index) => (
                              <motion.div
                                key={tx.txid}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ ...springConfig, delay: index * 0.05 }}
                              >
                                <TransactionCard transaction={tx} currency="ARRR" />
                              </motion.div>
                            ))}
                            {arrrTransactions.length === 0 && (
                              <div className="uk-text-center uk-text-muted uk-padding-small">
                                {t('profile.noTransactions')}
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div>
                <p className="uk-text-meta">{t('profile.paymentDescYec')}</p>

                <form onSubmit={handleSaveYecViewKey}>
                  <FormControls>
                    <Grid gap="small">
                      <div className="uk-width-1-1 uk-width-expand@s">
                        <Input
                          className="uk-width-1-1"
                          type="text"
                          placeholder={t('profile.viewKeyPlaceholder')}
                          value={yecViewKey}
                          onChange={(e) => {
                            setYecViewKey(e.target.value);
                            if (yecError) setYecError(null);
                          }}
                          onFocus={() => setYecFocused(true)}
                          onBlur={() => setYecFocused(false)}
                          status={yecError && !yecFocused ? 'danger' : undefined}
                          required
                        />
                      </div>
                      <div className="uk-width-1-1 uk-width-auto@s">
                        <Button type="submit" variant="primary" className="uk-width-1-1" disabled={savingYec || !yecViewKey}>
                          {savingYec ? <Spinner ratio={0.6} /> : t('profile.saveKey')}
                        </Button>
                      </div>
                    </Grid>
                    <AnimatePresence>
                      {yecError && !yecFocused && (
                        <FormMessage type="error">{yecError}</FormMessage>
                      )}
                    </AnimatePresence>
                  </FormControls>
                </form>

                <div className="uk-margin-large-top">
                  <div className="uk-flex uk-flex-between@s uk-flex-middle uk-flex-column uk-flex-row@s uk-margin-small-bottom">
                    <Heading as="h4" className="uk-margin-remove uk-margin-small-bottom uk-margin-remove@s">{t('profile.recentTransactionsYec')}</Heading>
                    <Button 
                      size="small" 
                      variant="link" 
                      className="uk-width-1-1 uk-width-auto@s"
                      onClick={() => setShowYecTransactions(!showYecTransactions)}
                    >
                      {showYecTransactions ? t('profile.hideTransactions') : t('profile.showTransactions')}
                      <span className="uk-margin-small-left" uk-icon={showYecTransactions ? 'chevron-up' : 'chevron-down'}></span>
                    </Button>
                  </div>
                  
                  <AnimatePresence>
                    {showYecTransactions && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={springConfig}
                        style={{ overflow: 'hidden' }}
                      >
                        {loadingYec ? (
                          <div className="uk-flex uk-flex-center uk-padding-small">
                            <Spinner />
                          </div>
                        ) : (
                          <div>
                            {yecTransactions.map((tx, index) => (
                              <motion.div
                                key={tx.txid}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ ...springConfig, delay: index * 0.05 }}
                              >
                                <TransactionCard transaction={tx} currency="YEC" />
                              </motion.div>
                            ))}
                            {yecTransactions.length === 0 && (
                              <div className="uk-text-center uk-text-muted uk-padding-small">
                                {t('profile.noTransactions')}
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </SwitcherContainer>
            </motion.div>
          </CardBody>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ProfilePage;
