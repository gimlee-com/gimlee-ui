import React from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import type { ReportTimelineEntryDto } from '../../types/adminReport';
import styles from './ReportTimeline.module.scss';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 400, damping: 40 },
  },
} as const;

const actionIcons: Record<ReportTimelineEntryDto['action'], string> = {
  CREATED: 'plus',
  ASSIGNED: 'user',
  STATUS_CHANGED: 'refresh',
  NOTE_ADDED: 'comment',
  RESOLVED: 'check',
};

interface ReportTimelineProps {
  entries: ReportTimelineEntryDto[];
}

const ReportTimeline: React.FC<ReportTimelineProps> = ({ entries }) => {
  const { t } = useTranslation();

  if (entries.length === 0) return null;

  return (
    <motion.ul
      className={styles.timeline}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {entries.map((entry) => {
        const date = new Date(entry.createdAt / 1000).toLocaleString();

        return (
          <motion.li key={entry.id} className={styles.entry} variants={itemVariants}>
            <div className={styles.icon}>
              <span uk-icon={`icon: ${actionIcons[entry.action]}; ratio: 0.8`} />
            </div>
            <div className={styles.content}>
              <div>
                <span className="uk-text-bold">{entry.performedByUsername}</span>
                {' — '}
                {t(`admin.reports.timeline.action.${entry.action}`)}
              </div>
              {entry.detail && (
                <div className="uk-text-small uk-text-muted">{entry.detail}</div>
              )}
              <div className={styles.meta}>{date}</div>
            </div>
          </motion.li>
        );
      })}
    </motion.ul>
  );
};

export default ReportTimeline;
