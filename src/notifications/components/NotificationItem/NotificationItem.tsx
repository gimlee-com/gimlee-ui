import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../../components/uikit/Icon/Icon';
import {
  CATEGORY_ICON_MAP,
  SEVERITY_CLASS_MAP,
} from '../../types/notification';
import type { NotificationDto } from '../../types/notification';
import { mapSuggestedActionToUrl } from '../../utils/suggestedActionUtils';
import styles from './NotificationItem.module.scss';

interface NotificationItemProps {
  notification: NotificationDto;
  onRead?: (id: string) => void;
  onClose?: () => void;
}

const SEVERITY_STYLE_MAP: Record<string, string> = {
  info: styles.severityInfo,
  success: styles.severitySuccess,
  warning: styles.severityWarning,
  danger: styles.severityDanger,
};

function getRelativeTime(epochMicros: number, t: (key: string) => string): string {
  const now = Date.now();
  const diffSec = Math.floor((now - epochMicros / 1000) / 1000);

  if (diffSec < 60) return t('notifications.justNow');

  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

  if (diffSec < 3600) return rtf.format(-Math.floor(diffSec / 60), 'minute');
  if (diffSec < 86400) return rtf.format(-Math.floor(diffSec / 3600), 'hour');
  if (diffSec < 2592000) return rtf.format(-Math.floor(diffSec / 86400), 'day');
  return rtf.format(-Math.floor(diffSec / 2592000), 'month');
}

/**
 * Validates that an actionUrl is a safe internal route (relative path only).
 */
function isSafeActionUrl(url: string): boolean {
  return url.startsWith('/') && !url.startsWith('//');
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onRead,
  onClose,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const iconName = CATEGORY_ICON_MAP[notification.category] ?? 'bell';
  const severityClass = SEVERITY_CLASS_MAP[notification.severity] ?? '';
  const severityStyle = SEVERITY_STYLE_MAP[notification.severity] ?? '';

  const handleClick = () => {
    if (!notification.read) {
      onRead?.(notification.id);
    }

    let targetUrl: string | null = null;

    if (notification.suggestedAction) {
      targetUrl = mapSuggestedActionToUrl(notification.suggestedAction);
    } else if (notification.actionUrl && isSafeActionUrl(notification.actionUrl)) {
      targetUrl = notification.actionUrl;
    }

    if (targetUrl) {
      onClose?.();
      navigate(targetUrl);
    }
  };

  const classNames = [
    styles.item,
    severityStyle,
    !notification.read ? styles.unread : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames} onClick={handleClick} role="button" tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className={styles.iconWrapper}>
        <Icon icon={iconName} className={severityClass} />
      </div>
      <div className={styles.content}>
        <p className={styles.title}>{notification.title}</p>
        <p className={styles.message}>{notification.message}</p>
        <span className={styles.timestamp}>
          {getRelativeTime(notification.createdAt, t)}
        </span>
      </div>
    </div>
  );
};
