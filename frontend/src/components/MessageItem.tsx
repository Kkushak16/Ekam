import React from 'react';
import { format, parseISO } from 'date-fns';
import { Message } from '../types';

interface MessageItemProps {
  message: Message;
  currentUserId: string;
}

/**
 * Returns the underline style for the message bubble based on delivery status.
 * State 1 — Delivered (grey full underline)
 * State 2 — Sent but not delivered (half-grey underline via gradient)
 * State 3 — Read (blue underline)
 */
function getStatusUnderline(status: Message['status']): React.CSSProperties {
  switch (status) {
    case 'read':
      // Blue full underline
      return {
        borderBottom: '2px solid #4d8eff',
        boxShadow: '0 2px 8px rgba(77,142,255,0.3)',
      };
    case 'delivered':
      // Full grey underline
      return {
        borderBottom: '2px solid rgba(194,198,214,0.45)',
      };
    case 'sent':
      // Half-grey underline via linear-gradient on the border
      return {
        borderBottom: '2px solid transparent',
        backgroundImage: 'linear-gradient(135deg, #1f1f1f 0%, #131313 100%), linear-gradient(to right, rgba(194,198,214,0.4) 50%, transparent 50%)',
        backgroundClip: 'padding-box, border-box',
        backgroundOrigin: 'padding-box, border-box',
      };
    case 'sending':
      // Faint dashed — pending
      return {
        borderBottom: '2px dashed rgba(194,198,214,0.2)',
      };
    case 'failed':
      return {
        borderBottom: '2px solid rgba(255,99,99,0.5)',
      };
    default:
      return {};
  }
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

  const getFileNameFromUrl = (url?: string) => {
    if (!url) return 'Unknown File';
    try {
      const decoded = decodeURIComponent(url);
      const parts = decoded.split('/');
      const last = parts[parts.length - 1];
      return last || 'File';
    } catch {
      return 'File';
    }
  };

  const getFileIcon = (type?: string, url?: string) => {
    if (type?.startsWith('image/')) return 'image';
    if (type?.startsWith('video/')) return 'movie';
    if (type?.startsWith('audio/')) return 'audiotrack';
    if (type?.includes('pdf')) return 'picture_as_pdf';
    if (type?.includes('json')) return 'data_object';
    if (type?.includes('zip') || type?.includes('tar') || type?.includes('rar')) return 'archive';
    
    const ext = url?.split('.').pop()?.toLowerCase();
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext || '')) return 'image';
    if (['mp4', 'mov', 'avi', 'mkv'].includes(ext || '')) return 'movie';
    if (['mp3', 'wav', 'ogg'].includes(ext || '')) return 'audiotrack';
    if (ext === 'pdf') return 'picture_as_pdf';
    if (ext === 'json') return 'data_object';
    if (['zip', 'rar', '7z', 'gz'].includes(ext || '')) return 'archive';
    
    return 'description';
  };

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

    const fileName = getFileNameFromUrl(message.mediaUrl);
    const fileIcon = getFileIcon(message.mediaType, message.mediaUrl);

    return (
      <a
        href={message.mediaUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          marginTop: '10px',
          padding: '12px 14px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.04)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          textDecoration: 'none',
          color: '#e2e2e2',
          maxWidth: '280px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
          e.currentTarget.style.borderColor = 'rgba(77, 142, 255, 0.4)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.04)';
        }}
      >
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          background: 'rgba(77, 142, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span className="material-symbols-outlined" style={{ color: '#4d8eff', fontSize: '20px' }}>
            {fileIcon}
          </span>
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ fontSize: '13px', fontWeight: 650, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={fileName}>
            {fileName}
          </p>
          <p style={{ fontSize: '10px', color: 'rgba(194, 198, 214, 0.5)', margin: '2px 0 0', fontWeight: 500 }}>
            File Attachment
          </p>
        </div>
        <span className="material-symbols-outlined" style={{ color: '#4d8eff', fontSize: '18px', marginLeft: 'auto' }}>
          download
        </span>
      </a>
    );
  };

  // Status label shown next to timestamp (only for sender)
  const StatusLabel = () => {
    if (!isMe) return null;
    switch (message.status) {
      case 'sending':
        return <span style={{ color: 'rgba(194,198,214,0.3)', fontSize: 10 }}>Sending…</span>;
      case 'sent':
        return <span style={{ color: 'rgba(194,198,214,0.4)', fontSize: 10 }}>Sent</span>;
      case 'delivered':
        return <span style={{ color: 'rgba(194,198,214,0.55)', fontSize: 10 }}>Delivered</span>;
      case 'read':
        return <span style={{ color: '#4d8eff', fontSize: 10, fontWeight: 600 }}>Read</span>;
      case 'failed':
        return <span style={{ color: '#ff6b6b', fontSize: 10 }}>Failed</span>;
      default:
        return null;
    }
  };

  // Underline styles only applied to my messages
  const bubbleUnderline = isMe ? getStatusUnderline(message.status) : {};

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
          <span className="material-symbols-outlined" style={{ color: 'rgba(194,198,214,0.4)', fontSize: '16px' }}>person</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', gap: '4px', minWidth: 0 }}>
        {/* Bubble with underline status indicator */}
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
            transition: 'transform 0.2s ease, border-bottom 0.3s ease, box-shadow 0.3s ease',
            // Merge underline styles for delivery state
            ...bubbleUnderline,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
        >
          {message.body}
          {renderMedia()}
        </div>

        {/* Time + status label */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          fontSize: '10px', color: 'rgba(194,198,214,0.4)',
          fontWeight: 500, letterSpacing: '0.05em',
        }}>
          {isMe && <StatusLabel />}
          <span>{timeStr}</span>
        </div>
      </div>
    </div>
  );
}

export default MessageItem;
