-- scripts/create_push_subscriptions.sql
-- Create the push_subscriptions table for multi‑device web push support

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       text NOT NULL,
  endpoint      text UNIQUE NOT NULL,
  subscription  jsonb NOT NULL,
  device_name   text,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- Index for frequent queries by user_id
CREATE INDEX IF NOT EXISTS idx_push_user_id ON push_subscriptions(user_id);
