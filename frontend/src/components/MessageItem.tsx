import React, { useState, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import { Message } from '../types';

interface MessageItemProps {
  message: Message;
  currentUserId: string;
  onImageClick?: (url: string) => void;
}

// ─── URL detection ──────────────────────────────────────────────────────────
const URL_REGEX = /(\bhttps?:\/\/[^\s<>"{}|\\^`[\]]+|\bwww\.[^\s<>"{}|\\^`[\]]+)/gi;

function renderTextWithLinks(text: string): React.ReactNode[] {
  if (!text) return [];
  const parts = text.split(URL_REGEX);
  return parts.map((part, idx) => {
    if (URL_REGEX.test(part)) {
      URL_REGEX.lastIndex = 0; // reset regex state after test
      const href = part.startsWith('www.') ? `https://${part}` : part;
      return (
        <a
          key={idx}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#6fa8ff',
            textDecoration: 'underline',
            textUnderlineOffset: '2px',
            wordBreak: 'break-all',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#adc6ff'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#6fa8ff'; }}
        >
          {part}
        </a>
      );
    }
    URL_REGEX.lastIndex = 0;
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

// ─── File helpers ───────────────────────────────────────────────────────────
function getFileNameFromUrl(url?: string): string {
  if (!url) return 'Unknown File';
  try {
    // Handle Cloudinary URLs — strip query params, get last path segment
    const cleanUrl = url.split('?')[0];
    const decoded = decodeURIComponent(cleanUrl);
    const parts = decoded.split('/');
    return parts[parts.length - 1] || 'File';
  } catch {
    return 'File';
  }
}

function getFileExtension(url?: string, type?: string): string {
  if (type) {
    const parts = type.split('/');
    if (parts[1]) return parts[1].toUpperCase().replace('JPEG', 'JPG').replace('QUICKTIME', 'MOV');
  }
  if (url) {
    const ext = url.split('?')[0].split('.').pop()?.toUpperCase();
    if (ext && ext.length <= 5) return ext;
  }
  return 'FILE';
}

function getFileIcon(type?: string, url?: string): string {
  if (type?.startsWith('image/')) return 'image';
  if (type?.startsWith('video/')) return 'movie';
  if (type?.startsWith('audio/')) return 'audiotrack';
  if (type?.includes('pdf')) return 'picture_as_pdf';
  if (type?.includes('word') || type?.includes('document')) return 'description';
  if (type?.includes('sheet') || type?.includes('excel')) return 'table_chart';
  if (type?.includes('presentation') || type?.includes('powerpoint')) return 'slideshow';
  if (type?.includes('json')) return 'data_object';
  if (type?.includes('zip') || type?.includes('tar') || type?.includes('rar') || type?.includes('archive')) return 'archive';
  if (type?.includes('text')) return 'article';

  const ext = url?.split('?')[0].split('.').pop()?.toLowerCase();
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'avif'].includes(ext || '')) return 'image';
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext || '')) return 'movie';
  if (['mp3', 'wav', 'ogg', 'aac', 'm4a'].includes(ext || '')) return 'audiotrack';
  if (ext === 'pdf') return 'picture_as_pdf';
  if (['doc', 'docx'].includes(ext || '')) return 'description';
  if (['xls', 'xlsx'].includes(ext || '')) return 'table_chart';
  if (['ppt', 'pptx'].includes(ext || '')) return 'slideshow';
  if (['zip', 'rar', '7z', 'gz', 'tar'].includes(ext || '')) return 'archive';
  if (ext === 'txt') return 'article';
  if (ext === 'json') return 'data_object';
  return 'description';
}

function isImageType(type?: string, url?: string): boolean {
  if (type?.startsWith('image/')) return true;
  const ext = url?.split('?')[0].split('.').pop()?.toLowerCase();
  return ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'avif'].includes(ext || '');
}

function isVideoType(type?: string, url?: string): boolean {
  if (type?.startsWith('video/')) return true;
  const ext = url?.split('?')[0].split('.').pop()?.toLowerCase();
  return ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext || '');
}

