import React from 'react';
import { useChatStore } from '../store/chatStore';

interface HeaderProps {
  roomId: string;
}

export function Header({ roomId }: HeaderProps) {
  const presenceMap = useChatStore(state => state.presence);
  const onlineCount = Object.values(presenceMap).filter(p => p.online).length;
  const roomLabel = roomId === 'da3c6d7d-5a9e-4e4f-bbfb-dc874e4c278a' || roomId === 'general'
    ? 'global-stream'
    : roomId;

  return (
    <header
      className="h-16 flex items-center justify-between px-6 flex-shrink-0"
      style={{
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 70%, transparent 100%)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        position: 'relative',
        zIndex: 20,
      }}
    >
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[#c2c6d6]/50 text-sm font-semibold">#</span>
            <span className="text-base font-bold tracking-tight text-[#e2e2e2]">{roomLabel}</span>
          </div>
          <p className="text-[11px] text-[#c2c6d6]/40 font-medium tracking-wide">
            Ekam Real-Time Secure Gateway
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {onlineCount > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
            <span className="w-1.5 h-1.5 bg-[#adc6ff] rounded-full animate-pulse" />
            <span className="text-[11px] font-semibold text-[#adc6ff]">{onlineCount} online</span>
          </div>
        )}
        <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-[#c2c6d6]/50 text-[20px]">search</span>
        </button>
        <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-[#c2c6d6]/50 text-[20px]">more_vert</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
