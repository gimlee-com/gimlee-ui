import React, { forwardRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from '../../../components/uikit/Icon/Icon';
import styles from './NotificationBell.module.scss';

interface NotificationBellProps {
  unreadCount: number;
  onClick?: () => void;
  className?: string;
}

const springTransition = { type: 'spring' as const, stiffness: 400, damping: 40 };

const formatCount = (count: number): string => {
  if (count > 99) return '99+';
  return String(count);
};

export const NotificationBell = forwardRef<HTMLDivElement, NotificationBellProps>(
  ({ unreadCount, onClick, className }, ref) => {
    return (
      <div
        ref={ref}
        className={`${styles.bell}${className ? ` ${className}` : ''}`}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.();
          }
        }}
      >
        <Icon icon="bell" ratio={1.2} />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              className={styles.badge}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={springTransition}
            >
              {formatCount(unreadCount)}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    );
  }
);
