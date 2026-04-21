import React, { useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect } from 'react';
import { List } from 'react-window';
import { AutoSizer } from 'react-virtualized-auto-sizer';
import { useTranslation } from 'react-i18next';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../../context/AuthContext';
import { prepareChatListItems } from '../../utils/prepareChatListItems';
import { measureChatItems } from '../../utils/measureChatItems';
import type { ChatListItem, ConversationStatus } from '../../types';
import ChatRow from './ChatRow';
import { ChatTopBar } from './ChatTopBar';
import { TypingIndicator } from '../TypingIndicator/TypingIndicator';
import { TextArea } from '../../../components/uikit/Form/Form';
import { Icon } from '../../../components/uikit/Icon/Icon';
import styles from './Chat.module.scss';

interface ChatProps {
  chatId: string;
  className?: string;
  conversationStatus?: ConversationStatus;
}

// Interface for react-window VariableSizeList
interface VariableSizeList {
  readonly element: HTMLDivElement | null;
  scrollToRow: (config: {
    align?: 'auto' | 'center' | 'end' | 'smart' | 'start';
    behavior?: 'auto' | 'instant' | 'smooth';
    index: number;
  }) => void;
}

export const Chat: React.FC<ChatProps> = ({ chatId, className, conversationStatus }) => {
  const { t } = useTranslation();
  const { username } = useAuth();
  const { 
    messages, 
    loading, 
    typingUsers, 
    sendMessage, 
    sendTyping, 
    loadMore, 
    hasMore,
    isLocked,
    isArchived,
  } = useChat(chatId, conversationStatus);

  const canWrite = !isLocked && !isArchived;

  const [input, setInput] = useState('');
  const [heights, setHeights] = useState<Record<string, number>>({});
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [scrollTop, setScrollTop] = useState(0);
  
  // "Stick to bottom" state
  const isAtBottomRef = useRef(true);
  const pendingScrollToBottomRef = useRef(false);
  
  // Unread count logic
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Refs
  const listRef = useRef<VariableSizeList>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const prevLastMessageId = useRef<string | null>(null);
  const scrollAdjustmentRef = useRef<{ 
    diff: number, 
    type: 'PREPEND' | 'BOTTOM' | 'PREPEND_SMOOTH',
    targetIndex?: number
  } | null>(null);
  const lastPrependAdjustedIdRef = useRef<string | null>(null);
  const isMeasuringRef = useRef(false);
  
  // List state
  const [isPrepending, setIsPrepending] = useState(false);
  const [renderedItems, setRenderedItems] = useState<ChatListItem[]>([]);
  const [popupContainer, setPopupContainer] = useState<HTMLDivElement | null>(null);

  const preparedItems = useMemo(() => prepareChatListItems(messages), [messages]);
  const lastMessageId = preparedItems.length > 0 ? preparedItems[preparedItems.length - 1].id : null;

  const totalContentHeight = useMemo(() => {
    return renderedItems.reduce((sum, item) => sum + (heights[item.id] || 50), 0);
  }, [renderedItems, heights]);

  const itemsRef = useRef(renderedItems);
  // eslint-disable-next-line react-hooks/refs -- Sync ref for react-window callbacks outside React render
  itemsRef.current = renderedItems;
  const rowProps = useMemo(() => ({ 
    itemsRef,
    popupContainer
  }), [itemsRef, popupContainer]);

  // Reset state when chat changes
  useEffect(() => {
    setScrollTop(0);
    isAtBottomRef.current = true;
    pendingScrollToBottomRef.current = false;
    setUnreadCount(0);
    setHeights({});
    setRenderedItems([]);
    isMeasuringRef.current = false;
    prevLastMessageId.current = null;
    scrollAdjustmentRef.current = null;
    lastPrependAdjustedIdRef.current = null;
    setIsPrepending(false);
  }, [chatId]);

  // Sync prepend detection
  const prevFirstMessageIdRef = useRef<string | null>(null);
  const prevFirstMessageIndexRef = useRef<number>(-1);

  /* eslint-disable react-hooks/refs -- Intentional: previous-value refs for prepend detection (usePrevious pattern) */
  const prependDetection = useMemo(() => {
    const firstMessage = messages[0];
    if (!firstMessage || !prevFirstMessageIdRef.current || firstMessage.id === prevFirstMessageIdRef.current) {
      return null;
    }
    const newIndex = preparedItems.findIndex(item => item.id === prevFirstMessageIdRef.current);
    if (newIndex === -1 || newIndex <= prevFirstMessageIndexRef.current) return null;

    return {
      firstOldMessageId: prevFirstMessageIdRef.current,
      oldFirstMessageIndexInNew: newIndex,
      shift: newIndex - prevFirstMessageIndexRef.current
    };
  }, [messages, preparedItems]);
  /* eslint-enable react-hooks/refs */

  useEffect(() => {
    const firstMessage = messages[0];
    if (firstMessage) {
      prevFirstMessageIdRef.current = firstMessage.id;
      prevFirstMessageIndexRef.current = preparedItems.findIndex(item => item.id === firstMessage.id);
    }
  }, [messages, preparedItems]);

  // Measurement Logic
  useEffect(() => {
    if (!chatId || preparedItems.length === 0 || containerWidth === 0) return;

    const unmeasured = preparedItems.filter(item => !heights[item.id]);
    
    // If everything is already measured but renderedItems is out of sync
    if (unmeasured.length === 0) {
      if (renderedItems.length !== preparedItems.length) {
        setRenderedItems(preparedItems);
      }
      return;
    }

    if (isMeasuringRef.current) return;

    if (prependDetection) {
      setIsPrepending(true);
    }

    isMeasuringRef.current = true;
    measureChatItems(unmeasured, containerWidth, username || undefined).then(newHeights => {
      setIsPrepending(false);
      
      const allHeights = { ...heights, ...newHeights };

      if (prependDetection) {
        // PREPENDING: New items appeared at the top
        // Calculate REAL height difference to maintain scroll position
        let newOffset = 0;
        for (let i = 0; i < prependDetection.oldFirstMessageIndexInNew; i++) {
          const item = preparedItems[i];
          newOffset += (allHeights[item.id] || 50);
        }

        // Find the newest of the newly appeared messages to center it
        let lastNewMessageIndex = -1;
        for (let i = prependDetection.oldFirstMessageIndexInNew - 1; i >= 0; i--) {
          if (preparedItems[i].type === 'MESSAGE') {
            lastNewMessageIndex = i;
            break;
          }
        }
        const targetIndex = lastNewMessageIndex !== -1 ? lastNewMessageIndex : (prependDetection.oldFirstMessageIndexInNew - 1);

        // Set smooth scroll adjustment
        scrollAdjustmentRef.current = { 
          diff: newOffset, 
          type: 'PREPEND_SMOOTH', 
          targetIndex 
        };
      }

      // If we are supposed to stick to bottom, ensure we trigger a scroll after heights are updated
      if (pendingScrollToBottomRef.current) {
        scrollAdjustmentRef.current = { diff: 0, type: 'BOTTOM' };
      }

      setHeights(allHeights);
      setRenderedItems(preparedItems);
      isMeasuringRef.current = false;
    }).catch(err => {
      console.error('Measurement failed', err);
      setIsPrepending(false);
      isMeasuringRef.current = false;
    });
  }, [preparedItems, containerWidth, username, heights, chatId, renderedItems.length, prependDetection]);

  const showInitialLoading = (loading && messages.length === 0) || (messages.length > 0 && renderedItems.length === 0);

  // Auto-resize textarea
  useEffect(() => {
    const textArea = textAreaRef.current;
    if (textArea) {
      textArea.style.height = 'auto';
      textArea.style.height = `${Math.min(textArea.scrollHeight, 150)}px`;
    }
  }, [input]);

  // Handle new messages for stick-to-bottom and unread count
  useLayoutEffect(() => {
    if (lastMessageId !== prevLastMessageId.current) {
      if (prevLastMessageId.current === null) {
        pendingScrollToBottomRef.current = true;
        scrollAdjustmentRef.current = { diff: 0, type: 'BOTTOM' };
      } else {
        const lastItem = preparedItems[preparedItems.length - 1];
        const isMyMessage = lastItem.type !== 'DAYS-DIVIDER' && lastItem.author.username === username;
        
        const oldLastIndex = preparedItems.findIndex(item => item.id === prevLastMessageId.current);
        const appendedCount = oldLastIndex === -1 ? 1 : preparedItems.length - 1 - oldLastIndex;
        
        if (isAtBottomRef.current || isMyMessage) {
          pendingScrollToBottomRef.current = true;
          setUnreadCount(0);
          scrollAdjustmentRef.current = { diff: 0, type: 'BOTTOM' };
        } else {
          if (appendedCount > 0) {
            setUnreadCount(prev => prev + appendedCount);
          }
        }
      }
    }
    prevLastMessageId.current = lastMessageId;
  }, [lastMessageId, preparedItems, username]);

  // Initial scroll to bottom safety timeout
  useEffect(() => {
    if (pendingScrollToBottomRef.current && renderedItems.length > 0) {
      const timer = setTimeout(() => {
        if (pendingScrollToBottomRef.current && listRef.current?.element) {
          listRef.current.scrollToRow({ index: renderedItems.length - 1, align: 'end' });
          pendingScrollToBottomRef.current = false;
        }
      }, 400); // 400ms timeout for initial load as requested
      return () => clearTimeout(timer);
    }
  }, [renderedItems.length]);

  // Scroll management
  useLayoutEffect(() => {
    if (scrollAdjustmentRef.current && listRef.current?.element) {
      const { type, diff, targetIndex } = scrollAdjustmentRef.current;
      
      if (type === 'PREPEND') {
        listRef.current.element.scrollTop += diff;
      } else if (type === 'PREPEND_SMOOTH') {
        // Apply final correction from real measurement
        listRef.current.element.scrollTop += diff;
        
        // Gracefully scroll up to show the last of the new messages
        if (targetIndex !== undefined) {
          listRef.current.scrollToRow({ 
            index: targetIndex, 
            align: 'center', 
            behavior: 'smooth' 
          });
        }
      } else if (type === 'BOTTOM') {
        const scrollToIndex = renderedItems.length - 1;
        if (scrollToIndex >= 0) {
          listRef.current.scrollToRow({ index: scrollToIndex, align: 'end' });
          
          // Safety net: In case the list hasn't fully settled its scrollHeight,
          // repeat the scroll in the next frame.
          requestAnimationFrame(() => {
            if (listRef.current?.element && renderedItems.length > 0) {
              listRef.current.scrollToRow({ index: renderedItems.length - 1, align: 'end' });
            }
          });
        }
        
        const lastItem = renderedItems[renderedItems.length - 1];
        if (lastItem && heights[lastItem.id]) {
          pendingScrollToBottomRef.current = false;
        }
      }
      scrollAdjustmentRef.current = null;
    }
  }, [renderedItems, heights]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollOffset = target.scrollTop;

    setScrollTop(scrollOffset);

    const { clientHeight, scrollHeight } = target;
    
    // Check if we are near the bottom (within 50px)
    const atBottom = scrollHeight > 0 
      ? scrollHeight - (scrollOffset + clientHeight) <= 50
      : false;

    isAtBottomRef.current = atBottom;
    if (atBottom) {
      setUnreadCount(0);
    }

    // Load more when reaching the top
    if (scrollOffset === 0 && !pendingScrollToBottomRef.current && hasMore && !loading) {
      loadMore();
    }
  }, [hasMore, loading, loadMore]);

  const getItemSize = useCallback((index: number) => {
    const item = renderedItems[index];
    if (!item) return 50;
    return heights[item.id] || 50;
  }, [renderedItems, heights]);

  if (!chatId) return null;

  return (
    <div className={`${styles.chatContainer} ${className || ''} uk-flex uk-flex-column`}>
      <div className="uk-flex-1 uk-position-relative">
        <AutoSizer 
          style={{ height: '100%', width: '100%' }}
          onResize={({ width }) => {
            if (width > 0 && width !== containerWidth) setContainerWidth(width);
          }}
          renderProp={({ height, width }) => {
            if (!width || !height) return null;

            return (
              <div className="uk-position-relative" style={{ height, width }}>
                {showInitialLoading ? (
                  <div className="uk-position-center uk-text-center">
                    <div uk-spinner="ratio: 1.5"></div>
                    <p className="uk-text-muted uk-margin-small-top">{t('common.loading')}</p>
                  </div>
                ) : (
                  <>
                    {renderedItems.length === 0 && !loading ? (
                      <div className="uk-position-center uk-text-center">
                        <p className="uk-text-muted">{t('chat.noMessages')}</p>
                      </div>
                    ) : (
                      <div style={{ height, width, overflow: 'hidden' }}>
                        <List
                          key={chatId}
                          listRef={listRef}
                          style={{ height, width }}
                          rowCount={renderedItems.length}
                          rowHeight={getItemSize}
                          rowProps={rowProps}
                          rowComponent={ChatRow}
                          onRowsRendered={({ stopIndex }) => {
                            if (unreadCount > 0) {
                              const firstUnreadIndex = renderedItems.length - unreadCount;
                              if (stopIndex >= firstUnreadIndex) {
                                setUnreadCount(Math.max(0, renderedItems.length - 1 - stopIndex));
                              }
                            }
                          }}
                          onScroll={handleScroll}
                        >
                          {totalContentHeight > 0 && (
                            <div 
                              style={{ 
                                height: totalContentHeight, 
                                width: 0, 
                                position: 'absolute', 
                                top: 0, 
                                left: 0, 
                                pointerEvents: 'none',
                                visibility: 'hidden'
                              }} 
                            />
                          )}
                        </List>
                        <div ref={setPopupContainer} className={styles.popupPortalTarget} />
                        <ChatTopBar
                          items={renderedItems}
                          heights={heights}
                          scrollTop={scrollTop}
                          isLoadingMore={(loading && messages.length > 0) || isPrepending}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          }}
        />
        {unreadCount > 0 && (
          <div 
            className={styles.unreadNotification}
            onClick={() => {
              if (listRef.current) {
                const firstUnreadIndex = renderedItems.length - unreadCount;
                listRef.current.scrollToRow({ index: firstUnreadIndex, align: 'start' });
              }
            }}
          >
            {t('chat.newMessages', { count: unreadCount })}
          </div>
        )}
      </div>

      <div className={`${styles.footer} uk-padding-small uk-padding-remove-top`}>
        {isLocked && (
          <div className="uk-alert-warning uk-padding-small uk-border-rounded uk-margin-small-bottom uk-flex uk-flex-middle">
            <Icon icon="lock" ratio={0.8} className="uk-margin-small-right" />
            <span className="uk-text-small">{t('chat.conversationLocked')}</span>
          </div>
        )}
        {isArchived && (
          <div className="uk-alert-danger uk-padding-small uk-border-rounded uk-margin-small-bottom uk-flex uk-flex-middle">
            <Icon icon="ban" ratio={0.8} className="uk-margin-small-right" />
            <span className="uk-text-small">{t('chat.conversationArchived')}</span>
          </div>
        )}
        {canWrite && (
          <>
            <div className={styles.typingIndicatorContainer}>
              <TypingIndicator users={typingUsers} />
            </div>
            <form onSubmit={handleSend} className="uk-flex">
              <TextArea
                ref={textAreaRef}
                className="uk-margin-small-right"
                rows={1}
                placeholder={t('chat.placeholder')}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  sendTyping();
                }}
                onKeyDown={handleKeyDown}
                style={{ resize: 'none' }}
              />
              <button 
                type="submit" 
                className="uk-button uk-button-primary"
                disabled={!input.trim()}
              >
                {t('chat.send')}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
