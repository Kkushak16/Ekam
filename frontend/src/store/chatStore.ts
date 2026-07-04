import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import Pusher from 'pusher-js';
import axios from 'axios';
import { Message, PresenceMap } from '../types';

const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (import.meta.env.DEV) {
    return envUrl || 'http://localhost:3000';
  }
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1') && !envUrl.includes('vercel.app')) {
    return envUrl;
  }
  return 'https://ekam-backend-3b2w.onrender.com';
};
const API_URL = getApiUrl().replace(/\/$/, '');

export interface ChatState {
  token: string | null;
  setToken: (token: string | null) => void;
  clearAuth: () => void;

  socket: any | null;
  pusherInstance: any | null;
  activeRoomId: string | null;
  setActiveRoomId: (roomId: string | null) => void;
  subscribeToRoom: (roomId: string) => void;
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
          set({ token: null, messages: [], presence: {}, typing: {}, activeRoomId: 'da3c6d7d-5a9e-4e4f-bbfb-dc874e4c278a' });
        },

        // ----- Socket (Pusher) -----
        socket: null,
        pusherInstance: null,
        activeRoomId: 'da3c6d7d-5a9e-4e4f-bbfb-dc874e4c278a',
        setActiveRoomId: (roomId) => {
          set({ activeRoomId: roomId });
          if (roomId) {
            get().subscribeToRoom(roomId);
          }
        },
        subscribeToRoom: (roomId) => {
          const pusher = get().pusherInstance;
          if (!pusher) return;

          const generalRoomId = 'da3c6d7d-5a9e-4e4f-bbfb-dc874e4c278a';

          // Unsubscribe from other rooms (except the new room and the general room)
          if (pusher.channels && pusher.channels.channels) {
            const channels = Object.keys(pusher.channels.channels);
            channels.forEach(chName => {
              if (chName.startsWith('room-') && chName !== `room-${roomId}` && chName !== `room-${generalRoomId}`) {
                pusher.unsubscribe(chName);
              }
              if (chName.startsWith('presence-room-') && chName !== `presence-room-${roomId}` && chName !== `presence-room-${generalRoomId}`) {
                pusher.unsubscribe(chName);
              }
            });
          }

          // Subscribe to message channel
          const msgChannelName = `room-${roomId}`;
          if (!pusher.channel(msgChannelName)) {
            const msgChannel = pusher.subscribe(msgChannelName);
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
          }

          // Subscribe to presence channel
          const presenceChannelName = `presence-room-${roomId}`;
          if (!pusher.channel(presenceChannelName)) {
            const presenceChannel = pusher.subscribe(presenceChannelName);

            presenceChannel.bind('pusher:subscription_succeeded', () => {
              const initialPresence: PresenceMap = {};
              presenceChannel.members.each((member: any) => {
                initialPresence[member.id] = { online: true, info: member.info };
              });
              set((state) => ({
                presence: { ...state.presence, ...initialPresence }
              }));
            });

            presenceChannel.bind('pusher:member_added', (member: any) => {
              set((state) => ({
                presence: {
                  ...state.presence,
                  [member.id]: { online: true, info: member.info },
                },
              }));
            });

            presenceChannel.bind('pusher:member_removed', (member: any) => {
              set((state) => ({
                presence: {
                  ...state.presence,
                  [member.id]: { online: false, info: member.info },
                },
              }));
            });

            presenceChannel.bind('client-typing', (data: { userId: string; isTyping: boolean }) => {
              if (data.isTyping) {
                get().addTypingUser(roomId, data.userId);
              } else {
                get().removeTypingUser(roomId, data.userId);
              }
            });
          }
        },
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

          set({ pusherInstance: pusher });

          // Parse JWT to subscribe to user's private channel for real-time delivery
          try {
            const payload = get().parseJwt(jwt);
            const userId = payload.id || payload.sub;
            if (userId) {
              const userChannel = pusher.subscribe(`user-${userId}`);
              userChannel.bind('new-message', (data: any) => {
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
            }
          } catch (e) {
            console.error('Failed to subscribe to user private channel:', e);
          }

          // Subscribe to the default general room
          const defaultRoomId = 'da3c6d7d-5a9e-4e4f-bbfb-dc874e4c278a';
          
          const msgChannel = pusher.subscribe(`room-${defaultRoomId}`);
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

          const presenceChannel = pusher.subscribe(`presence-room-${defaultRoomId}`);
          presenceChannel.bind('pusher:subscription_succeeded', () => {
            const initialPresence: PresenceMap = {};
            presenceChannel.members.each((member: any) => {
              initialPresence[member.id] = { online: true, info: member.info };
            });
            set({ presence: initialPresence });
          });

          presenceChannel.bind('pusher:member_added', (member: any) => {
            set((state) => ({
              presence: {
                ...state.presence,
                [member.id]: { online: true, info: member.info },
              },
            }));
          });

          presenceChannel.bind('pusher:member_removed', (member: any) => {
            set((state) => ({
              presence: {
                ...state.presence,
                [member.id]: { online: false, info: member.info },
              },
            }));
          });

          presenceChannel.bind('client-typing', (data: { userId: string; isTyping: boolean }) => {
            if (data.isTyping) {
              get().addTypingUser(defaultRoomId, data.userId);
            } else {
              get().removeTypingUser(defaultRoomId, data.userId);
            }
          });

          // Subscribe to the active room if it is different from general
          const activeRoom = get().activeRoomId;
          if (activeRoom && activeRoom !== defaultRoomId) {
            get().subscribeToRoom(activeRoom);
          }

          // Create a mock socket interface for backward compatibility in components
          const mockSocket = {
            emit: (event: string, data: any) => {
              if (event === 'typing') {
                const targetRoomId = data.roomId || get().activeRoomId || defaultRoomId;
                const activePresence = pusher.channel(`presence-room-${targetRoomId}`);
                if (activePresence) {
                  activePresence.trigger('client-typing', {
                    userId: data.userId || '',
                    isTyping: data.isTyping,
                  });
                }
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
            set({ socket: null, pusherInstance: null, connectionStatus: 'disconnected' });
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
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ token: state.token }),
      }
    )
  )
);

export default useChatStore;