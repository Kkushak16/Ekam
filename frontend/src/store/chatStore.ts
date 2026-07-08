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
  username: string | null;
  setToken: (token: string | null) => void;
  clearAuth: () => void;

  socket: any | null;
  pusherInstance: any | null;
  sseSource: EventSource | null;
  activeRoomId: string | null;
  setActiveRoomId: (roomId: string | null) => void;
  subscribeToRoom: (roomId: string) => void;
  connectSSE: (roomId: string) => void;
  disconnectSSE: () => void;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  initializeSocket: (jwt: string) => void;
  disconnectSocket: () => void;

  messages: Message[];
  loadingOlder: boolean;
  setLoadingOlder: (status: boolean) => void;
  addMessage: (msg: Message) => void;
  /** Update status of a message by clientMessageId */
  updateMessageStatus: (clientMessageId: string, status: Message['status']) => void;
  /** Merge fields into a message by clientMessageId (for resolving optimistic messages) */
  updateMessageById: (clientMessageId: string, fields: Partial<Message>) => void;
  /** Bulk-update status of messages by server id */
  markMessagesRead: (messageIds: string[]) => void;
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
        username: null,
        setToken: (token) => {
          set({ token });
          if (token) {
            try {
              const payload = get().parseJwt(token);
              const uname = payload.username || payload.preferred_username || payload.email?.split('@')[0] || null;
              set({ username: uname });
            } catch {}
          }
        },
        clearAuth: () => {
          const { disconnectSocket, disconnectSSE } = get();
          disconnectSocket();
          disconnectSSE();
          set({ token: null, messages: [], presence: {}, typing: {}, activeRoomId: 'da3c6d7d-5a9e-4e4f-bbfb-dc874e4c278a' });
        },

        // ----- Socket (Pusher) + SSE -----
        socket: null,
        pusherInstance: null,
        sseSource: null,
        activeRoomId: 'da3c6d7d-5a9e-4e4f-bbfb-dc874e4c278a',
        setActiveRoomId: (roomId) => {
          set({ activeRoomId: roomId });
          if (roomId) {
            get().subscribeToRoom(roomId);
            get().connectSSE(roomId);
          }
        },
        connectSSE: (roomId) => {
          const token = get().token;
          if (!token || !roomId) return;

          // Close any existing SSE connection
          const existing = get().sseSource;
          if (existing) {
            existing.close();
            set({ sseSource: null });
          }

          // Get the current user's id so we can skip their own messages from SSE
          // (they're already in state as the optimistic copy)
          let currentUserId = '';
          try {
            const payload = get().parseJwt(token);
            currentUserId = payload.id || payload.sub || '';
          } catch {}

          // Open a new SSE connection — authenticates via query param since EventSource can't set headers
          const url = `${API_URL}/api/sse/room/${encodeURIComponent(roomId)}?token=${encodeURIComponent(token)}`;
          const es = new EventSource(url);

          es.addEventListener('new-message', (e: MessageEvent) => {
            try {
              const data = JSON.parse(e.data);
              const senderId = data.sender_id || '';

              // If the message came from the current user, it's already in state as an optimistic message.
              // Just update the existing entry with the server id — do NOT add a duplicate.
              if (senderId === currentUserId) {
                const clientId = data.clientMessageId || '';
                const serverId = String(data._id || '');
                if (clientId) {
                  get().updateMessageById(clientId, { id: serverId, status: 'sent' });
                } else if (serverId) {
                  // No clientMessageId — try to match by server id (already resolved)
                  // If not found, this is a duplicate we should ignore.
                  const existing = get().messages.some(m => m.id === serverId);
                  if (!existing) {
                    // Edge case: add it (e.g. sent from another device/tab)
                    const msg: Message = {
                      id: serverId,
                      clientMessageId: serverId,
                      roomId: data.room_id || roomId,
                      senderId: senderId,
                      body: data.body || '',
                      status: 'sent',
                      ts: data.ts || Date.now(),
                      mediaUrl: data.media_url,
                      mediaType: data.media_type,
                    };
                    get().addMessage(msg);
                  }
                }
                return;
              }

              // Message from another user — add it (addMessage handles dedup by id)
              const msg: Message = {
                id: String(data._id || ''),
                clientMessageId: String(data.clientMessageId || data._id || ''),
                roomId: data.room_id || roomId,
                senderId: senderId,
                body: data.body || '',
                status: 'delivered',  // Received = delivered
                ts: data.ts || Date.now(),
                mediaUrl: data.media_url,
                mediaType: data.media_type,
              };
              get().addMessage(msg);
            } catch (err) {
              console.error('[SSE] Failed to parse message event:', err);
            }
          });

          // Handle read receipts from SSE
          es.addEventListener('messages_read', (e: MessageEvent) => {
            try {
              const data = JSON.parse(e.data);
              const ids: string[] = data.messageIds || [];
              if (ids.length > 0) {
                get().markMessagesRead(ids);
              }
            } catch {}
          });

          es.onerror = () => {
            // Browser auto-reconnects EventSource; just log
            console.warn('[SSE] Connection error — browser will retry automatically');
          };

          set({ sseSource: es });
        },
        disconnectSSE: () => {
          const es = get().sseSource;
          if (es) {
            es.close();
            set({ sseSource: null });
          }
        },
        subscribeToRoom: (roomId) => {
          const pusher = get().pusherInstance;
          if (!pusher) return;

          const generalRoomId = 'da3c6d7d-5a9e-4e4f-bbfb-dc874e4c278a';

          // Get current user id for dedup
          let currentUserId = '';
          try {
            const payload = get().parseJwt(get().token || '');
            currentUserId = payload.id || payload.sub || '';
          } catch {}

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
              const senderId = data.sender_id || '';
              // Skip messages sent by current user — already have optimistic copy
              if (senderId === currentUserId) return;
              const msg: Message = {
                id: data._id,
                clientMessageId: data.clientMessageId || data._id,
                roomId: data.room_id,
                senderId: senderId,
                body: data.body,
                status: 'delivered',
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

            (presenceChannel as any).bind('pusher:subscription_succeeded', () => {
              const initialPresence: PresenceMap = {};
              (presenceChannel as any).members?.each((member: any) => {
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

          // Parse JWT to get userId early for presence seeding
          let selfUserId = '';
          try {
            const payload = get().parseJwt(jwt);
            selfUserId = payload.id || payload.sub || '';
          } catch {}

          const pusherKey = import.meta.env.VITE_PUSHER_KEY;
          const pusherCluster = import.meta.env.VITE_PUSHER_CLUSTER || 'ap2';

          if (!pusherKey) {
            console.error('[Pusher] VITE_PUSHER_KEY is not set. Real-time messaging will not work. Set this in your Vercel environment variables.');
            set({ connectionStatus: 'disconnected' });
            return;
          }

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
              // Seed own presence immediately when connected
              if (selfUserId) {
                set(state => ({
                  presence: {
                    ...state.presence,
                    [selfUserId]: { online: true },
                  }
                }));
              }
            } else if (states.current === 'connecting') {
              set({ connectionStatus: 'connecting' });
            } else {
              set({ connectionStatus: 'disconnected' });
            }
          });

          set({ pusherInstance: pusher });

          // Subscribe to user's private channel for real-time delivery
          if (selfUserId) {
            const userChannel = pusher.subscribe(`user-${selfUserId}`);
            userChannel.bind('new-message', (data: any) => {
              // This is a background message (user not in that room)
              const senderId = data.sender_id || '';
              if (senderId === selfUserId) return; // skip own
              const msg: Message = {
                id: data._id,
                clientMessageId: data.clientMessageId || data._id,
                roomId: data.room_id,
                senderId: senderId,
                body: data.body,
                status: 'delivered',
                ts: data.ts || Date.now(),
                mediaUrl: data.media_url,
                mediaType: data.media_type,
              };
              get().addMessage(msg);
            });
            userChannel.bind('messages_read', (data: any) => {
              const ids: string[] = data.messageIds || [];
              if (ids.length > 0) get().markMessagesRead(ids);
            });
          }

          // Subscribe to the default general room
          const defaultRoomId = 'da3c6d7d-5a9e-4e4f-bbfb-dc874e4c278a';
          
          const msgChannel = pusher.subscribe(`room-${defaultRoomId}`);
          msgChannel.bind('new-message', (data: any) => {
            const senderId = data.sender_id || '';
            if (senderId === selfUserId) return;
            const msg: Message = {
              id: data._id,
              clientMessageId: data.clientMessageId || data._id,
              roomId: data.room_id,
              senderId: senderId,
              body: data.body,
              status: 'delivered',
              ts: data.ts || Date.now(),
              mediaUrl: data.media_url,
              mediaType: data.media_type,
            };
            get().addMessage(msg);
          });

          const presenceChannel = pusher.subscribe(`presence-room-${defaultRoomId}`);
          (presenceChannel as any).bind('pusher:subscription_succeeded', () => {
            const initialPresence: PresenceMap = {};
            (presenceChannel as any).members?.each((member: any) => {
              initialPresence[member.id] = { online: true, info: member.info };
            });
            // Always include self as online
            if (selfUserId) {
              initialPresence[selfUserId] = { online: true };
            }
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

          // Handle presence.changed events for Socket.IO-based presence
          // (Pusher has its own presence, but Socket.IO also broadcasts)
          // We listen via a meta-channel approach through the socket below

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
              // mark_read: send via REST (handled in ChatPage)
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
            // Dedup: match by server id OR clientMessageId
            const existingIdx = safeMessages.findIndex(
              (m) =>
                (msg.id && m.id && m.id === msg.id) ||
                (msg.clientMessageId && m.clientMessageId && m.clientMessageId === msg.clientMessageId)
            );
            if (existingIdx !== -1) {
              // Update the existing entry (merge, keeping the higher-priority status)
              const existing = safeMessages[existingIdx];
              const statusPriority = { sending: 0, sent: 1, delivered: 2, read: 3, failed: -1 };
              const existingPriority = statusPriority[existing.status] ?? 0;
              const newPriority = statusPriority[msg.status] ?? 0;
              const mergedStatus = newPriority > existingPriority ? msg.status : existing.status;
              const updated = [...safeMessages];
              updated[existingIdx] = { ...existing, ...msg, status: mergedStatus };
              return { messages: updated };
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
        updateMessageById: (clientMessageId, fields) => {
          set((state) => {
            const safeMessages = Array.isArray(state.messages) ? state.messages : [];
            return {
              messages: safeMessages.map((m) =>
                m.clientMessageId === clientMessageId ? { ...m, ...fields } : m
              ),
            };
          });
        },
        markMessagesRead: (messageIds) => {
          set((state) => {
            const safeMessages = Array.isArray(state.messages) ? state.messages : [];
            const idSet = new Set(messageIds);
            return {
              messages: safeMessages.map((m) =>
                (m.id && idSet.has(m.id)) || (m.supabaseId && idSet.has(m.supabaseId))
                  ? { ...m, status: 'read' as const }
                  : m
              ),
            };
          });
        },
        loadOlderMessages: async (roomId, beforeId) => {
          set({ loadingOlder: true });
          try {
            const token = get().token;
            const resp = await axios.get(`${API_URL}/messages`, {
              params: { room_id: roomId, before: beforeId, limit: 50 },
              headers: { Authorization: `Bearer ${token}` },
            });
            
            set((state) => {
              const raw = resp.data && Array.isArray(resp.data.messages) ? resp.data.messages : [];
              // Normalize MongoDB field names to frontend Message shape
              const incomingMessages: Message[] = raw.map((m: any) => ({
                id: String(m._id || m.id || ''),
                clientMessageId: String(m.clientMessageId || m._id || m.id || ''),
                roomId: m.roomId || m.room_id || roomId,
                senderId: m.senderId || m.sender_id || '',
                body: m.body || m.content || '',
                status: (m.status as Message['status']) || 'sent',
                ts: m.ts || m.created_at || Date.now(),
                mediaUrl: m.mediaUrl || m.media_url,
                mediaType: m.mediaType || m.media_type,
                supabaseId: m.supabaseId || m.supabase_id,
              }));
              const safeMessages = Array.isArray(state.messages) ? state.messages : [];
              // Dedup by id (since old messages won't have clientMessageId)
              const currentIds = new Set(safeMessages.map((m) => m.id ?? m.clientMessageId));
              const filteredNew = incomingMessages.filter((m) => !currentIds.has(m.id ?? '') && !currentIds.has(m.clientMessageId));
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
            const resp = await axios.get(`${API_URL}/messages`, {
              params: { room_id: roomId, limit: 50 },
              headers: { Authorization: `Bearer ${token}` },
            });
            set((state) => {
              const raw = resp.data && Array.isArray(resp.data.messages) ? resp.data.messages : [];
              const incomingMessages: Message[] = raw.map((m: any) => ({
                id: String(m._id || m.id || ''),
                clientMessageId: String(m.clientMessageId || m._id || m.id || ''),
                roomId: m.roomId || m.room_id || roomId,
                senderId: m.senderId || m.sender_id || '',
                body: m.body || m.content || '',
                status: (m.status as Message['status']) || 'sent',
                ts: m.ts || m.created_at || Date.now(),
                mediaUrl: m.mediaUrl || m.media_url,
                mediaType: m.mediaType || m.media_type,
                supabaseId: m.supabaseId || m.supabase_id,
              }));
              const safeMessages = Array.isArray(state.messages) ? state.messages : [];
              const currentIds = new Set(safeMessages.map((m) => m.id ?? m.clientMessageId));
              const filteredNew = incomingMessages.filter((m) => !currentIds.has(m.id ?? '') && !currentIds.has(m.clientMessageId));
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