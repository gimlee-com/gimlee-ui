import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';

export interface FilterBadge {
  key: string;
  label: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

interface ActiveFilterBadgesProps {
  badges: FilterBadge[];
  onRemove: (key: string) => void;
}

export const ActiveFilterBadges: React.FC<ActiveFilterBadgesProps> = ({ badges, onRemove }) => {
  const { t } = useTranslation();
  if (badges.length === 0) return null;

  const getClassName = (variant?: string) => {
    const base = 'uk-label';
    if (!variant || variant === 'default') return base;
    return `${base} uk-label-${variant}`;
  };

  return (
    <div className="uk-flex uk-flex-wrap uk-margin-small-bottom" style={{ gap: '6px' }}>
      <AnimatePresence mode="popLayout">
        {badges.map(badge => (
          <motion.span
            key={badge.key}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={getClassName(badge.variant)}
          >
            {badge.label}
            <a
              className="uk-margin-small-left uk-text-white"
              onClick={() => onRemove(badge.key)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onRemove(badge.key)}
              aria-label={`${t('common.delete')} ${badge.label}`}
            >
              ×
            </a>
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
};
