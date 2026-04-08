CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  email_normalized TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS leagues (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  competition_code TEXT NOT NULL,
  competition_id INTEGER,
  competition_name TEXT,
  season INTEGER NOT NULL,
  exact_points INTEGER NOT NULL DEFAULT 3,
  outcome_points INTEGER NOT NULL DEFAULT 1,
  lock_minutes INTEGER NOT NULL DEFAULT 0,
  last_sync_at TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_by_user_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_leagues_slug ON leagues(slug);
CREATE INDEX IF NOT EXISTS idx_leagues_active ON leagues(is_active);

CREATE TABLE IF NOT EXISTS league_memberships (
  user_id TEXT NOT NULL,
  league_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, league_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_league_memberships_league_id ON league_memberships(league_id);

CREATE TABLE IF NOT EXISTS league_matches (
  id TEXT PRIMARY KEY,
  league_id TEXT NOT NULL,
  source_match_id INTEGER NOT NULL,
  competition_code TEXT NOT NULL,
  competition_name TEXT,
  season INTEGER NOT NULL,
  utc_date TEXT NOT NULL,
  stage TEXT,
  status TEXT NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  score_home INTEGER,
  score_away INTEGER,
  matchday INTEGER,
  last_synced_at TEXT NOT NULL,
  FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_league_matches_league_date
  ON league_matches (league_id, utc_date);

CREATE TABLE IF NOT EXISTS league_standings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  league_id TEXT NOT NULL,
  label TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  rows_json TEXT NOT NULL,
  last_synced_at TEXT NOT NULL,
  FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_league_standings_league_sort
  ON league_standings (league_id, sort_order);

CREATE TABLE IF NOT EXISTS league_predictions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  match_id TEXT NOT NULL,
  home_goals INTEGER NOT NULL,
  away_goals INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, match_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (match_id) REFERENCES league_matches(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_league_predictions_user_match
  ON league_predictions (user_id, match_id);

CREATE INDEX IF NOT EXISTS idx_league_predictions_match
  ON league_predictions (match_id);

INSERT OR IGNORE INTO leagues (
  id,
  name,
  slug,
  competition_code,
  competition_id,
  competition_name,
  season,
  exact_points,
  outcome_points,
  lock_minutes,
  last_sync_at,
  is_active,
  created_at,
  updated_at
)
SELECT
  'legacy-main-league',
  CASE
    WHEN COALESCE(TRIM(competition_name), '') <> '' THEN competition_name || ' ' || season
    ELSE 'Liga principal'
  END,
  'liga-principal',
  COALESCE(NULLIF(TRIM(competition_code), ''), 'CL'),
  competition_id,
  COALESCE(NULLIF(TRIM(competition_name), ''), 'UEFA Champions League'),
  COALESCE(season, 2025),
  COALESCE(exact_points, 3),
  COALESCE(outcome_points, 1),
  COALESCE(lock_minutes, 0),
  last_sync_at,
  1,
  COALESCE(created_at, CURRENT_TIMESTAMP),
  COALESCE(updated_at, CURRENT_TIMESTAMP)
FROM settings
WHERE NOT EXISTS (SELECT 1 FROM leagues);

INSERT OR IGNORE INTO league_matches (
  id,
  league_id,
  source_match_id,
  competition_code,
  competition_name,
  season,
  utc_date,
  stage,
  status,
  home_team,
  away_team,
  score_home,
  score_away,
  matchday,
  last_synced_at
)
SELECT
  id,
  'legacy-main-league',
  source_match_id,
  competition_code,
  competition_name,
  season,
  utc_date,
  stage,
  status,
  home_team,
  away_team,
  score_home,
  score_away,
  matchday,
  last_synced_at
FROM matches
WHERE NOT EXISTS (SELECT 1 FROM league_matches);

INSERT OR IGNORE INTO league_standings (
  league_id,
  label,
  sort_order,
  rows_json,
  last_synced_at
)
SELECT
  'legacy-main-league',
  label,
  sort_order,
  rows_json,
  last_synced_at
FROM standings
WHERE NOT EXISTS (SELECT 1 FROM league_standings);
