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
        className={`presence-gem ${statusClass}`}
        title={presence.online ? 'Online' : 'Offline'}
      />
  );
}

export default PresenceBadge;
