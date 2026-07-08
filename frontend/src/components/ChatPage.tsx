import React, { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../store/chatStore';
import { useUploadMutation, apiClient } from '../api/queries';
import MessageList from './MessageList';
import TypingIndicator from './TypingIndicator';
import Header from './Header';
import EmojiPicker, { Theme } from 'emoji-picker-react';

const ROOM_ID = 'da3c6d7d-5a9e-4e4f-bbfb-dc874e4c278a';

const S: Record<string, React.CSSProperties> = {
  chatWindow: {
    display: 'flex',
    flexDirection: 'row',
    height: '100%',
    width: '100%',
    position: 'relative',
    background: '#000',
    overflow: 'hidden',
  },
  bgGlow: {
    position: 'absolute',
    top: '-10%',
    right: '5%',
    width: 400,
    height: 400,
    background: 'rgba(173,198,255,0.05)',
    borderRadius: '50%',
    filter: 'blur(120px)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  messagesArea: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: 10,
  },
  inputBarWrapper: {
    padding: '0 24px 20px',
    zIndex: 10,
    flexShrink: 0,
  },
  inputBar: {
    background: 'rgba(19,19,19,0.4)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: '8px 8px 8px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
  },
  attachBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    color: 'rgba(194,198,214,0.4)',
    transition: 'all 0.2s ease',
  },
  textarea: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#e2e2e2',
    fontSize: 15,
    fontFamily: "'Hanken Grotesk', sans-serif",
    padding: '12px 0',
    resize: 'none',
    maxHeight: 120,
    overflowY: 'auto',
    lineHeight: 1.5,
  },
  emojiBtn: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(194,198,214,0.4)',
    transition: 'all 0.2s ease',
  },
  materialIcon: {
    fontFamily: "'Material Symbols Outlined'",
    fontWeight: 'normal',
    fontStyle: 'normal',
    fontSize: 24,
    lineHeight: 1,
    display: 'inline-block',
    userSelect: 'none',
  },
};

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

interface ChatPageProps {
  roomId?: string;
}

