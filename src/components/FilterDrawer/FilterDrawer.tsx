import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { spring } from '../../animations/springs';
import { Button } from '../uikit/Button/Button';
import { Icon } from '../uikit/Icon/Icon';
import styles from './FilterDrawer.module.scss';

interface FilterDrawerProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({ children, defaultOpen = false }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [overflowVisible, setOverflowVisible] = useState(defaultOpen);

  const handleToggle = () => {
    if (isOpen) {
      setOverflowVisible(false);
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="uk-margin-small-bottom">
      <Button
        variant="text"
        size="small"
        onClick={handleToggle}
        className="uk-flex uk-flex-middle"
      >
        <Icon icon="settings" ratio={0.85} className="uk-margin-small-right" />
        {t('common.filters')}
        <Icon
          icon={isOpen ? 'chevron-up' : 'chevron-down'}
          ratio={0.7}
          className="uk-margin-small-left"
        />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={spring}
            className={overflowVisible ? styles.drawerOpen : styles.drawerClosed}
            onAnimationComplete={(definition) => {
              if (typeof definition === 'object' && 'opacity' in definition && definition.opacity === 1) {
                setOverflowVisible(true);
              }
            }}
          >
            <div className={styles.drawerContent}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
