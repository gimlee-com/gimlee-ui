import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { spring } from '../../../animations/springs';
import styles from './StarRating.module.scss';

const STAR_PATH = 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z';

interface StarRatingProps {
  value: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (value: number) => void;
  className?: string;
}

export default function StarRating({
  value,
  maxStars = 5,
  size = 'md',
  interactive = false,
  onChange,
  className,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);
  const displayValue = hoverValue || value;

  const handleClick = useCallback(
    (star: number) => {
      if (interactive && onChange) {
        onChange(star === value ? 0 : star);
      }
    },
    [interactive, onChange, value]
  );

  const handleMouseEnter = useCallback(
    (star: number) => {
      if (interactive) setHoverValue(star);
    },
    [interactive]
  );

  const handleMouseLeave = useCallback(() => {
    if (interactive) setHoverValue(0);
  }, [interactive]);

  const sizeClass =
    size === 'sm' ? styles.sizeSm : size === 'lg' ? styles.sizeLg : styles.sizeMd;

  const stars = [];
  for (let i = 1; i <= maxStars; i++) {
    const filled = i <= Math.round(displayValue);

    if (interactive) {
      stars.push(
        <motion.span
          key={i}
          className={`${styles.star} ${filled ? styles.filled : ''}`}
          onClick={() => handleClick(i)}
          onMouseEnter={() => handleMouseEnter(i)}
          onMouseLeave={handleMouseLeave}
          whileTap={{ scale: 0.85 }}
          animate={{ scale: filled ? 1.1 : 1 }}
          transition={spring}
          role="radio"
          aria-checked={i === value}
          aria-label={`${i} star${i > 1 ? 's' : ''}`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClick(i);
            }
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d={STAR_PATH} />
          </svg>
        </motion.span>
      );
    } else {
      stars.push(
        <span
          key={i}
          className={`${styles.star} ${filled ? styles.filled : ''}`}
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d={STAR_PATH} />
          </svg>
        </span>
      );
    }
  }

  return (
    <span
      className={`${styles.starRating} ${sizeClass} ${interactive ? styles.interactive : ''} ${className || ''}`}
      role={interactive ? 'radiogroup' : undefined}
      aria-label={interactive ? undefined : `${displayValue} out of ${maxStars} stars`}
    >
      {stars}
    </span>
  );
}
