export interface User {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  status?: string;
  lastSeen?: number;
}

export interface Room {
  id: string;
  name: string;
  type?: string;
}

export interface Message {
  id?: string;
  clientMessageId: string;
  roomId: string;
  senderId: string;
  body: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  ts: string | number;
  mediaUrl?: string;
  mediaType?: string;
  supabaseId?: string;
}

export interface PresenceEntry {
  online: boolean;
  version?: number;
  info?: {
    email: string;
    displayName?: string;
  };
}

export type PresenceMap = Record<string, PresenceEntry>;
