ALTER TABLE users ADD COLUMN must_change_password INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN password_changed_at TEXT;

CREATE TABLE IF NOT EXISTS password_reset_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  organization_id TEXT,
  email_normalized TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved')),
  requested_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at TEXT,
  resolved_by_user_id TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_password_reset_requests_org_status
  ON password_reset_requests (organization_id, status, requested_at);

CREATE INDEX IF NOT EXISTS idx_password_reset_requests_user_status
  ON password_reset_requests (user_id, status);
