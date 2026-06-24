import React, { useRef, useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import MessageItem from './MessageItem';
import { useVirtualizer } from '@tanstack/react-virtual';

interface MessageListProps {
  roomId: string;
}

export function MessageList({ roomId }: MessageListProps) {
  const messagesFromStore = useChatStore(state => state.messages);
  const token = useChatStore(state => state.token);
  const parentRef = useRef<HTMLDivElement>(null);

  // 🛡️ CRITICAL SAFETEY FALLBACK FILTER:
  // If state.messages is polluted by an error number (1) or null, fallback to a clean empty array []
  const messages = Array.isArray(messagesFromStore) ? messagesFromStore : [];

  // Extract current user ID safely
  let userId = '';
  if (token) {
    try {
      const payload = useChatStore.getState().parseJwt(token);
      userId = payload.id || '';
    } catch (e) {}
  }

  // Use react-virtual v3 to render only visible rows safely against the array wrapper length
  const rowVirtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5,
  });

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (parentRef.current && messages.length > 0) {
      parentRef.current.scrollTop = parentRef.current.scrollHeight;
    }
  }, [messages.length]);

  return (
    <div 
      className="message-list custom-scrollbar" 
      ref={parentRef}
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        position: 'relative'
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map(virtualRow => {
          const message = messages[virtualRow.index];
          
          // Double-check element availability to avoid undefined reads during fast scroll updates
          if (!message) return null;

          return (
            <div
              key={message.clientMessageId || message.id || virtualRow.index}
              ref={rowVirtualizer.measureElement}
              data-index={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
                paddingBottom: '12px'
              }}
            >
              <MessageItem message={message} currentUserId={userId} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MessageList;