import React, { useEffect, useState } from 'react';
import { useChatStore } from '../store/chatStore';
import { apiClient } from '../api/queries';

interface HeaderProps {
  roomId: string;
}

const S: Record<string, React.CSSProperties> = {
  header: {
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    flexShrink: 0,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 70%, transparent 100%)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    position: 'relative',
    zIndex: 20,
  },
  leftGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  hash: {
    color: 'rgba(194,198,214,0.5)',
    fontSize: 14,
    fontWeight: 600,
  },
  roomName: {
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: '-0.02em',
    color: '#e2e2e2',
  },
  subtitle: {
    fontSize: 11,
    color: 'rgba(194,198,214,0.4)',
    fontWeight: 500,
    letterSpacing: '0.02em',
  },
  rightGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  onlineBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    borderRadius: 999,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  onlineDot: {
    width: 6,
    height: 6,
    background: '#adc6ff',
    borderRadius: '50%',
    animation: 'pulse 2s ease-in-out infinite',
  },
  onlineText: {
    fontSize: 11,
    fontWeight: 600,
    color: '#adc6ff',
  },
  iconBtn: {
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
  },
  materialIcon: {
    fontFamily: "'Material Symbols Outlined'",
    fontWeight: 'normal',
    fontStyle: 'normal',
    fontSize: 20,
    lineHeight: 1,
    display: 'inline-block',
    color: 'rgba(194,198,214,0.5)',
    userSelect: 'none',
  },
};

export function Header({ roomId }: HeaderProps) {
  const presenceMap = useChatStore(state => state.presence);
  const onlineCount = Object.values(presenceMap).filter(p => p.online).length;
  const [roomName, setRoomName] = useState<string>('');

  useEffect(() => {
    if (roomId === 'da3c6d7d-5a9e-4e4f-bbfb-dc874e4c278a' || roomId === 'general') {
      setRoomName('global-stream');
      return;
    }

    let isMounted = true;
    apiClient.get(`/api/rooms/${roomId}`)
      .then(({ data }) => {
        if (isMounted && data.room) {
          setRoomName(data.room.name);
        }
      })
      .catch(err => {
        console.error('Failed to fetch room details:', err);
        if (isMounted) {
          setRoomName(roomId);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [roomId]);

  return (
    <header style={S.header}>
      <div style={S.leftGroup}>
        <div style={S.leftCol}>
          <div style={S.titleRow}>
            <span style={S.hash}>#</span>
            <span style={S.roomName}>{roomName}</span>
          </div>
          <p style={S.subtitle}>Ekam Real-Time Secure Gateway</p>
        </div>
      </div>

      <div style={S.rightGroup}>
        {onlineCount > 0 && (
          <div style={S.onlineBadge}>
            <span style={S.onlineDot} />
            <span style={S.onlineText}>{onlineCount} online</span>
          </div>
        )}
        <button
          style={S.iconBtn}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          <span style={S.materialIcon}>search</span>
        </button>
        <button
          style={S.iconBtn}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          <span style={S.materialIcon}>more_vert</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