export function ChatPage({ roomId = 'da3c6d7d-5a9e-4e4f-bbfb-dc874e4c278a' }: ChatPageProps) {
  const token = useChatStore(state => state.token);
  const socket = useChatStore(state => state.socket);

  const userId = useChatStore(state => {
    if (!state.token) return '';
    try {
      const payload = state.parseJwt(state.token);
      return payload.id || payload.sub || '';
    } catch { return ''; }
  });

  const [input, setInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadMutation();

  // Right Sidebar states and effects
  const [roomDetails, setRoomDetails] = useState<{ type: string; name: string } | null>(null);
  const [activeFolder, setActiveFolder] = useState<'you' | 'them'>('you');

  // Emit read receipts when this room is opened
  useEffect(() => {
    if (!token || !roomId || !userId) return;
    // Notify server that current user has read all messages in this room
    const { socket: sock } = useChatStore.getState();
    if (sock && typeof sock.emit === 'function') {
      sock.emit('mark_read', { roomId, userId });
    }
    // Also call REST endpoint to update DB
    apiClient.post('/api/messages/read', { room_id: roomId }).catch(() => {});
  }, [roomId, token, userId]);

  // Load messages when room changes — via HTTP, no socket dependency
  useEffect(() => {
    if (!token) return;
    const { loadOlderMessages } = useChatStore.getState();
    loadOlderMessages(roomId, null);
  }, [token, roomId]);

  // Polling safety net: always re-fetch every 5s regardless of Pusher/SSE status
  // SSE handles instant delivery; polling is the guaranteed backstop
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      useChatStore.getState().syncMissingMessages(roomId, '');
    }, 5000);
    return () => clearInterval(interval);
  }, [token, roomId]);

  useEffect(() => {
    let isMounted = true;
    if (!token) return;
    apiClient.get(`/api/rooms/${roomId}`)
      .then(({ data }) => {
        if (isMounted && data.room) {
          setRoomDetails({
            type: data.room.type,
            name: data.room.name
          });
        }
      })
      .catch(err => {
        console.error('Failed to fetch room details:', err);
      });
    return () => {
      isMounted = false;
    };
  }, [roomId, token]);

  const sendMessage = async (mediaUrl?: string, mediaType?: string) => {
    if (!input.trim() && !mediaUrl) return;
    if (!token) return;
    const clientMessageId = crypto.randomUUID();
    const messageBody = input.trim();
    const message = {
      clientMessageId,
      roomId: roomId,
      senderId: userId,
      body: messageBody,
      ts: Date.now(),
      status: 'sending' as const,
      mediaUrl,
      mediaType,
    };
    // 1. Optimistic add — shows immediately in UI
    useChatStore.getState().addMessage(message);
    setInput('');
    try {
      const { data } = await apiClient.post('/api/messages', {
        room_id: roomId,
        body: messageBody,
        media_url: mediaUrl,
        media_type: mediaType,
        clientMessageId, // send clientMessageId so SSE can echo it back
      });
      if (data) {
        // 2. Update the existing optimistic message with server id + status
        //    Do NOT call addMessage again — just update status
        useChatStore.getState().updateMessageById(clientMessageId, {
          id: String(data._id),
          status: 'sent',
          supabaseId: data.supabase_id,
        });
      }
    } catch (err) {
      useChatStore.getState().updateMessageStatus(clientMessageId, 'failed');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
      socket?.emit('typing', { roomId: roomId, isTyping: true, userId });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket?.emit('typing', { roomId: roomId, isTyping: false, userId });
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadMutation.mutateAsync(file);
      // Use media_type returned by server (more reliable than browser's file.type)
      const mediaType = res.media_type || file.type;
      await sendMessage(res.secure_url, mediaType);
    } catch (err: any) {
      const errMsg = err?.response?.data?.error || err?.message || 'Upload failed';
      alert(errMsg);
    }
    e.target.value = '';
  };

  const hasInput = input.trim().length > 0;

  // Filter messages for current room
  const messages = useChatStore(state => state.messages) || [];
  const roomMessages = messages.filter(m => m.roomId === roomId);

  // Shared Media: images + videos (newest first)
  const sharedMedia = [...roomMessages]
    .filter(m => m.mediaUrl && (
      m.mediaType?.startsWith('image/') || m.mediaType?.startsWith('video/') ||
      /\.(jpeg|jpg|gif|png|webp|svg|mp4|mov|webm)$/i.test(m.mediaUrl)
    ))
    .reverse();

  // Links: messages with URLs in body but no media attachment (or media + url body)
  const URL_PATTERN = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;
  const linkMessages = [...roomMessages]
    .filter(m => !m.mediaUrl && URL_PATTERN.test(m.body))
    .reverse();
  URL_PATTERN.lastIndex = 0;

  // Files: PDFs, docs, archives, etc. (not images or videos)
  const fileMessages = [...roomMessages]
    .filter(m => m.mediaUrl && (
      m.mediaType?.includes('pdf') ||
      m.mediaType?.includes('word') || m.mediaType?.includes('document') ||
      m.mediaType?.includes('sheet') || m.mediaType?.includes('excel') ||
      m.mediaType?.includes('presentation') || m.mediaType?.includes('powerpoint') ||
      m.mediaType?.includes('zip') || m.mediaType?.includes('rar') || m.mediaType?.includes('archive') ||
      m.mediaType?.includes('text') || m.mediaType?.includes('json') ||
      m.mediaType?.startsWith('audio/') ||
      (!m.mediaType?.startsWith('image/') && !m.mediaType?.startsWith('video/') &&
       !/\.(jpeg|jpg|gif|png|webp|svg|mp4|mov|webm)$/i.test(m.mediaUrl))
    ))
    .reverse();

  return (
    <div style={S.chatWindow}>
      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', minWidth: 0 }}>
        {/* Atmospheric background glow */}
        <div style={S.bgGlow} />

        {/* Floating Header */}
        <Header roomId={roomId} />

        {/* Messages Area */}
        <div style={S.messagesArea}>
          <MessageList roomId={roomId} />
        </div>

        {/* Typing Indicator */}
        <TypingIndicator roomId={roomId} />

        {/* Input Bar */}
        <div style={S.inputBarWrapper}>
          <div style={S.inputBar}>
            {/* Attachment */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.7z,.txt,.csv,.json"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending}
              style={S.attachBtn}
              title="Attach file"
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#adc6ff'; (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(194,198,214,0.4)'; (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
            >
              <span style={S.materialIcon}>
                {uploadMutation.isPending ? 'hourglass_empty' : 'add_circle'}
              </span>
            </button>

            {/* Text input */}
            <textarea
              placeholder="Type a message..."
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              rows={1}
              style={S.textarea}
            />

            {/* Emoji */}
            <div style={{ position: 'relative' }}>
              <button
                style={S.emojiBtn}
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <span style={S.materialIcon}>mood</span>
              </button>
              
              {showEmojiPicker && (
                <div style={{ position: 'absolute', bottom: '100%', right: 0, marginBottom: '10px', zIndex: 100 }}>
                  <EmojiPicker 
                    theme={Theme.DARK} 
                    onEmojiClick={(emojiData) => setInput(prev => prev + emojiData.emoji)}
                  />
                </div>
              )}
            </div>

            {/* Send */}
            <button
              onClick={() => sendMessage()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                border: 'none',
                background: hasInput ? '#4d8eff' : 'rgba(173,198,255,0.1)',
                boxShadow: hasInput ? '0 4px 16px rgba(173,198,255,0.3)' : 'none',
              }}
            >
              <span style={{
                ...S.materialIcon,
                fontSize: 20,
                color: hasInput ? '#fff' : '#adc6ff',
                transform: hasInput ? 'translateX(1px)' : 'none',
                transition: 'transform 0.2s ease',
              }}>
                send
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <aside style={{
        width: 300,
        background: 'rgba(13,13,13,0.5)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderLeft: '1px solid rgba(255,255,255,0.04)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        height: '100%',
        boxSizing: 'border-box',
        zIndex: 15,
        overflowY: 'auto',
      }}>

        {/* ── Presence / Profile ── */}
        <div style={{ padding: '20px 20px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #1a2744 0%, #2a3f6e 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 18, color: '#adc6ff' }}>person</span>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#e2e2e2' }}>
                {roomDetails?.name || 'Chat'}
              </p>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(194,198,214,0.5)' }}>
                {roomDetails?.type === 'dm' ? 'Direct Message' : 'Group Channel'}
              </p>
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', margin: '0 16px' }} />

        {/* ── Shared Media (images + videos) ── */}
        <SidebarSection title="Shared Media" icon="perm_media" count={sharedMedia.length}>
          {sharedMedia.length === 0 ? (
            <EmptySlot label="No shared media yet" />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
              {sharedMedia.map((m, idx) => {
                const isImg = m.mediaType?.startsWith('image/') || /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(m.mediaUrl || '');
                return (
                  <a
                    key={m.id || idx}
                    href={m.mediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      aspectRatio: '1', borderRadius: 8, overflow: 'hidden',
                      border: '1px solid rgba(255,255,255,0.05)', display: 'block',
                      background: 'rgba(255,255,255,0.02)', position: 'relative',
                    }}
                  >
                    {isImg ? (
                      <img src={m.mediaUrl} alt="" loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{
                        width: '100%', height: '100%', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(77,142,255,0.1)',
                      }}>
                        <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 22, color: '#4d8eff' }}>movie</span>
                      </div>
                    )}
                  </a>
                );
              })}
            </div>
          )}
        </SidebarSection>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', margin: '0 16px' }} />

        {/* ── Links ── */}
        <SidebarSection title="Links" icon="link" count={linkMessages.length}>
          {linkMessages.length === 0 ? (
            <EmptySlot label="No links shared yet" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {linkMessages.map((m, idx) => {
                const urlMatch = m.body.match(URL_PATTERN2);
                const url = urlMatch?.[0] || '';
                let domain = '';
                try { domain = new URL(url).hostname.replace('www.', ''); } catch {}
                return (
                  <a
                    key={m.id || idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 8,
                      padding: '8px 10px', borderRadius: 10,
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.04)',
                      textDecoration: 'none', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(77,142,255,0.06)';
                      e.currentTarget.style.borderColor = 'rgba(77,142,255,0.2)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)';
                    }}
                  >
                    <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 14, color: '#4d8eff', marginTop: 1, flexShrink: 0 }}>link</span>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 11, color: '#4d8eff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{domain || url}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 10, color: 'rgba(194,198,214,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{url}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </SidebarSection>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', margin: '0 16px' }} />

        {/* ── Files ── */}
        <SidebarSection title="Files" icon="folder_open" count={fileMessages.length}>
          {fileMessages.length === 0 ? (
            <EmptySlot label="No files shared yet" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {fileMessages.map((file, idx) => {
                const fileName = getFileNameFromUrl(file.mediaUrl);
                const icon = getFileIcon(file.mediaType, file.mediaUrl);
                const iconColorMap: Record<string, string> = {
                  picture_as_pdf: '#e85454', description: '#5b8fff',
                  table_chart: '#4caf82', slideshow: '#f5a623',
                  archive: '#ab82ff', audiotrack: '#ff82b2', article: '#adc6ff',
                };
                const iconColor = iconColorMap[icon] || '#adc6ff';
                return (
                  <div
                    key={file.id || idx}
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.04)',
                      borderRadius: 10, padding: '10px 12px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                        background: `${iconColor}18`, border: `1px solid ${iconColor}30`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 16, color: iconColor }}>{icon}</span>
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ fontSize: 12, fontWeight: 650, color: '#e2e2e2', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={fileName}>{fileName}</p>
                        <p style={{ fontSize: 10, color: 'rgba(194,198,214,0.35)', margin: '1px 0 0' }}>{new Date(file.ts).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <a
                      href={file.mediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        width: 28, height: 28, borderRadius: 7, display: 'flex', flexShrink: 0,
                        alignItems: 'center', justifyContent: 'center', color: '#4d8eff',
                        background: 'rgba(77,142,255,0.08)', textDecoration: 'none', transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(77,142,255,0.18)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(77,142,255,0.08)'; }}
                    >
                      <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 14 }}>download</span>
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </SidebarSection>

      </aside>
    </div>
  );
}

// ─── Sidebar helpers ─────────────────────────────────────────────────────────
const URL_PATTERN2 = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;

function SidebarSection({ title, icon, count, children }: {
  title: string; icon: string; count: number; children: React.ReactNode;
}) {
  return (
    <div style={{ padding: '16px 16px 12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 14, color: '#adc6ff' }}>{icon}</span>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', color: '#adc6ff', textTransform: 'uppercase' }}>{title}</span>
        </div>
        {count > 0 && (
          <span style={{ fontSize: 10, color: 'rgba(194,198,214,0.4)', fontWeight: 500 }}>{count}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function EmptySlot({ label }: { label: string }) {
  return (
    <div style={{
      height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: '1px dashed rgba(255,255,255,0.05)', borderRadius: 10,
      color: 'rgba(194,198,214,0.3)', fontSize: 11,
    }}>{label}</div>
  );
}

export default ChatPage;
