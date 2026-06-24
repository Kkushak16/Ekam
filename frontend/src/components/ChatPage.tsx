import React, { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../store/chatStore';
import { useUploadMutation } from '../api/queries';
import MessageList from './MessageList';
import TypingIndicator from './TypingIndicator';
import Header from './Header';

export function ChatPage() {
  const token = useChatStore(state => state.token);
  const socket = useChatStore(state => state.socket);
  const roomId = 'general'; // Default public room name
  
  const userId = useChatStore(state => {
    if (!state.token) return '';
    try {
      const payload = state.parseJwt(state.token);
      return payload.id || '';
    } catch (e) {
      return '';
    }
  });

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useUploadMutation();

  // Load initial messages on mount
  useEffect(() => {
    if (socket && token) {
      const fetchInitial = async () => {
        const { loadOlderMessages } = useChatStore.getState();
        await loadOlderMessages(roomId, null);
      };
      fetchInitial();
    }
  }, [socket, token]);

  const sendMessage = async (mediaUrl?: string, mediaType?: string) => {
    if ((!input.trim() && !mediaUrl) || !socket) return;

    const clientMessageId = crypto.randomUUID();
    const message = {
      clientMessageId,
      roomId,
      senderId: userId,
      body: input.trim(),
      ts: Date.now(),
      status: 'sending' as const,
      mediaUrl,
      mediaType,
    };

    // Optimistic UI update
    useChatStore.getState().addMessage(message);
    setInput('');

    // Emit via Socket.IO with callback acknowledgment
    socket.emit('send_message', message, (ack: { success: boolean }) => {
      if (ack?.success) {
        // Status will be updated via 'message_ack' listener or server broadcast
      } else {
        // Fallback: If socket ack fails, send via HTTP fallback or mark failed
        useChatStore.getState().updateMessageStatus(clientMessageId, 'failed');
      }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
      socket?.emit('typing', { roomId, isTyping: true });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket?.emit('typing', { roomId, isTyping: false });
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
      // Send the message immediately with the uploaded attachment
      await sendMessage(res.secure_url, file.type);
    } catch (err) {
      alert('Failed to upload file. Please verify file type and size constraint (under 10MB).');
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div 
      className="chat-window" 
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        position: 'relative'
      }}
    >
      <Header roomId={roomId} />
      
      {/* Messages Scroll Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <MessageList roomId={roomId} />
      </div>

      <TypingIndicator roomId={roomId} />

      {/* Input Form Bar */}
      <div 
        className="input-bar" 
        style={{
          padding: '16px 24px',
          backgroundColor: 'var(--bg-sidebar)',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* File Input and trigger */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
          />
          <button
            onClick={triggerFileSelect}
            disabled={uploadMutation.isPending}
            style={{
              background: 'var(--bg-app)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              width: '44px',
              height: '44px',
              cursor: 'pointer',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {uploadMutation.isPending ? '⏳' : '📎'}
          </button>

          {/* Text Area Input */}
          <div style={{ flex: 1, position: 'relative' }}>
            <textarea
              placeholder="Type your message..."
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              rows={1}
              style={{
                width: '100%',
                padding: '12px 16px',
                paddingRight: '60px',
                background: 'var(--bg-app)',
                border: '1px solid var(--border-color)',
                borderRadius: '14px',
                color: 'var(--text-primary)',
                fontSize: '15px',
                fontFamily: 'inherit',
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Send Button */}
          <button
            onClick={() => sendMessage()}
            style={{
              padding: '12px 24px',
              background: 'var(--bg-bubble-me)',
              color: 'var(--text-me)',
              border: 'none',
              borderRadius: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px var(--accent-glow)',
              transition: 'transform 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
