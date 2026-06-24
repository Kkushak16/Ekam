import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import Pusher from 'pusher-js';
import axios from 'axios';
import { Message, PresenceMap } from '../types';

const BACKEND_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "https://ekam-backend-3b2w.onrender.com";
const API_URL = BACKEND_URL.replace(/\/$/, '');

export interface ChatState {
  token: string | null;
  setToken: (token: string | null) => void;
  clearAuth: () => void;

  socket: any | null;
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

        // ----- Socket (Pusher) -----
        socket: null,
        connectionStatus: 'disconnected',
        initializeSocket: (jwt) => {
          if (get().socket) return;

          set({ connectionStatus: 'connecting' });

          const pusherKey = import.meta.env.VITE_PUSHER_KEY || 'ced54b716030c616146d';
          const pusherCluster = import.meta.env.VITE_PUSHER_CLUSTER || 'ap2';

          const pusher = new Pusher(pusherKey, {
            cluster: pusherCluster,
            forceTLS: true,
            authEndpoint: `${API_URL}/api/pusher/auth`,
            auth: {
              headers: {
                Authorization: `Bearer ${jwt}`,
              },
            },
          });

          pusher.connection.bind('state_change', (states: { current: string }) => {
            if (states.current === 'connected') {
              set({ connectionStatus: 'connected' });
            } else if (states.current === 'connecting') {
              set({ connectionStatus: 'connecting' });
            } else {
              set({ connectionStatus: 'disconnected' });
            }
          });

          const roomId = 'da3c6d7d-5a9e-4e4f-bbfb-dc874e4c278a';

          // 1. Subscribe to public channel for message broadcasts
          const msgChannel = pusher.subscribe(`room-${roomId}`);

          msgChannel.bind('new-message', (data: any) => {
            const msg: Message = {
              id: data._id,
              clientMessageId: data.clientMessageId || data._id,
              roomId: data.room_id,
              senderId: data.sender_id,
              body: data.body,
              status: 'sent',
              ts: data.ts || Date.now(),
              mediaUrl: data.media_url,
              mediaType: data.media_type,
            };
            get().addMessage(msg);
          });

          // 2. Subscribe to presence channel for online users list and typing events
          const presenceChannel = pusher.subscribe(`presence-room-${roomId}`);

          presenceChannel.bind('pusher:subscription_succeeded', () => {
            const initialPresence: PresenceMap = {};
            presenceChannel.members.each((member: any) => {
              initialPresence[member.id] = { online: true };
            });
            set({ presence: initialPresence });
          });

          presenceChannel.bind('pusher:member_added', (member: any) => {
            set((state) => ({
              presence: {
                ...state.presence,
                [member.id]: { online: true },
              },
            }));
          });

          presenceChannel.bind('pusher:member_removed', (member: any) => {
            set((state) => ({
              presence: {
                ...state.presence,
                [member.id]: { online: false },
              },
            }));
          });

          // Listen for client-typing events
          presenceChannel.bind('client-typing', (data: { userId: string; isTyping: boolean }) => {
            if (data.isTyping) {
              get().addTypingUser(roomId, data.userId);
            } else {
              get().removeTypingUser(roomId, data.userId);
            }
          });

          // Create a mock socket interface for backward compatibility in components
          const mockSocket = {
            emit: (event: string, data: any) => {
              if (event === 'typing') {
                presenceChannel.trigger('client-typing', {
                  userId: data.userId || '',
                  isTyping: data.isTyping,
                });
              }
            },
            disconnect: () => {
              pusher.disconnect();
            }
          };

          set({ socket: mockSocket });
        },

        disconnectSocket: () => {
          const { socket } = get();
          if (socket) {
            if (typeof socket.disconnect === 'function') {
              socket.disconnect();
            }
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
              const incomingMessages = resp.data && Array.isArray(resp.data.messages) ? resp.data.messages : [];
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
              const incomingMessages = resp.data && Array.isArray(resp.data.messages) ? resp.data.messages : [];
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