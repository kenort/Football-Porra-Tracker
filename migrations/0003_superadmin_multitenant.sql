PRAGMA foreign_keys = OFF;

CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO organizations (id, name, slug, is_active, created_at, updated_at)
VALUES (
  'legacy-org',
  'Organizacion principal',
  'organizacion-principal',
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

ALTER TABLE leagues ADD COLUMN organization_id TEXT;
CREATE INDEX IF NOT EXISTS idx_leagues_organization_id ON leagues(organization_id);

UPDATE leagues
SET organization_id = 'legacy-org'
WHERE organization_id IS NULL;

CREATE TABLE users_next (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  email_normalized TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('superadmin', 'admin', 'user')),
  is_active INTEGER NOT NULL DEFAULT 1,
  organization_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users_next (
  id,
  email,
  email_normalized,
  display_name,
  password_hash,
  password_salt,
  role,
  is_active,
  organization_id,
  created_at,
  updated_at
)
SELECT
  users.id,
  users.email,
  users.email_normalized,
  users.display_name,
  users.password_hash,
  users.password_salt,
  CASE
    WHEN users.role = 'admin'
      AND users.id = (
        SELECT inner_users.id
        FROM users AS inner_users
        WHERE inner_users.role = 'admin'
        ORDER BY inner_users.created_at ASC
        LIMIT 1
      )
      AND NOT EXISTS (
        SELECT 1
        FROM users AS existing_superadmin
        WHERE existing_superadmin.role = 'superadmin'
      )
    THEN 'superadmin'
    ELSE users.role
  END,
  users.is_active,
  CASE
    WHEN users.role = 'admin'
      AND users.id = (
        SELECT inner_users.id
        FROM users AS inner_users
        WHERE inner_users.role = 'admin'
        ORDER BY inner_users.created_at ASC
        LIMIT 1
      )
      AND NOT EXISTS (
        SELECT 1
        FROM users AS existing_superadmin
        WHERE existing_superadmin.role = 'superadmin'
      )
    THEN NULL
    ELSE 'legacy-org'
  END,
  users.created_at,
  users.updated_at
FROM users;

DROP TABLE users;
ALTER TABLE users_next RENAME TO users;

CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);

PRAGMA foreign_keys = ON;
