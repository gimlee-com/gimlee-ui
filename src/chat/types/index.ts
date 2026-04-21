import type { UserPresenceDto } from '../../types/api';

// --- Conversation Model ---

export type ConversationStatus = 'ACT' | 'LCK' | 'ARC' | 'ACTIVE' | 'LOCKED' | 'ARCHIVED';

export type ParticipantRole = 'OWN' | 'ADM' | 'MOD' | 'MBR' | 'OWNER' | 'ADMIN' | 'MODERATOR' | 'MEMBER';

export type MessageType = 'R' | 'S' | 'REGULAR' | 'SYSTEM';

export function isConversationLocked(status?: ConversationStatus): boolean {
  return status === 'LCK' || status === 'LOCKED';
}

export function isConversationArchived(status?: ConversationStatus): boolean {
  return status === 'ARC' || status === 'ARCHIVED';
}

export function isConversationActive(status?: ConversationStatus): boolean {
  return status === 'ACT' || status === 'ACTIVE';
}

export function isSystemMessage(messageType?: MessageType | string): boolean {
  return messageType === 'S' || messageType === 'SYSTEM';
}

export interface ConversationParticipantDto {
  userId: string;
  role: ParticipantRole;
  joinedAt: string; // ISO-8601
}

export interface ConversationDto {
  id: string;
  type: string; // opaque — consumers define semantics (e.g. "ORDER", "PRIVATE")
  participants: ConversationParticipantDto[];
  linkType?: string;
  linkId?: string;
  status: ConversationStatus;
  createdAt: string; // ISO-8601
  updatedAt?: string; // ISO-8601
  lastActivityAt: string; // ISO-8601
}

export interface OrderConversationResponseDto {
  conversation: ConversationDto;
  recentMessages: ChatMessageDto[];
}

// --- Chat Message Model ---

export type ChatItemType = 'MESSAGE' | 'DAYS-DIVIDER';

export interface ChatAuthorDto {
  userId: string;
  username: string;
  displayName?: string;
  avatar?: string;
  presence?: UserPresenceDto;
}

export interface ChatMessageDto {
  id: string;
  chatId: string;
  author: ChatAuthorDto;
  message: string;
  timestamp: string; // ISO format
  lastEdited?: string;
  sending?: boolean;
  error?: boolean;
  authorId?: string;
  messageType?: MessageType; // 'R' (regular) or 'S' (system), defaults to 'R'
  systemCode?: string; // opaque system message code (e.g. "purchase.status.complete")
  systemArgs?: Record<string, string>; // structured args for client-side rendering
}

export interface ChatDaysDivider {
  type: 'DAYS-DIVIDER';
  timestamp: string;
  id: string; // generated
}

export type ChatListItem = (ChatMessageDto & { type?: 'MESSAGE'; shouldAnimate?: boolean }) | ChatDaysDivider;

export interface ChatState {
  messages: ChatMessageDto[];
  loading: boolean;
  error: string | null;
  typingUsers: string[]; // usernames
}

export interface NewMessageRequestDto {
  message: string;
}

export interface InternalChatEvent {
  chatId: string;
  type: 'MESSAGE' | 'TYPING_INDICATOR';
  data: string | null;
  author: string;
  timestamp: string; // ISO format
  messageType?: MessageType;
  systemCode?: string;
  systemArgs?: Record<string, string>;
}

export type ChatEvent = InternalChatEvent[]; // Backend buffers events into an array
