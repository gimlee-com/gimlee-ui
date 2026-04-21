import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardBody } from '../../../components/uikit/Card/Card';
import { Label } from '../../../components/uikit/Label/Label';
import { Icon } from '../../../components/uikit/Icon/Icon';
import { Avatar } from '../../../components/Avatar/Avatar';
import { useAuth } from '../../../context/AuthContext';
import type { ConversationDto } from '../../types';
import { isConversationActive, isConversationLocked } from '../../types';
import styles from './ConversationCard.module.scss';

interface ConversationCardProps {
  conversation: ConversationDto;
}

function formatRelativeTime(isoTimestamp: string): string {
  const ms = new Date(isoTimestamp).getTime();
  const now = Date.now();
  const diff = now - ms;

  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 604_800_000) return `${Math.floor(diff / 86_400_000)}d ago`;
  return new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export const ConversationCard: React.FC<ConversationCardProps> = ({ conversation }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useAuth();

  const counterparty = conversation.participants.find(p => p.userId !== userId);
  const counterpartyId = counterparty?.userId || 'unknown';

  const statusVariant = isConversationActive(conversation.status) ? 'success'
    : isConversationLocked(conversation.status) ? 'warning'
    : 'default';

  const statusLabel = isConversationActive(conversation.status) ? 'Active'
    : isConversationLocked(conversation.status) ? 'Locked'
    : 'Archived';

  const typeLabel = conversation.type === 'ORDER'
    ? t('chat.orderConversation')
    : t('chat.conversations');

  const handleClick = () => {
    navigate(`/conversations/${conversation.id}`, {
      state: { from: location.pathname + location.search },
    });
  };

  return (
    <Card className={styles.card} onClick={handleClick}>
      <CardBody className="uk-padding-small">
        <div className={styles.participantInfo}>
          <Avatar username={counterpartyId} size={40} />
          <div className={styles.nameBlock}>
            <div className={styles.username}>{counterpartyId}</div>
            <div className={styles.lastMessage}>
              {conversation.linkType === 'PRC' && (
                <>
                  <Icon icon="cart" ratio={0.7} className="uk-margin-small-right" />
                  {typeLabel}
                </>
              )}
              {!conversation.linkType && typeLabel}
            </div>
          </div>
          <div className={styles.statusBadge}>
            <Label variant={statusVariant} className="uk-text-small">
              {statusLabel}
            </Label>
          </div>
        </div>
        <div className={styles.meta}>
          <span className={styles.timestamp}>
            <Icon icon="clock" ratio={0.7} className="uk-margin-small-right" />
            {formatRelativeTime(conversation.lastActivityAt)}
          </span>
          {conversation.participants.length > 0 && (
            <span className="uk-text-meta uk-text-small">
              {conversation.participants.length} {t('chat.participants').toLowerCase()}
            </span>
          )}
        </div>
      </CardBody>
    </Card>
  );
};
