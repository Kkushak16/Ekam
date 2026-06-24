import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { Message, PresenceMap } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '';
const WS_URL = import.meta.env.VITE_WS_URL || '';

export interface ChatState {
  token: string | null;
  setToken: (token: string | null) => void;
  clearAuth: () => void;

  socket: Socket | null;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  initializeSocket: (jwt: string) => void;
  disconnectSocket: () => void;

  messages: Message[];
  loadingOlder: boolean;
  setLoadingOlder: (status: boolean) => void;
  addMessage: (msg: Message) => void;
  updateMessageStatus: (clientMessageId: string, status: Message['status']) => void;
  loadOlderMessages: (roomId: string, beforeId: string | null) => Promise<void>;
  syncMissingMessages: (roomId: string, lastSeenId: string) => Promise<void>;

  presence: PresenceMap;
  setPresence: (presenceMap: PresenceMap) => void;

  typing: Record<string, Set<string>>;
  addTypingUser: (roomId: string, userId: string) => void;
  removeTypingUser: (roomId: string, userId: string) => void;

  parseJwt: (token: string) => any;
}

export const useChatStore = create<ChatState>()(
  devtools(
    persist(
      (set, get) => ({
        // ----- Auth -----
        token: null,
        setToken: (token) => set({ token }),
        clearAuth: () => {
          const { disconnectSocket } = get();
          disconnectSocket();
          // Safe initialization ensuring collections remain structural arrays/objects
          set({ token: null, messages: [], presence: {}, typing: {} });
        },

        // ----- Socket -----
        socket: null,
        connectionStatus: 'disconnected',
        initializeSocket: (jwt) => {
          if (get().socket) return;

          set({ connectionStatus: 'connecting' });
          const socket = io(WS_URL, {
            auth: { token: jwt },
            transports: ['websocket'],
            reconnectionAttempts: 5,
          });

          socket.on('connect', () => {
            set({ connectionStatus: 'connected', socket });
            const user = get().parseJwt(jwt);
            socket.emit('join_room', { userId: user.id, roomId: 'general' });
          });

          socket.on('disconnect', () => {
            set({ connectionStatus: 'disconnected', socket: null });
          });

          socket.on('connect_error', () => {
            set({ connectionStatus: 'disconnected', socket: null });
          });

          socket.on('message', (msg: Message) => {
            get().addMessage(msg);
          });

          socket.on('message_ack', ({ clientMessageId, status }: { clientMessageId: string; status: Message['status'] }) => {
            get().updateMessageStatus(clientMessageId, status);
          });

          socket.on('presence.snapshot', ({ onlineUsers }: { onlineUsers: Array<{ userId: string; status: string }> }) => {
            const initialPresence: PresenceMap = {};
            if (Array.isArray(onlineUsers)) {
              onlineUsers.forEach((u) => {
                initialPresence[u.userId] = { online: u.status === 'online' };
              });
            }
            set({ presence: initialPresence });
          });

          socket.on('presence.changed', ({ userId, status }: { userId: string; status: string }) => {
            set((state) => ({
              presence: {
                ...state.presence,
                [userId]: { online: status === 'online' },
              },
            }));
          });

          socket.on('typing.changed', ({ roomId, userId, isTyping }: { roomId: string; userId: string; isTyping: boolean }) => {
            if (isTyping) {
              get().addTypingUser(roomId, userId);
            } else {
              get().removeTypingUser(roomId, userId);
            }
          });

          socket.on('typing_start', ({ roomId, userId }: { roomId: string; userId: string }) => {
            get().addTypingUser(roomId, userId);
          });

          socket.on('typing_stop', ({ roomId, userId }: { roomId: string; userId: string }) => {
            get().removeTypingUser(roomId, userId);
          });
        },

        disconnectSocket: () => {
          const { socket } = get();
          if (socket) {
            socket.disconnect();
            set({ socket: null, connectionStatus: 'disconnected' });
          }
        },

        // ----- Messages -----
        messages: [],
        loadingOlder: false,
        setLoadingOlder: (status) => set({ loadingOlder: status }),
        addMessage: (msg) => {
          set((state) => {
            const safeMessages = Array.isArray(state.messages) ? state.messages : [];
            const exists = safeMessages.some(
              (m) =>
                m.clientMessageId === msg.clientMessageId ||
                (m.id && msg.id && m.id === msg.id)
            );
            if (exists) {
              return {
                messages: safeMessages.map((m) =>
                  m.clientMessageId === msg.clientMessageId ? { ...m, ...msg } : m
                ),
              };
            }
            return { messages: [...safeMessages, msg] };
          });
        },
        updateMessageStatus: (clientMessageId, status) => {
          set((state) => {
            const safeMessages = Array.isArray(state.messages) ? state.messages : [];
            return {
              messages: safeMessages.map((m) =>
                m.clientMessageId === clientMessageId ? { ...m, status } : m
              ),
            };
          });
        },
        loadOlderMessages: async (roomId, beforeId) => {
          set({ loadingOlder: true });
          try {
            const token = get().token;
            const resp = await axios.get(`${API_URL}/messages`, {
              params: { room_id: roomId, before: beforeId, limit: 20 },
              headers: { Authorization: `Bearer ${token}` },
            });
            
            set((state) => {
              const incomingMessages = Array.isArray(resp.data) ? resp.data : [];
              const safeMessages = Array.isArray(state.messages) ? state.messages : [];
              const currentIds = new Set(safeMessages.map((m) => m.clientMessageId));
              const filteredNew = incomingMessages.filter((m: Message) => !currentIds.has(m.clientMessageId));
              return { messages: [...filteredNew, ...safeMessages] };
            });
          } catch (error) {
            console.error("Failed to load messages pipeline:", error);
          } finally {
            set({ loadingOlder: false });
          }
        },
        syncMissingMessages: async (roomId, lastSeenId) => {
          try {
            const token = get().token;
            const resp = await axios.get(`${API_URL}/messages/sync`, {
              params: { roomId, after: lastSeenId },
              headers: { Authorization: `Bearer ${token}` },
            });
            set((state) => {
              const incomingMessages = Array.isArray(resp.data) ? resp.data : [];
              const safeMessages = Array.isArray(state.messages) ? state.messages : [];
              const currentIds = new Set(safeMessages.map((m) => m.clientMessageId));
              const filteredNew = incomingMessages.filter((m: Message) => !currentIds.has(m.clientMessageId));
              return { messages: [...safeMessages, ...filteredNew] };
            });
          } catch (error) {
            console.error("Failed to sync missing messages pipeline:", error);
          }
        },

        // ----- Presence -----
        presence: {},
        setPresence: (presenceMap) => set({ presence: presenceMap }),

        // ----- Typing -----
        typing: {},
        addTypingUser: (roomId, userId) => {
          set((state) => {
            const safeTyping = state.typing && typeof state.typing === 'object' ? state.typing : {};
            const current = safeTyping[roomId];
            const updated = current instanceof Set ? new Set<string>(current) : new Set<string>();
            updated.add(userId);
            return { typing: { ...safeTyping, [roomId]: updated } };
          });
        },
        removeTypingUser: (roomId, userId) => {
          set((state) => {
            const safeTyping = state.typing && typeof state.typing === 'object' ? state.typing : {};
            const current = safeTyping[roomId];
            const updated = current instanceof Set ? new Set<string>(current) : new Set<string>();
            updated.delete(userId);
            return { typing: { ...safeTyping, [roomId]: updated } };
          });
        },

        // ----- Utility -----
        parseJwt: (token) => {
          try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split('')
                .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
                .join('')
            );
            return JSON.parse(jsonPayload);
          } catch (e) {
            return {};
          }
        },
      }),
      {
        name: 'ekam-chat-store',
        storage: createJSONStorage(() => sessionStorage),
        partialize: (state) => ({ token: state.token }),
      }
    )
  )
);

export default useChatStore;