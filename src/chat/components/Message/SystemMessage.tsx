import React from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../../components/uikit/Icon/Icon';
import type { ChatMessageDto } from '../../types';
import styles from './SystemMessage.module.scss';

interface SystemMessageProps {
  message: ChatMessageDto;
  style?: React.CSSProperties;
}

export const SystemMessage: React.FC<SystemMessageProps> = React.memo(({ message, style }) => {
  const { t } = useTranslation();

  const code = message.systemCode || 'unknown';
  const i18nKey = `chat.systemMessage.${code}`;
  const text = t(i18nKey, {
    defaultValue: t('chat.systemMessage.unknown'),
    ...message.systemArgs,
  });

  return (
    <div style={style} className={styles.systemMessage}>
      <div className={styles.systemBadge}>
        <Icon icon="info" ratio={0.75} />
        <span>{text}</span>
      </div>
    </div>
  );
});
