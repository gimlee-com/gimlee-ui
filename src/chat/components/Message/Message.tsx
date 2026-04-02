import React from 'react';
import classNames from 'classnames';
import { useAuth } from '../../../context/AuthContext';
import type { ChatMessageDto } from '../../types';
import { MessageCard } from './MessageCard';
import { MessageContent } from './MessageContent';
import { Avatar } from '../../../components/Avatar/Avatar';
import { UserPopup } from '../../../components/UserPopup/UserPopup';
import ReportButton from '../../../components/ReportButton/ReportButton';
import styles from './Message.module.scss';

interface MessageProps extends ChatMessageDto {
  style?: React.CSSProperties;
  measuredHeight?: number;
  popupContainer?: HTMLElement | null;
}

export const Message: React.FC<MessageProps> = React.memo(({ 
  id,
  author, 
  message, 
  timestamp, 
  style,
  sending,
  error,
  popupContainer
}) => {
  const { username } = useAuth();
  const authorUsername = author?.username || 'unknown';
  const isOwn = username === authorUsername;

  const formattedTime = new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div 
      style={style} 
      className={classNames(
        styles.messageContainer,
        isOwn ? styles.own : styles.other
      )}
    >
      <div className={classNames(
        'uk-flex uk-flex-bottom uk-padding-small uk-padding-remove-top',
        isOwn ? 'uk-flex-right' : 'uk-flex-left'
      )}>
        {!isOwn && (
          <UserPopup 
            userId={author.userId}
            username={authorUsername} 
            avatarUrl={author.avatar} 
            status={author.presence?.status}
            customStatus={author.presence?.customStatus}
            pos="bottom-left"
            dropdownContainer={popupContainer}
          >
            <div className={classNames(styles.avatar, 'uk-margin-small-right')}>
              <Avatar 
                username={authorUsername} 
                avatarUrl={author.avatar} 
                size={32} 
              />
            </div>
          </UserPopup>
        )}
        
        <div className={styles.contentWrapper}>
          {!isOwn && <div className={styles.authorName}>{author?.displayName || authorUsername}</div>}
          <MessageCard own={isOwn}>
            <MessageContent message={message} />
            <div className={classNames(styles.meta, isOwn ? 'uk-text-right' : 'uk-text-left')}>
              <span className={styles.timestamp}>{formattedTime}</span>
              {sending && <span uk-spinner="ratio: 0.4" className="uk-margin-small-left"></span>}
              {error && <span className="uk-text-danger uk-margin-small-left">!</span>}
              {!isOwn && !sending && !error && (
                <ReportButton targetType="MESSAGE" targetId={id} className="uk-margin-small-left" />
              )}
            </div>
          </MessageCard>
        </div>

        {isOwn && (
          <UserPopup 
            userId={author.userId}
            username={authorUsername} 
            avatarUrl={author.avatar} 
            status={author.presence?.status}
            customStatus={author.presence?.customStatus}
            pos="bottom-right"
            dropdownContainer={popupContainer}
          >
            <div className={classNames(styles.avatar, 'uk-margin-small-left')}>
              <Avatar 
                username={authorUsername} 
                avatarUrl={author.avatar} 
                size={32} 
              />
            </div>
          </UserPopup>
        )}
      </div>
    </div>
  );
});
