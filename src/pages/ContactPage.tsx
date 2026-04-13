import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { useNavbarMode } from '../hooks/useNavbarMode';
import NavbarPortal from '../components/Navbar/NavbarPortal';
import { Heading } from '../components/uikit/Heading/Heading';
import styles from './ContactPage.module.scss';
import { createPageContainerVariants, pageItemVariants } from '../animations';

const ContactPage: React.FC = () => {
  const { t } = useTranslation();

  useNavbarMode('focused', '/');

  return (
    <motion.div
      variants={createPageContainerVariants()}
      initial="hidden"
      animate="visible"
    >
      <NavbarPortal>
        <Heading as="h5" className="uk-margin-remove uk-text-truncate">
          {t('contact.title')}
        </Heading>
      </NavbarPortal>

      <motion.section variants={pageItemVariants} className={styles.hero}>
        <h1 className="uk-heading-medium uk-text-center">{t('contact.title')}</h1>
        <p className={`uk-text-lead uk-text-center uk-text-muted ${styles.subtitle}`}>
          {t('contact.subtitle')}
        </p>
      </motion.section>

      <motion.section variants={pageItemVariants} className={styles.content}>
        <div className={`uk-card uk-card-default uk-card-body ${styles.emailCard}`}>
          <span className={styles.emailIcon} uk-icon="icon: mail; ratio: 3" />
          <Heading as="h3" className="uk-text-center uk-margin-small-top">
            {t('contact.email.heading')}
          </Heading>
          <p className="uk-text-center uk-text-muted">
            {t('contact.email.text')}
          </p>
          <p className="uk-text-center uk-margin-small-top">
            <a
              href="mailto:contact@gimlee.com"
              className={`uk-text-large uk-text-bold ${styles.emailLink}`}
            >
              {t('contact.email.address')}
            </a>
          </p>
          <p className="uk-text-center uk-text-meta uk-margin-small-top">
            {t('contact.email.responseTime')}
          </p>
        </div>
      </motion.section>
    </motion.div>
  );
};

export default ContactPage;
