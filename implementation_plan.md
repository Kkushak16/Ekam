# Implementation Plan – Ekam Front‑End Upgrade

## Goal Description
Upgrade the Ekam React front‑end to a production‑grade architecture:
- Migrate **all front‑end code to TypeScript** (`.tsx/.ts`).
- Introduce **React Query** for data‑fetching (login, rooms, message history, sync).
- Keep **Zustand** only for real‑time socket state (presence, typing, optimistic messages, UI flags).
- Add **ErrorBoundary** + **QueryClientProvider** wrappers.
- Refactor socket handling into a **central event registry** with health monitoring & back‑off reconnection.
- Implement **message retry flow**, **JWT refresh**, **payload validation (Zod)**.
- Add UX improvements: unread marker, date/grouping, message grouping, auto‑scroll, room sidebar, draft persistence, search.
- Add testing (unit + Playwright E2E).

---

## User Review Required
> [!IMPORTANT]
> Confirm the preferred package manager (npm is current) and whether to keep the existing `frontend/` folder name.
>
> > If you want a different folder name or need to rename the project, let me know now.

---

## Open Questions
> [!CAUTION]
> - Do you want a **refresh‑token endpoint** added to the backend now? (Needed for JWT refresh flow.)
> - Should the backend expose a **/auth/register** endpoint (used by the test client) now, or can we skip registration and reuse a static test user?
> - Preferred styling: continue with vanilla CSS or adopt a design‑system (e.g., CSS‑modules, Tailwind)?
> - Do you want TypeScript strict mode (`strict: true`) or a relaxed config?

---

## Proposed Changes
### 1. Backend Adjustments
- Add **POST /auth/register** (optional) that creates a user via Supabase admin (server‑side only) and returns a JWT.
- Add **POST /auth/refresh** to issue a new access token given a valid refresh token.
- Ensure both routes use only server‑side Supabase admin credentials.
- Update `server.js` to export the Express `app` for import in tests (if needed).

### 2. Front‑End Project Setup
- Install new dev dependencies:
  ```bash
  npm install -D typescript @types/react @types/react-dom @typescript-eslint/parser @typescript-eslint/eslint-plugin
  npm install @tanstack/react-query zod react-error-boundary
  ```
- Run `npx tsc --init` → generate `tsconfig.json` with:
  ```json
  {
    "compilerOptions": {
      "target": "ES2020",
      "module": "ESNext",
      "moduleResolution": "Node",
      "jsx": "react-jsx",
      "strict": true,
      "esModuleInterop": true,
      "forceConsistentCasingInFileNames": true,
      "skipLibCheck": true,
      "resolveJsonModule": true,
      "isolatedModules": true,
      "noEmit": true,
      "baseUrl": "./src",
      "paths": { "@/*": ["*"] }
    }
  }
  ```
- Update `vite.config.js` to include `tsconfigPaths()` from `vite-tsconfig-paths` (install it).

### 3. Directory Re‑organisation (src)
```
src/
├─ api/                # React Query wrappers
│    ├─ auth.ts        # useLogin, useRefresh
│    ├─ rooms.ts       # useRooms
│    └─ messages.ts    # useMessageHistory, useSendMessage
├─ socket/             # socket.ts, events.ts, handlers.ts
├─ store/              # chatStore.ts (socket state only)
├─ hooks/              # custom hooks (e.g., usePresence, useTyping)
├─ providers/          # ErrorBoundary.tsx, QueryProvider.tsx
├─ components/         # UI (MessageList, MessageItem, Header, Sidebar, etc.)
├─ types/              # message.ts, room.ts, user.ts, socketEvents.ts
├─ utils/              # date utils, backoff logic, zod schemas
├─ styles/             # global CSS / design tokens
├─ main.tsx
└─ App.tsx
```

### 4. TypeScript Migration
- Rename every file in `src/` from `.js/.jsx` to `.ts/.tsx`.
- Create type definitions, e.g.:
  ```ts
  // src/types/message.ts
  export interface Message {
    id: string;
    clientMessageId: string;
    roomId: string;
    senderId: string;
    content: string;
    status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed' | 'retrying';
    createdAt: string;
  }
  ```
- Update imports accordingly.

### 5. React Query Integration
- `src/api/auth.ts`
  ```ts
  import { useMutation, useQueryClient } from '@tanstack/react-query';
  import axios from 'axios';
  const login = async ({email,password}:{email:string,password:string})=>{
    const {data}=await axios.post('/auth/login',{email,password});
    return data.token;
  };
  export const useLogin = () => useMutation(login);
  ```
