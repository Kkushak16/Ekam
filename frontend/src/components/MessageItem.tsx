import React from 'react';
import { format, parseISO } from 'date-fns';
import { Message } from '../types';

interface MessageItemProps {
  message: Message;
  currentUserId: string;
}

export function MessageItem({ message, currentUserId }: MessageItemProps) {
  const isMe = message.senderId === currentUserId;

  // Format timestamp safely
  let timeStr = '';
  if (message.ts) {
    try {
      const date = typeof message.ts === 'number' 
        ? new Date(message.ts) 
        : typeof message.ts === 'string'
          ? (message.ts.includes('T') ? parseISO(message.ts) : new Date(Number(message.ts) || message.ts))
          : new Date();
      timeStr = format(date, 'h:mm a');
    } catch (e) {
      timeStr = String(message.ts);
    }
  }

  // Render media attachments if present
  const renderMedia = () => {
    if (!message.mediaUrl) return null;

    const isImage = message.mediaType?.startsWith('image/') || /\.(jpeg|jpg|gif|png|webp)$/i.test(message.mediaUrl);
    const isVideo = message.mediaType?.startsWith('video/') || /\.(mp4|webm|ogg)$/i.test(message.mediaUrl);

    if (isImage) {
      return (
        <div style={{ marginTop: '8px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', maxWidth: '100%' }}>
          <img 
            src={message.mediaUrl} 
            alt="Uploaded media" 
            style={{ width: '100%', maxHeight: '240px', objectFit: 'cover', display: 'block' }}
          />
        </div>
      );
    }

    if (isVideo) {
      return (
        <div style={{ marginTop: '8px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', maxWidth: '100%' }}>
          <video 
            src={message.mediaUrl} 
            controls 
            style={{ width: '100%', maxHeight: '240px', display: 'block' }}
          />
        </div>
      );
    }

    return (
      <div style={{ marginTop: '8px', padding: '8px 12px', background: 'rgba(0, 0, 0, 0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>📎</span>
        <a 
          href={message.mediaUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{ color: isMe ? 'var(--text-me)' : 'var(--text-me)', textDecoration: 'underline', fontSize: '13px', wordBreak: 'break-all' }}
        >
          Download Attachment
        </a>
      </div>
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isMe ? 'flex-end' : 'flex-start',
        gap: '4px',
        width: '100%',
      }}
    >
      <div
        className="chat-bubble"
        style={{
          alignSelf: isMe ? 'flex-end' : 'flex-start',
          backgroundColor: isMe ? 'var(--bg-bubble-me)' : 'var(--bg-bubble-them)',
          color: isMe ? 'var(--text-me)' : 'var(--text-them)',
          padding: '12px 18px',
          borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          maxWidth: '75%',
          fontSize: '15px',
          lineHeight: '1.5',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          cursor: 'default'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        {message.body && <div style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{message.body}</div>}
        {renderMedia()}
      </div>
      
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '11px',
          color: 'var(--text-secondary)',
          padding: '0 6px',
          letterSpacing: '0.2px'
        }}
      >
        <span>{timeStr}</span>
        {isMe && (
          <span style={{ fontSize: '12px' }}>
            {message.status === 'sending' && '⏳'}
            {message.status === 'sent' && '✓'}
            {message.status === 'delivered' && '✓✓'}
            {message.status === 'read' && <span style={{ color: '#3b82f6' }}>✓✓</span>}
            {message.status === 'failed' && <span style={{ color: '#ef4444' }} title="Click to retry">⚠️</span>}
          </span>
        )}
      </div>
    </div>
  );
}

export default MessageItem;
