import React from 'react';
import { useChatStore } from '../store/chatStore';

interface TypingIndicatorProps {
  roomId: string;
}

export function TypingIndicator({ roomId }: TypingIndicatorProps) {
  const typingSet = useChatStore(state => state.typing[roomId] || new Set<string>());
  if (typingSet.size === 0) return null;
  const typingUsers = Array.from(typingSet);

  const presenceMap = useChatStore(state => state.presence);
  return (
    <div className="typing-indicator" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 16px', color: 'var(--text-secondary)' }}>
      {typingUsers.map((userId) => {
        const presence = presenceMap[userId] || { online: false };
        const statusClass = presence.online ? 'online' : 'offline';
        return (
          <span key={userId} style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <span className={`presence-gem ${statusClass}`} title={presence.online ? 'Online' : 'Offline'} />
            <span>{userId}</span>
          </span>
        );
      })}
      <span style={{ marginLeft: '8px', fontSize: '0.9rem', opacity: 0.8 }}>
        {typingUsers.length === 1 ? 'is' : 'are'} typing...
      </span>
    </div>
  );
}

export default TypingIndicator;