- Similar files for rooms and messages.
- Remove Axios calls from `chatStore.ts`; keep only socket‑related actions.

### 6. Error \u0026 Query Boundaries
- `src/providers/ErrorBoundary.tsx` using `react-error-boundary`.
- `src/providers/QueryProvider.tsx` wraps children with `QueryClientProvider`.
- Update `src/main.tsx`:
  ```tsx
  import React from 'react';
  import ReactDOM from 'react-dom/client';
  import App from './App';
  import { ErrorBoundary } from './providers/ErrorBoundary';
  import { QueryProvider } from './providers/QueryProvider';
  import './styles/index.css';
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <ErrorBoundary>
      <QueryProvider>
        <App />
      </QueryProvider>
    </ErrorBoundary>
  );
  ```

### 7. Socket Refactor
- `src/socket/events.ts`
  ```ts
  export const EVENTS = {
    MESSAGE_RECEIVED: 'message',
    MESSAGE_ACK: 'message_ack',
    PRESENCE_CHANGED: 'presence.changed',
    TYPING_CHANGED: 'typing.changed',
    // ...other events
  } as const;
  ```
- `src/socket/handlers.ts` – functions that update Zustand store based on events.
- `src/socket/socket.ts`
  ```ts
  import { io, Socket } from 'socket.io-client';
  import { EVENTS } from './events';
  import { useChatStore } from '../store/chatStore';
  export const createSocket = (token:string)=>{
    const socket = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token },
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      randomizationFactor: 0.5,
    });
    socket.on('connect',()=> useChatStore.setState({connectionState:'connected'}));
    socket.on('disconnect',()=> useChatStore.setState({connectionState:'offline'}));
    socket.io.on('reconnect_attempt',()=> useChatStore.setState({connectionState:'reconnecting'}));
    socket.on(EVENTS.MESSAGE_RECEIVED, (msg)=>{/* update messages slice */});
    socket.on(EVENTS.PRESENCE_CHANGED, (payload)=>{/* update presenceMap */});
    socket.on(EVENTS.TYPING_CHANGED, (payload)=>{/* update typing map */});
    return socket;
  };
  ```
- Update `chatStore.ts` to import `createSocket` and expose `socket` reference.

### 8. Message Retry Flow
- Extend `Message` status enum with `failed` \u0026 `retrying`.
- In the `useSendMessage` mutation (React Query), catch errors, set status `failed` in Zustand, and expose a `retryMessage` action.
- UI `MessageItem` shows retry button when `status === 'failed'`.

### 9. JWT Refresh Strategy
- Backend: **POST /auth/refresh** – verifies refresh token, issues new access token.
- Front‑end: Axios interceptor (or fetch wrapper) that on 401 calls `refresh` mutation, updates token in Zustand, reconnects socket.

### 10. Payload Validation (Zod)
- Create `src/utils/schemas.ts` with Zod schemas for login, room, message.
- Validate before sending via React Query or socket emit.

### 11. UX Enhancements
- **Unread Marker**: store `lastReadMessageId` per room; `MessageList` inserts a divider when newer messages appear.
- **Date Grouping**: utility function `groupByDate(messages)` using `date-fns`.
- **Message Grouping**: collapse consecutive messages from same sender.
- **Auto‑Scroll**: hook `useAutoScroll` that checks scroll position and shows “new messages” banner.
- **Room Sidebar**: component fetching rooms via `useRooms`; shows unread count, last preview, presence badge.
- **Draft Persistence**: store drafts in Zustand with `persist` middleware (localStorage).
- **Search**: simple client‑side filter input in sidebar.

### 12. Testing
- **Unit**: Jest + React Testing Library for store actions, socket handlers, components.
- **E2E**: Playwright scenario covering login, join room, send/receive, typing, presence, disconnect/reconnect, retry flow.

---

## Verification Plan
1. **Install deps** (`npm install`).
2. **Run TypeScript build** (`npm run dev` – Vite will compile TS). Ensure no compile errors.
3. Open two browser windows (`http://localhost:5173`).
   - Login flow works (React Query mutation).
   - Room list loads.
   - Join a room, send a message, see optimistic UI, then real‑time ack.
   - Simulate failure (e.g., disconnect network) → message status `failed`, retry works.
   - Typing indicator appears.
   - Presence badges update when opening/closing windows.
   - Force socket disconnect (DevTools offline) → reconnection banner, JWT refresh.
4. Capture screenshots of login, chat, typing indicator, presence badge.
5. Run `npm test` (unit) and `npx playwright test` (e2e).
6. Update `walkthrough.md` with results, screenshots, known issues.

---

**Please review the open questions above and approve** so I can start applying these changes.
