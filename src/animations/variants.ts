import type { Variants, HTMLMotionProps } from 'motion/react';
import { spring, springSnappy } from './springs';

/**
 * Page-level container — fades in and staggers direct children.
 *
 * Usage: `<motion.div initial="hidden" animate="visible" variants={createPageContainerVariants()}>`
 */
export const createPageContainerVariants = (stagger = 0.08): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: stagger },
  },
});

/**
 * Standard page item — fade + slide up 20 px.
 * Pair with `createPageContainerVariants` on the parent.
 *
 * Usage: `<motion.div variants={pageItemVariants}>`
 */
export const pageItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: spring },
};

/**
 * Card-internal item — subtle fade + slide up 8 px.
 * Pair with `createCardContainerVariants` on the parent card wrapper.
 *
 * Usage: `<motion.div variants={cardItemVariants}>`
 */
export const cardItemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: springSnappy },
};

/**
 * Scale entrance — fade + scale from 0.95.
 * Used for grid cards (AdCard, SalesAdCard, order items).
 *
 * Usage: `<motion.div variants={scaleItemVariants}>`
 */
export const scaleItemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: spring },
};

/**
 * Expand / collapse — height 0 ↔ auto with fade.
 * Returns motion props for inline use (not variant-based).
 * Includes `overflow: hidden` to clip content during transition.
 *
 * Usage: `<motion.div {...expandCollapseProps}>`
 */
export const expandCollapseProps = {
  initial: { height: 0, opacity: 0 },
  animate: { height: 'auto', opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: spring,
  style: { overflow: 'hidden' as const },
} satisfies HTMLMotionProps<'div'>;

/**
 * Banner enter / exit — slide from top (y: −20).
 * Used for notification banners (BanNotificationBanner, VolatilityBanner).
 *
 * Usage: `<motion.div {...bannerProps}>`
 */
export const bannerProps = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: spring,
} satisfies HTMLMotionProps<'div'>;

/**
 * Card with child orchestration — animates itself, then staggers children.
 * Children should use `cardItemVariants`.
 *
 * Usage: `<motion.div variants={createCardContainerVariants()}>`
 */
export const createCardContainerVariants = (stagger = 0.05): Variants => ({
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      ...spring,
      when: 'beforeChildren' as const,
      staggerChildren: stagger,
    },
  },
});

/**
 * Timeline item — horizontal slide from left.
 * Used for chronological entries (ReportTimeline).
 *
 * Usage: `<motion.div variants={timelineItemVariants}>`
 */
export const timelineItemVariants: Variants = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: spring },
};
