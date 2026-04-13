import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { useNavbarMode } from '../hooks/useNavbarMode';
import NavbarPortal from '../components/Navbar/NavbarPortal';
import { Heading } from '../components/uikit/Heading/Heading';
import {
  Accordion,
  AccordionItem,
  AccordionTitle,
  AccordionContent,
} from '../components/uikit/Accordion/Accordion';
import styles from './FAQPage.module.scss';
import { createPageContainerVariants, pageItemVariants } from '../animations';

const FAQ_KEYS = [
  'whatIsGimlee',
  'howPaymentsWork',
  'whatIsViewingKey',
  'supportedCoins',
  'fees',
  'accountSecurity',
  'disputes',
  'createSpace',
] as const;

const FAQPage: React.FC = () => {
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
          {t('faq.title')}
        </Heading>
      </NavbarPortal>

      <motion.section variants={pageItemVariants} className={styles.hero}>
        <h1 className="uk-heading-medium uk-text-center">{t('faq.title')}</h1>
        <p className={`uk-text-lead uk-text-center uk-text-muted ${styles.subtitle}`}>
          {t('faq.subtitle')}
        </p>
      </motion.section>

      <motion.section variants={pageItemVariants} className={styles.content}>
        <Accordion collapsible multiple>
          {FAQ_KEYS.map((key, index) => (
            <AccordionItem key={key} open={index === 0}>
              <AccordionTitle className={styles.question}>
                {t(`faq.questions.${key}.q`)}
              </AccordionTitle>
              <AccordionContent>
                <p>{t(`faq.questions.${key}.a`)}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.section>
    </motion.div>
  );
};

export default FAQPage;
