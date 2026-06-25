import React from 'react';
import { useChatStore } from '../store/chatStore';

interface TypingIndicatorProps {
  roomId: string;
}

export function TypingIndicator({ roomId }: TypingIndicatorProps) {
  const typingSet = useChatStore(state => state.typing[roomId] || new Set<string>());
  if (typingSet.size === 0) return null;

  const typingUsers = Array.from(typingSet);
  const label = typingUsers.length === 1
    ? 'Someone is typing...'
    : `${typingUsers.length} people are typing...`;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 24px',
        color: 'rgba(173,198,255,0.7)',
        fontSize: '12px',
        fontWeight: 500,
        letterSpacing: '0.02em',
      }}
    >
      {/* Animated dots */}
      <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
        {[0, 1, 2].map(i => (
          <span
            key={i}
            style={{
              width: '5px', height: '5px', borderRadius: '50%',
              backgroundColor: '#adc6ff',
              animation: `soft-pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
              display: 'inline-block',
            }}
          />
        ))}
      </div>
      <span>{label}</span>
    </div>
  );
}

export default TypingIndicator;
