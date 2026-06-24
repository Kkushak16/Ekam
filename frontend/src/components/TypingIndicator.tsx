import React from 'react';
import { useChatStore } from '../store/chatStore';

interface TypingIndicatorProps {
  roomId: string;
}

export function TypingIndicator({ roomId }: TypingIndicatorProps) {
  const typingSet = useChatStore(state => state.typing[roomId] || new Set<string>());
  if (typingSet.size === 0) return null;
  const typingUsers = Array.from(typingSet);

  return (
    <div className="typing-indicator" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 16px', color: 'var(--text-secondary)' }}>
      <span className="dot" style={{ width: '6px', height: '6px', backgroundColor: 'var(--text-secondary)', borderRadius: '50%', display: 'inline-block', animation: 'bounce 1.4s infinite ease-in-out both' }} />
      <span className="dot" style={{ width: '6px', height: '6px', backgroundColor: 'var(--text-secondary)', borderRadius: '50%', display: 'inline-block', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.2s' }} />
      <span className="dot" style={{ width: '6px', height: '6px', backgroundColor: 'var(--text-secondary)', borderRadius: '50%', display: 'inline-block', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.4s' }} />
      <span style={{ marginLeft: '8px', fontSize: '0.9rem', opacity: 0.8 }}>
        {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
      </span>
    </div>
  );
}

export default TypingIndicator;
