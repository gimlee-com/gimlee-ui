import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { useNavbarMode } from '../hooks/useNavbarMode';
import NavbarPortal from '../components/Navbar/NavbarPortal';
import { Heading } from '../components/uikit/Heading/Heading';
import styles from './AboutPage.module.scss';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 400, damping: 40 }
  }
} as const;

const AboutPage: React.FC = () => {
  const { t } = useTranslation();

  useNavbarMode('focused', '/');

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <NavbarPortal>
        <Heading as="h5" className="uk-margin-remove uk-text-truncate">
          {t('about.title')}
        </Heading>
      </NavbarPortal>

      <motion.section variants={itemVariants} className={styles.hero}>
        <h1 className="uk-heading-medium uk-text-center">{t('about.title')}</h1>
        <p className={`uk-text-lead uk-text-center uk-text-muted ${styles.subtitle}`}>
          {t('about.subtitle')}
        </p>
      </motion.section>

      <motion.section variants={itemVariants} className={`uk-section uk-section-small ${styles.section}`}>
        <Heading as="h2">{t('about.mission.heading')}</Heading>
        <p>{t('about.mission.text')}</p>
      </motion.section>

      <motion.section variants={itemVariants} className={`uk-section uk-section-small ${styles.section}`}>
        <Heading as="h2" className="uk-text-center uk-margin-medium-bottom">
          {t('about.features.heading')}
        </Heading>
        <div className="uk-grid uk-grid-match uk-child-width-1-3@m" uk-grid="">
          {(['p2p', 'nonCustodial', 'privacy'] as const).map((key) => (
            <div key={key}>
              <div className={`uk-card uk-card-default uk-card-body ${styles.featureCard}`}>
                <span className={styles.featureIcon} uk-icon={`icon: ${featureIcons[key]}; ratio: 2.5`} />
                <h3 className="uk-card-title uk-text-center">
                  {t(`about.features.${key}.title`)}
                </h3>
                <p className="uk-text-center">
                  {t(`about.features.${key}.description`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section variants={itemVariants} className={`uk-section uk-section-small ${styles.section}`}>
        <Heading as="h2">{t('about.cryptos.heading')}</Heading>
        <p>{t('about.cryptos.text')}</p>
      </motion.section>
    </motion.div>
  );
};

const featureIcons: Record<string, string> = {
  p2p: 'users',
  nonCustodial: 'lock',
  privacy: 'eye-slash',
};

export default AboutPage;
