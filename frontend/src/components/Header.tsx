import React from 'react';
import { useChatStore } from '../store/chatStore';
import PresenceBadge from './PresenceBadge';

interface HeaderProps {
  roomId: string;
}

export function Header({ roomId }: HeaderProps) {
  const presenceMap = useChatStore(state => state.presence);
  // Display other users (excluding our own if possible, or all online users)
  const participants = Object.keys(presenceMap);

  return (
    <header 
      className="chat-header"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'between',
        padding: '16px 24px',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-sidebar)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h1 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
          #{roomId === 'general' || roomId === 'da3c6d7d-5a9e-4e4f-bbfb-dc874e4c278a' ? 'global-stream' : roomId}
        </h1>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          Ekam Real-Time Secure Gateway Channel
        </p>
      </div>
      <div 
        className="participants" 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          marginLeft: 'auto'
        }}
      >
        {participants.length === 0 ? (
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>No other users online</span>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            {participants.map((uid) => {
              const userDisplayName = presenceMap[uid]?.info?.displayName || presenceMap[uid]?.info?.email?.split('@')[0] || `${uid.slice(0, 6)}...`;
              return (
                <div 
                  key={uid} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <span style={{ fontSize: '12px', color: 'var(--text-primary)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {userDisplayName}
                  </span>
                  <PresenceBadge userId={uid} presenceMap={presenceMap} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
