import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useChatStore } from '../store/chatStore';
import { Message, Room } from '../types';

const API_URL = import.meta.env.DEV ? (import.meta.env.VITE_API_URL || 'http://localhost:3000') : window.location.origin;

export const apiClient = axios.create({
  baseURL: API_URL,
});

// Automatically inject JWT token into all requests
apiClient.interceptors.request.use((config) => {
  const token = useChatStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// React Query Hooks

// 1. Rooms Query
export function useRoomsQuery() {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ rooms: string[] }>('/rooms');
      // Format as Room objects
      return data.rooms.map((roomId) => ({
        id: roomId,
        name: roomId === 'general' || roomId === 'da3c6d7d-5a9e-4e4f-bbfb-dc874e4c278a' ? 'Global Stream' : roomId,
        type: 'public',
      }));
    },
    enabled: !!useChatStore.getState().token,
  });
}

// 2. Message History Query
export function useMessagesQuery(roomId: string, beforeId: string | null = null, limit = 20) {
  return useQuery({
    queryKey: ['messages', roomId, beforeId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ messages: Message[]; nextCursor: string | null }>('/messages', {
        params: { room_id: roomId, before: beforeId, limit },
      });
      return data;
    },
    enabled: !!useChatStore.getState().token && !!roomId,
  });
}

// 3. Media Upload Mutation
export function useUploadMutation() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await apiClient.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data as { secure_url: string; resource_type: string; public_id: string };
    },
  });
}
