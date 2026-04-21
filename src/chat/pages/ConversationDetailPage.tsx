import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { conversationService } from '../services/conversationService';
import { useNavbarMode } from '../../hooks/useNavbarMode';
import NavbarPortal from '../../components/Navbar/NavbarPortal';
import { Chat } from '../components/Chat/Chat';
import { Spinner } from '../../components/uikit/Spinner/Spinner';
import { Alert } from '../../components/uikit/Alert/Alert';
import { Avatar } from '../../components/Avatar/Avatar';
import { useAuth } from '../../context/AuthContext';
import type { ConversationDto } from '../types';
import { pageItemVariants, createPageContainerVariants } from '../../animations';
import styles from './ConversationDetailPage.module.scss';

const ConversationDetailPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { t } = useTranslation();
  const { userId } = useAuth();
  const [conversation, setConversation] = useState<ConversationDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useNavbarMode('focused', '/conversations');

  useEffect(() => {
    if (!conversationId) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Reset state for new conversationId before async fetch
    setLoading(true);
    conversationService.getConversation(conversationId)
      .then((data) => { if (!cancelled) setConversation(data); })
      .catch((err) => { if (!cancelled) setError(err?.message || t('chat.conversationNotFound')); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [conversationId, t]);

  const counterparty = conversation?.participants.find(p => p.userId !== userId);
  const counterpartyId = counterparty?.userId;

  const typeLabel = conversation?.type === 'ORDER'
    ? t('chat.orderConversation')
    : t('chat.conversations');

  if (loading) {
    return (
      <div className="uk-flex uk-flex-center uk-margin-large-top">
        <Spinner ratio={2} />
      </div>
    );
  }

  if (error || !conversation || !conversationId) {
    return (
      <motion.div
        variants={createPageContainerVariants()}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={pageItemVariants}>
          <Alert variant="danger">{error || t('chat.conversationNotFound')}</Alert>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <>
      <NavbarPortal>
        <div className="uk-flex uk-flex-middle uk-flex-wrap" style={{ gap: '8px', minWidth: 0 }}>
          {counterpartyId && <Avatar username={counterpartyId} size={28} />}
          <div style={{ minWidth: 0 }}>
            <span className="uk-text-bold uk-text-truncate uk-display-block">
              {counterpartyId || t('chat.conversations')}
            </span>
            <span className="uk-text-meta uk-text-small">{typeLabel}</span>
          </div>
        </div>
      </NavbarPortal>

      <div className={styles.chatWrapper}>
        <Chat chatId={conversationId} conversationStatus={conversation.status} />
      </div>
    </>
  );
};

export default ConversationDetailPage;
