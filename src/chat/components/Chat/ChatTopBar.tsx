import React, { useMemo, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ChatListItem, ChatDaysDivider } from '../../types';
import { DaysDivider } from '../DaysDivider/DaysDivider';
import styles from './Chat.module.scss';

interface ChatTopBarProps {
  items: ChatListItem[];
  heights: Record<string, number>;
  scrollTop: number;
  isLoadingMore?: boolean;
}

export const CHAT_TOP_BAR_PORTAL_ID = 'chat-top-bar-portal';

export const ChatTopBarPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const el = document.getElementById(CHAT_TOP_BAR_PORTAL_ID);
    if (el && container !== el) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- DOM sync via MutationObserver pattern
      setContainer(el);
    }
    
    // In case the element appears later (e.g. during animation)
    const observer = new MutationObserver(() => {
      const el = document.getElementById(CHAT_TOP_BAR_PORTAL_ID);
      if (el && container !== el) {
        setContainer(el);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- container is state set by this effect; including it would cause unnecessary observer re-creation
  }, []);

  if (!container) return null;
  return createPortal(children, container);
};

export const ChatTopBar: React.FC<ChatTopBarProps> = React.memo(({ 
  items, 
  heights, 
  scrollTop,
  isLoadingMore 
}) => {
  const dividerInfo = useMemo(() => {
    const dividers: { index: number, offset: number, height: number, item: ChatDaysDivider }[] = [];
    let currentOffset = 0;
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const height = heights[item.id] || 50;
      
      if (item.type === 'DAYS-DIVIDER') {
        dividers.push({ 
          index: i, 
          offset: currentOffset, 
          height, 
          item 
        });
      }
      currentOffset += height;
    }
    return dividers;
  }, [items, heights]);

  let activeDividerInfo = null;
  for (let i = dividerInfo.length - 1; i >= 0; i--) {
    if (dividerInfo[i].offset <= scrollTop) {
      activeDividerInfo = dividerInfo[i];
      break;
    }
  }

  const nextDividerInfo = dividerInfo.find(d => d.offset > scrollTop);
  
  let shift = 0;
  if (activeDividerInfo && nextDividerInfo) {
    const distanceToNext = nextDividerInfo.offset - scrollTop;
    if (distanceToNext < activeDividerInfo.height) {
      shift = distanceToNext - activeDividerInfo.height;
    }
  }

  // We show the top bar if we are loading more OR if we have an active divider
  const showTopBar = isLoadingMore || activeDividerInfo;

  return (
    <div 
      className={styles.chatTopBar}
      style={{ transform: `translateY(${shift}px)` }}
    >
      {showTopBar && (
        <div
          style={{ 
            pointerEvents: 'auto' // Allow interaction with things in the portal if needed
          }}
        >
          {isLoadingMore ? (
            <div className="uk-flex uk-flex-center uk-padding-small">
              <div uk-spinner="ratio: 0.6"></div>
            </div>
          ) : activeDividerInfo && (
            <DaysDivider 
              date={activeDividerInfo.item.timestamp} 
              isSticky={true}
            />
          )}
          <div id={CHAT_TOP_BAR_PORTAL_ID} />
        </div>
      )}
    </div>
  );
});
