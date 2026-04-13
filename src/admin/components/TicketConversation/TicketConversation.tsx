import React from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { createPageContainerVariants, pageItemVariants } from '../../../animations';
import type { TicketMessageDto } from '../../types/adminTicket';
import styles from './TicketConversation.module.scss';

const containerVariants = createPageContainerVariants(0.06);

interface TicketConversationProps {
  messages: TicketMessageDto[];
}

const TicketConversation: React.FC<TicketConversationProps> = ({ messages }) => {
  const { t } = useTranslation();

  if (messages.length === 0) {
    return (
      <div className="uk-text-center uk-text-muted uk-margin">
        {t('admin.helpdesk.conversation.empty')}
      </div>
    );
  }

  return (
    <motion.div
      className="uk-flex uk-flex-column"
      style={{ gap: '12px' }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {messages.map((msg) => {
        const isSupport = msg.authorRole === 'SUPPORT';
        const date = new Date(msg.createdAt / 1000).toLocaleString();

        return (
          <motion.div
            key={msg.id}
            variants={pageItemVariants}
            className={`uk-card uk-card-default uk-card-body uk-card-small ${styles.message} ${
              isSupport ? styles.supportMessage : styles.userMessage
            }`}
          >
            <div className="uk-flex uk-flex-middle uk-flex-wrap" style={{ gap: '6px' }}>
              <span className="uk-text-bold">@{msg.authorUsername}</span>
              <span className={`uk-label ${isSupport ? 'uk-label-success' : ''}`}>
                {t(`admin.helpdesk.conversation.role.${msg.authorRole}`)}
              </span>
            </div>
            <p className="uk-margin-small-top uk-margin-remove-bottom" style={{ whiteSpace: 'pre-wrap' }}>
              {msg.body}
            </p>
            <div className="uk-text-meta uk-margin-small-top">{date}</div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default TicketConversation;
