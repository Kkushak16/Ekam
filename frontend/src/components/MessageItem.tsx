import React from 'react';
import { format, parseISO } from 'date-fns';
import { Message } from '../types';

interface MessageItemProps {
  message: Message;
  currentUserId: string;
}

export function MessageItem({ message, currentUserId }: MessageItemProps) {
  const isMe = message.senderId === currentUserId;

  let timeStr = '';
  if (message.ts) {
    try {
      const date = typeof message.ts === 'number'
        ? new Date(message.ts)
        : typeof message.ts === 'string'
          ? (message.ts.includes('T') ? parseISO(message.ts) : new Date(Number(message.ts) || message.ts))
          : new Date();
      timeStr = format(date, 'h:mm a');
    } catch { timeStr = String(message.ts); }
  }

  const renderMedia = () => {
    if (!message.mediaUrl) return null;
    const isImage = message.mediaType?.startsWith('image/') || /\.(jpeg|jpg|gif|png|webp)$/i.test(message.mediaUrl);
    const isVideo = message.mediaType?.startsWith('video/') || /\.(mp4|webm|ogg)$/i.test(message.mediaUrl);

    if (isImage) return (
      <div style={{ marginTop: '8px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', maxWidth: '100%' }}>
        <img src={message.mediaUrl} alt="Uploaded media" style={{ width: '100%', maxHeight: '240px', objectFit: 'cover', display: 'block' }} />
      </div>
    );
    if (isVideo) return (
      <div style={{ marginTop: '8px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', maxWidth: '100%' }}>
        <video src={message.mediaUrl} controls style={{ width: '100%', maxHeight: '240px', display: 'block' }} />
      </div>
    );
    return (
      <div style={{ marginTop: '8px', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span className="material-symbols-outlined text-[#adc6ff] text-[18px]">attach_file</span>
        <a href={message.mediaUrl} target="_blank" rel="noopener noreferrer"
          style={{ color: '#adc6ff', textDecoration: 'underline', fontSize: '13px', wordBreak: 'break-all' }}>
          Download Attachment
        </a>
      </div>
    );
  };

  const StatusIcon = () => {
    if (!isMe) return null;
    if (message.status === 'sending') return <span className="material-symbols-outlined text-[12px] text-[#424754]">schedule</span>;
    if (message.status === 'sent') return <span className="material-symbols-outlined text-[12px] text-[#c2c6d6]/50">check</span>;
    if (message.status === 'delivered') return <span className="material-symbols-outlined text-[12px] text-[#c2c6d6]/70">done_all</span>;
    if (message.status === 'read') return <span className="material-symbols-outlined text-[12px] text-[#adc6ff]">done_all</span>;
    if (message.status === 'failed') return <span className="material-symbols-outlined text-[12px] text-[#ffb4ab]" title="Failed to send">error</span>;
    return null;
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isMe ? 'row-reverse' : 'row',
        gap: '12px',
        maxWidth: '75%',
        marginLeft: isMe ? 'auto' : undefined,
        alignItems: 'flex-end',
      }}
    >
      {/* Avatar placeholder */}
      {!isMe && (
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="material-symbols-outlined text-[#c2c6d6]/40 text-[16px]">person</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', gap: '4px', minWidth: 0 }}>
        {/* Bubble */}
        <div
          style={{
            padding: '12px 18px',
            borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
            background: isMe
              ? 'linear-gradient(135deg, #1f1f1f 0%, #131313 100%)'
              : 'rgba(255,255,255,0.03)',
            border: isMe
              ? '1px solid rgba(255,255,255,0.05)'
              : '1px solid rgba(255,255,255,0.08)',
            boxShadow: isMe ? '0 4px 20px rgba(0,0,0,0.3)' : 'none',
            fontSize: '15px',
            lineHeight: '1.6',
            color: '#e2e2e2',
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap',
            transition: 'transform 0.2s ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
        >
          {message.body}
          {renderMedia()}
        </div>

        {/* Time + status */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          fontSize: '10px', color: 'rgba(194,198,214,0.4)',
          fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          {isMe && <StatusIcon />}
          <span>{timeStr}</span>
          {isMe && message.status === 'read' && (
            <span style={{ color: '#adc6ff', marginLeft: '2px' }}>• Read</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default MessageItem;
