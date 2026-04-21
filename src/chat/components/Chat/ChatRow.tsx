import React, { memo } from 'react';
import { Message } from '../Message/Message';
import { SystemMessage } from '../Message/SystemMessage';
import { DaysDivider } from '../DaysDivider/DaysDivider';

import type { ChatListItem } from '../../types';
import { isSystemMessage } from '../../types';

interface ChatRowProps {
  itemsRef: React.RefObject<ChatListItem[]>;
  popupContainer?: HTMLElement | null;
  index?: number;
  style?: React.CSSProperties;
  ariaAttributes?: {
    "aria-posinset": number;
    "aria-setsize": number;
    role: "listitem";
  };
}

const ChatRow = (props: ChatRowProps): React.ReactElement | null => {
  /* eslint-disable react-hooks/refs -- react-window row component; ref is read by virtualization callback outside React render */
  const { itemsRef, popupContainer, index, style } = props;
  if (index === undefined || !style || !itemsRef.current) return null;
  const chatItem = itemsRef.current[index];

  if (!chatItem) return null;

  if (chatItem.type === 'DAYS-DIVIDER') {
    return (
      <DaysDivider 
        date={chatItem.timestamp} 
        style={style} 
      />
    );
  }

  if (isSystemMessage(chatItem.messageType)) {
    return <SystemMessage message={chatItem} style={style} />;
  }

  return (
    <Message
      style={style}
      measuredHeight={typeof style.height === 'number' ? style.height : 0}
      popupContainer={popupContainer}
      {...chatItem}
    />
  );
  /* eslint-enable react-hooks/refs */
};

const MemoizedChatRow = memo(ChatRow, (prevProps, nextProps) => {
  // Ignore ariaAttributes for visual stability
  return (
    prevProps.index === nextProps.index &&
    prevProps.itemsRef === nextProps.itemsRef &&
    prevProps.popupContainer === nextProps.popupContainer &&
    // Check style properties individually if needed, but react-window handles style identity well
    prevProps.style?.transform === nextProps.style?.transform &&
    prevProps.style?.height === nextProps.style?.height
  );
});

export default MemoizedChatRow as typeof ChatRow;