// ─── Status underline ────────────────────────────────────────────────────────
function getStatusUnderline(status: Message['status']): React.CSSProperties {
  switch (status) {
    case 'read':
      return { borderBottom: '2px solid #4d8eff', boxShadow: '0 2px 8px rgba(77,142,255,0.3)' };
    case 'delivered':
      return { borderBottom: '2px solid rgba(194,198,214,0.45)' };
    case 'sent':
      return {
        borderBottom: '2px solid transparent',
        backgroundImage: 'linear-gradient(135deg, #1f1f1f 0%, #131313 100%), linear-gradient(to right, rgba(194,198,214,0.4) 50%, transparent 50%)',
        backgroundClip: 'padding-box, border-box',
        backgroundOrigin: 'padding-box, border-box',
      };
    case 'sending':
      return { borderBottom: '2px dashed rgba(194,198,214,0.2)' };
    case 'failed':
      return { borderBottom: '2px solid rgba(255,99,99,0.5)' };
    default:
      return {};
  }
}

// ─── Lightbox ────────────────────────────────────────────────────────────────
function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(16px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'zoom-out',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: 20, right: 20,
          background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '50%', width: 40, height: 40, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#e2e2e2', transition: 'background 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
      >
        <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 20 }}>close</span>
      </button>
      <img
        src={src}
        alt="Full preview"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '90vw', maxHeight: '90vh',
          borderRadius: 12, objectFit: 'contain',
          boxShadow: '0 30px 80px rgba(0,0,0,0.8)',
          cursor: 'default',
        }}
      />
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute', bottom: 24,
          background: 'rgba(77,142,255,0.15)',
          border: '1px solid rgba(77,142,255,0.3)',
          borderRadius: 10, padding: '8px 18px',
          color: '#adc6ff', fontSize: 13, fontWeight: 600,
          textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6,
          transition: 'background 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(77,142,255,0.25)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(77,142,255,0.15)'; }}
      >
        <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 16 }}>open_in_new</span>
        Open original
      </a>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function MessageItem({ message, currentUserId }: MessageItemProps) {
  const isMe = message.senderId === currentUserId;
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

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

  const openLightbox = useCallback((url: string) => setLightboxSrc(url), []);
  const closeLightbox = useCallback(() => setLightboxSrc(null), []);

  // ─── Media renderer ───────────────────────────────────────────────────────
  const renderMedia = () => {
    if (!message.mediaUrl) return null;
    const isImg = isImageType(message.mediaType, message.mediaUrl);
    const isVid = isVideoType(message.mediaType, message.mediaUrl);

    if (isImg) return (
      <div
        style={{
          marginTop: 8, borderRadius: 12, overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.08)',
          maxWidth: '100%', cursor: 'zoom-in', position: 'relative',
        }}
        onClick={() => openLightbox(message.mediaUrl!)}
        title="Click to enlarge"
      >
        <img
          src={message.mediaUrl}
          alt="Shared image"
          loading="lazy"
          style={{ width: '100%', maxHeight: 240, objectFit: 'cover', display: 'block', transition: 'opacity 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
        />
        <div style={{
          position: 'absolute', bottom: 6, right: 8,
          background: 'rgba(0,0,0,0.55)', borderRadius: 6,
          padding: '2px 6px', display: 'flex', alignItems: 'center', gap: 3,
        }}>
          <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>zoom_in</span>
        </div>
      </div>
    );

    if (isVid) return (
      <div style={{
        marginTop: 8, borderRadius: 12, overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.08)', maxWidth: '100%',
      }}>
        <video
          src={message.mediaUrl}
          controls
          preload="metadata"
          style={{ width: '100%', maxHeight: 240, display: 'block', background: '#000' }}
        />
      </div>
    );

    // Document / file card
    const fileName = getFileNameFromUrl(message.mediaUrl);
    const fileIcon = getFileIcon(message.mediaType, message.mediaUrl);
    const fileExt = getFileExtension(message.mediaUrl, message.mediaType);

    const iconColorMap: Record<string, string> = {
      picture_as_pdf: '#e85454',
      description: '#5b8fff',
      table_chart: '#4caf82',
      slideshow: '#f5a623',
      archive: '#ab82ff',
      audiotrack: '#ff82b2',
      movie: '#82d9ff',
      data_object: '#f5d623',
      article: '#adc6ff',
    };
    const iconColor = iconColorMap[fileIcon] || '#adc6ff';

    return (
      <a
        href={message.mediaUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          marginTop: 10, padding: '12px 14px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12,
          textDecoration: 'none', color: '#e2e2e2',
          maxWidth: 280, cursor: 'pointer', transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
          e.currentTarget.style.borderColor = 'rgba(77,142,255,0.35)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
        }}
      >
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: `${iconColor}18`,
          border: `1px solid ${iconColor}35`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="material-symbols-outlined" style={{ color: iconColor, fontSize: 22 }}>
            {fileIcon}
          </span>
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 650, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#e2e2e2' }} title={fileName}>
            {fileName}
          </p>
          <p style={{ fontSize: 10, color: 'rgba(194,198,214,0.5)', margin: '2px 0 0', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{
              background: `${iconColor}20`, color: iconColor,
              borderRadius: 4, padding: '1px 5px', fontSize: 9, fontWeight: 700, letterSpacing: '0.05em',
            }}>{fileExt}</span>
            Attachment
          </p>
        </div>
        <span className="material-symbols-outlined" style={{ color: '#4d8eff', fontSize: 18, flexShrink: 0 }}>
          download
        </span>
      </a>
    );
  };

  // ─── Status label ─────────────────────────────────────────────────────────
  const StatusLabel = () => {
    if (!isMe) return null;
    switch (message.status) {
      case 'sending':  return <span style={{ color: 'rgba(194,198,214,0.3)', fontSize: 10 }}>Sending…</span>;
      case 'sent':     return <span style={{ color: 'rgba(194,198,214,0.4)', fontSize: 10 }}>Sent</span>;
      case 'delivered':return <span style={{ color: 'rgba(194,198,214,0.55)', fontSize: 10 }}>Delivered</span>;
      case 'read':     return <span style={{ color: '#4d8eff', fontSize: 10, fontWeight: 600 }}>Read</span>;
      case 'failed':   return <span style={{ color: '#ff6b6b', fontSize: 10 }}>Failed</span>;
      default:         return null;
    }
  };

  const bubbleUnderline = isMe ? getStatusUnderline(message.status) : {};

  return (
    <>
      {lightboxSrc && <Lightbox src={lightboxSrc} onClose={closeLightbox} />}
      <div
        style={{
          display: 'flex',
          flexDirection: isMe ? 'row-reverse' : 'row',
          gap: 12,
          maxWidth: '75%',
          marginLeft: isMe ? 'auto' : undefined,
          alignItems: 'flex-end',
        }}
      >
        {/* Avatar */}
        {!isMe && (
          <div style={{
            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span className="material-symbols-outlined" style={{ color: 'rgba(194,198,214,0.4)', fontSize: 16 }}>person</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', gap: 4, minWidth: 0 }}>
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
              fontSize: 15,
              lineHeight: 1.6,
              color: '#e2e2e2',
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
              transition: 'transform 0.2s ease, border-bottom 0.3s ease, box-shadow 0.3s ease',
              ...bubbleUnderline,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
          >
            {/* Render text with clickable links */}
            {message.body && renderTextWithLinks(message.body)}
            {renderMedia()}
          </div>

          {/* Time + status */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            fontSize: 10, color: 'rgba(194,198,214,0.4)',
            fontWeight: 500, letterSpacing: '0.05em',
          }}>
            {isMe && <StatusLabel />}
            <span>{timeStr}</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default MessageItem;
