import React from 'react';
import { PresenceMap } from '../types';

interface PresenceBadgeProps {
  userId: string;
  presenceMap: PresenceMap;
}

export function PresenceBadge({ userId, presenceMap }: PresenceBadgeProps) {
  const presence = presenceMap[userId] || { online: false };
  const statusClass = presence.online ? 'online' : 'offline';
  
  return (
    <span 
      className={`presence-badge ${statusClass}`} 
      title={presence.online ? 'Online' : 'Offline'}
      style={{
        display: 'inline-block',
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        backgroundColor: presence.online ? '#10b981' : '#64748b',
        border: '2px solid var(--bg-sidebar)',
        marginLeft: '4px'
      }}
    />
  );
}

export default PresenceBadge;
