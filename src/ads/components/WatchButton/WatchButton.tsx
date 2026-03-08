import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import UIkit from 'uikit';
import { useAuth } from '../../../context/AuthContext';
import { watchlistService } from '../../services/watchlistService';
import { Icon } from '../../../components/uikit/Icon/Icon';
import styles from './WatchButton.module.scss';

type WatchButtonVariant = 'icon-button' | 'overlay';

interface WatchButtonProps {
  adId: string;
  isWatched: boolean;
  onToggle?: (isWatched: boolean) => void;
  variant?: WatchButtonVariant;
  className?: string;
}

const heartVariants = {
  initial: { scale: 1 },
  watched: { 
    scale: [1, 1.3, 1],
    transition: { duration: 0.25, ease: 'easeInOut' as const }
  },
  unwatched: { 
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 400, damping: 40 }
  }
};

export const WatchButton: React.FC<WatchButtonProps> = ({
  adId,
  isWatched,
  onToggle,
  variant = 'icon-button',
  className = '',
}) => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login', {
        state: { from: location.pathname + location.search },
      });
      return;
    }

    if (loading) return;

    // Optimistic update
    const newState = !isWatched;
    onToggle?.(newState);

    setLoading(true);
    try {
      if (newState) {
        await watchlistService.addToWatchlist(adId);
      } else {
        await watchlistService.removeFromWatchlist(adId);
      }
    } catch {
      // Revert on failure
      onToggle?.(isWatched);
      UIkit.notification({
        message: t('auth.errors.generic'),
        status: 'danger',
        pos: 'bottom-right',
      });
    } finally {
      setLoading(false);
    }
  };

  const variantClass = variant === 'overlay' ? styles.overlay : styles.iconButton;

  return (
    <button
      className={`${variantClass} ${isWatched ? styles.watched : ''} ${className}`}
      onClick={handleClick}
      disabled={loading}
      title={isWatched ? t('watchlist.removed') : t('watchlist.added')}
      aria-label={isWatched ? t('watchlist.removed') : t('watchlist.added')}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isWatched ? 'watched' : 'unwatched'}
          variants={heartVariants}
          initial="initial"
          animate={isWatched ? 'watched' : 'unwatched'}
          style={{ display: 'inline-flex' }}
        >
          <Icon icon="heart" ratio={variant === 'overlay' ? 0.9 : 1} />
        </motion.span>
      </AnimatePresence>
    </button>
  );
};
