import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { useNavbarMode } from '../hooks/useNavbarMode';
import NavbarPortal from '../components/Navbar/NavbarPortal';
import { Heading } from '../components/uikit/Heading/Heading';
import { Markdown } from '../components/Markdown/Markdown';
import { Spinner } from '../components/uikit/Spinner/Spinner';
import styles from './TermsOfServicePage.module.scss';
import { createPageContainerVariants, pageItemVariants } from '../animations';

const termsLoaders: Record<string, () => Promise<string>> = {
  'en-US': () => import('../legal/terms-en-US.md?raw').then(m => m.default),
  'pl-PL': () => import('../legal/terms-pl-PL.md?raw').then(m => m.default),
};

const TermsOfServicePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [content, setContent] = useState<string | null>(null);

  useNavbarMode('focused', '/');

  useEffect(() => {
    const loader = termsLoaders[i18n.language] ?? termsLoaders['en-US'];
    loader().then(setContent);
  }, [i18n.language]);

  return (
    <motion.div
      variants={createPageContainerVariants()}
      initial="hidden"
      animate="visible"
    >
      <NavbarPortal>
        <Heading as="h5" className="uk-margin-remove uk-text-truncate">
          {t('terms.title')}
        </Heading>
      </NavbarPortal>

      <motion.article variants={pageItemVariants} className={`uk-article ${styles.article}`}>
        <h1 className="uk-article-title">{t('terms.title')}</h1>
        <p className="uk-article-meta">{t('terms.lastUpdated')}</p>
        {content ? <Markdown content={content} /> : (
          <div className="uk-flex uk-flex-center uk-padding-large">
            <Spinner ratio={2} />
          </div>
        )}
      </motion.article>
    </motion.div>
  );
};

export default TermsOfServicePage;
