import React, { useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchConversations } from '../store/conversationSlice';
import { ConversationCard } from '../components/ConversationCard/ConversationCard';
import { Heading } from '../../components/uikit/Heading/Heading';
import { Spinner } from '../../components/uikit/Spinner/Spinner';
import { Alert } from '../../components/uikit/Alert/Alert';
import { Button } from '../../components/uikit/Button/Button';
import { Grid } from '../../components/uikit/Grid/Grid';
import { createPageContainerVariants, pageItemVariants, scaleItemVariants } from '../../animations';

const ConversationsPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { conversations, loading, error, hasMore } = useAppSelector(state => state.conversations);

  useEffect(() => {
    dispatch(fetchConversations({}));
  }, [dispatch]);

  const loadMore = useCallback(() => {
    if (!hasMore || loading || conversations.length === 0) return;
    const lastConversation = conversations[conversations.length - 1];
    const beforeActivityAt = lastConversation.lastActivityAt;
    dispatch(fetchConversations({ beforeActivityAt }));
  }, [dispatch, conversations, hasMore, loading]);

  return (
    <motion.div
      variants={createPageContainerVariants()}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={pageItemVariants} className="uk-flex uk-flex-between uk-flex-middle uk-margin-bottom">
        <Heading as="h2">{t('chat.conversations')}</Heading>
      </motion.div>

      <AnimatePresence mode="wait">
        {loading && conversations.length === 0 ? (
          <motion.div
            key="spinner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="uk-flex uk-flex-center uk-margin-large-top"
          >
            <Spinner ratio={2} />
          </motion.div>
        ) : error ? (
          <motion.div key="error" variants={pageItemVariants}>
            <Alert variant="danger">{error}</Alert>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial="hidden"
            animate="visible"
            variants={createPageContainerVariants(0.05)}
          >
            <Grid gap="medium" className="uk-child-width-1-1 uk-child-width-1-2@m">
              <AnimatePresence mode="popLayout">
                {conversations.map((conversation) => (
                  <motion.div
                    key={conversation.id}
                    layout
                    variants={scaleItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <ConversationCard conversation={conversation} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </Grid>

            {conversations.length === 0 && (
              <motion.div
                variants={pageItemVariants}
                className="uk-text-center uk-text-muted uk-padding-large"
              >
                {t('chat.noConversations')}
              </motion.div>
            )}

            {hasMore && conversations.length > 0 && (
              <motion.div variants={pageItemVariants} className="uk-text-center uk-margin-large-top">
                <Button
                  variant="default"
                  onClick={loadMore}
                  disabled={loading}
                >
                  {loading ? <Spinner ratio={0.5} /> : t('chat.loadMoreConversations')}
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ConversationsPage;
