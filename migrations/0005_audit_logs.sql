CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  organization_id TEXT,
  actor_user_id TEXT,
  actor_role TEXT NOT NULL,
  actor_display_name TEXT,
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  entity_label TEXT,
  details_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_org_created_at
  ON audit_logs (organization_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_created_at
  ON audit_logs (actor_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_created_at
  ON audit_logs (entity_type, entity_id, created_at DESC);
