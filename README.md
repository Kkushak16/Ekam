# Ekam Backend: Supabase Auth & Schema Setup

This repository contains the backend configuration, database schema, authentication integration, and seed scripts for our chat application.

## Prerequisites

- **Node.js**: Version 24+ recommended.
- **Supabase Cloud Project**: An active project created on [supabase.com](https://supabase.com).

## Getting Started

### 1. Database Migrations

This project enforces strict migration hygiene:
> [!IMPORTANT]
> **Migration Hygiene Rule**: Never edit an already-applied migration file. Any updates, table structural additions, index creation, or policy tweaks must be committed as a new incremental SQL file under `supabase/migrations/`.

Deploy the migrations sequentially in your Supabase Web Console **SQL Editor**:
1. Copy and run the contents of [`supabase/migrations/20260622000000_init_schema.sql`](./supabase/migrations/20260622000000_init_schema.sql).
2. Copy and run the contents of [`supabase/migrations/20260622000001_add_messages.sql`](./supabase/migrations/20260622000001_add_messages.sql).
3. Copy and run the contents of [`supabase/migrations/20260622000002_schema_improvements.sql`](./supabase/migrations/20260622000002_schema_improvements.sql).
4. Copy and run the contents of [`supabase/migrations/20260622000003_fix_rls_shadowing.sql`](./supabase/migrations/20260622000003_fix_rls_shadowing.sql).
5. Copy and run the contents of [`supabase/migrations/20260622000004_update_rooms_fk.sql`](./supabase/migrations/20260622000004_update_rooms_fk.sql).

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```
2. Open `.env` and configure:
   - `SUPABASE_URL`: Your Supabase Project API URL.
   - `SUPABASE_ANON_KEY`: Your project's anonymous client key.
   - `SUPABASE_SERVICE_ROLE_KEY`: Your project's service role key (required to bypass RLS for administrative seeding tasks).

### 3. Run the Database Seed Script

Execute the Node.js seed script to populate test users, rooms, memberships (with roles), messages, and read receipts. It uses an upsert strategy for idempotency:

```bash
npm run seed
```

### 4. Run Verification & Security Tests

Run the assertion suite to verify table counts, synced metadata, and Row-Level Security (RLS) policies (including Bob's adversarial access checks):

```bash
node verify.js
```

---

## Local Development Workflow

If you setup Docker and the Supabase CLI locally in the future:
* Start local Supabase: `npx supabase start`
* Reset the local DB (re-applies all migrations and wipes test data):
  ```bash
  npx supabase db reset
  ```
  *(Note: A stub is placed in `supabase/seed.sql` documenting why the JS `seed.js` script is used instead of direct SQL inserts for auth creation).*

## Authentication Configuration

### Google OAuth Setup
To configure Google OAuth in your cloud project:
1. Go to **Google Cloud Console** -> **APIs & Services** -> **Credentials**.
2. Create an **OAuth Client ID** of type **Web application**.
3. Set the Authorized Redirect URI to your project's callback url found in the Supabase Dashboard.
4. Copy the Client ID and Client Secret into the **Google Provider** settings in your Supabase Auth dashboard.

---

## Architecture References (For Week 3 Integration)

### WebSocket Message Write Flow Sequence
To maintain consistency between MongoDB and Supabase, the real-time messaging pipeline must follow this precise order of execution during WebSocket events:
1. **Client Sends Message**: WebSocket connection receives the payload.
2. **MongoDB Write**: Insert message to MongoDB, obtaining the message's unique **ULID** (`_id`).
3. **Supabase Write**: Sync basic metadata to Supabase (`public.messages`), generating the Relational **UUID**.
4. **Link Identifiers**: Run `updateOne` on the MongoDB document to set the `supabase_id` equal to the newly generated UUID.
5. **Acknowledge Delivery**: Emit the delivery confirmation payload back to the client.

