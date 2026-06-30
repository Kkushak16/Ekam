import React, { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../store/chatStore';
import { useUploadMutation, apiClient } from '../api/queries';
import MessageList from './MessageList';
import TypingIndicator from './TypingIndicator';
import Header from './Header';

const ROOM_ID = 'da3c6d7d-5a9e-4e4f-bbfb-dc874e4c278a';

const S: Record<string, React.CSSProperties> = {
  chatWindow: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    position: 'relative',
    background: '#000',
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
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadMutation();

  useEffect(() => {
    if (socket && token) {
      const { loadOlderMessages } = useChatStore.getState();
      loadOlderMessages(roomId, null);
    }
  }, [socket, token, roomId]);

  const sendMessage = async (mediaUrl?: string, mediaType?: string) => {
    if ((!input.trim() && !mediaUrl) || !socket) return;
    const clientMessageId = crypto.randomUUID();
    const message = {
      clientMessageId,
      roomId: roomId,
      senderId: userId,
      body: input.trim(),
      ts: Date.now(),
      status: 'sending' as const,
      mediaUrl,
      mediaType,
    };
    useChatStore.getState().addMessage(message);
    setInput('');
    try {
      const { data } = await apiClient.post('/api/messages', {
        room_id: roomId,
        body: message.body,
        media_url: mediaUrl,
        media_type: mediaType,
      });
      if (data) {
        useChatStore.getState().addMessage({ ...message, id: data._id, status: 'sent', supabaseId: data.supabase_id });
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
      await sendMessage(res.secure_url, file.type);
    } catch {
      alert('Failed to upload file. Max 10MB.');
    }
    e.target.value = '';
  };

  const hasInput = input.trim().length > 0;

  return (
    <div style={S.chatWindow}>
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
          <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
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
          <button
            style={S.emojiBtn}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <span style={S.materialIcon}>mood</span>
          </button>

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
  );
}

export default ChatPage;
