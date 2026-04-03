import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../store';
import Logo from '../Logo/Logo';
import styles from './Footer.module.scss';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const navbarMode = useAppSelector((state) => state.navbar.mode);

  if (navbarMode === 'focused') return null;

  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className="uk-container">
        <div className={`uk-grid uk-grid-medium uk-child-width-1-2@s uk-child-width-1-4@m ${styles.grid}`} uk-grid="">
          <div>
            <div className={styles.brand}>
              <Logo size={40} className={styles.logo} />
              <span className={styles.brandName}>Gimlee</span>
            </div>
            <p className={`uk-text-small uk-text-muted ${styles.tagline}`}>
              {t('footer.tagline')}
            </p>
          </div>

          <div>
            <h5 className={styles.heading}>{t('footer.platform')}</h5>
            <ul className={`uk-list ${styles.linkList}`}>
              <li><Link to="/ads">{t('navbar.browseAds')}</Link></li>
              <li><Link to="/about">{t('navbar.about')}</Link></li>
              <li><Link to="/faq">{t('navbar.faq')}</Link></li>
            </ul>
          </div>

          <div>
            <h5 className={styles.heading}>{t('footer.legal')}</h5>
            <ul className={`uk-list ${styles.linkList}`}>
              <li><Link to="/terms">{t('navbar.terms')}</Link></li>
            </ul>
          </div>

          <div>
            <h5 className={styles.heading}>{t('footer.contact')}</h5>
            <ul className={`uk-list ${styles.linkList}`}>
              <li>
                <a href="mailto:contact@gimlee.com">contact@gimlee.com</a>
              </li>
            </ul>
          </div>
        </div>

        <hr className={styles.divider} />

        <p className={`uk-text-small uk-text-center uk-text-muted ${styles.copyright}`}>
          {t('footer.copyright', { year })}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
