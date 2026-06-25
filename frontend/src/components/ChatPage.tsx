import React, { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../store/chatStore';
import { useUploadMutation, apiClient } from '../api/queries';
import MessageList from './MessageList';
import TypingIndicator from './TypingIndicator';
import Header from './Header';

const ROOM_ID = 'da3c6d7d-5a9e-4e4f-bbfb-dc874e4c278a';

export function ChatPage() {
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
      loadOlderMessages(ROOM_ID, null);
    }
  }, [socket, token]);

  const sendMessage = async (mediaUrl?: string, mediaType?: string) => {
    if ((!input.trim() && !mediaUrl) || !socket) return;
    const clientMessageId = crypto.randomUUID();
    const message = {
      clientMessageId,
      roomId: ROOM_ID,
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
        room_id: ROOM_ID,
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
      socket?.emit('typing', { roomId: ROOM_ID, isTyping: true, userId });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket?.emit('typing', { roomId: ROOM_ID, isTyping: false, userId });
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
    <div className="chat-window flex flex-col h-full w-full relative bg-background">
      {/* Atmospheric background glow */}
      <div className="absolute -top-[10%] right-[5%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Floating Header */}
      <Header roomId={ROOM_ID} />

      {/* Messages Area */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden z-10">
        <MessageList roomId={ROOM_ID} />
      </div>

      {/* Typing Indicator */}
      <TypingIndicator roomId={ROOM_ID} />

      {/* Input Bar */}
      <div className="px-6 pb-5 z-10 flex-shrink-0">
        <div className="glass-surface border border-white/[0.08] rounded-2xl p-2 pl-5 flex items-center gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {/* Attachment */}
          <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
            className="text-on-surface-variant/40 hover:text-primary transition-all hover:scale-110 cursor-pointer"
            title="Attach file"
          >
            <span className="material-symbols-outlined">
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
            className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] placeholder:text-on-surface-variant/30 py-3 resize-none outline-none text-on-surface leading-relaxed"
            style={{ maxHeight: '120px', overflowY: 'auto' }}
          />

          {/* Emoji */}
          <button className="w-10 h-10 rounded-full hover:bg-white/5 transition-all text-on-surface-variant/40 flex items-center justify-center cursor-pointer">
            <span className="material-symbols-outlined">mood</span>
          </button>

          {/* Send */}
          <button
            onClick={() => sendMessage()}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer ${
              hasInput ? 'bg-primary text-white shadow-[0_4px_16px_rgba(173,198,255,0.3)]' : 'bg-primary/10'
            }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${hasInput ? 'text-white translate-x-0.5' : 'text-primary'} transition-transform`}>
              send
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
