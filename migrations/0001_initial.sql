CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  competition_code TEXT,
  competition_id INTEGER,
  competition_name TEXT,
  season INTEGER NOT NULL,
  exact_points INTEGER NOT NULL DEFAULT 3,
  outcome_points INTEGER NOT NULL DEFAULT 1,
  lock_minutes INTEGER NOT NULL DEFAULT 0,
  last_sync_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO settings (
  id,
  season,
  exact_points,
  outcome_points,
  lock_minutes
) VALUES (1, 2025, 3, 1, 0);

CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_normalized TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
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
  last_synced_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_matches_competition_season_date
  ON matches (competition_code, season, utc_date);

CREATE TABLE IF NOT EXISTS standings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  competition_code TEXT NOT NULL,
  season INTEGER NOT NULL,
  label TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  rows_json TEXT NOT NULL,
  last_synced_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_standings_competition_season
  ON standings (competition_code, season, sort_order);

CREATE TABLE IF NOT EXISTS predictions (
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL,
  match_id TEXT NOT NULL,
  home_goals INTEGER NOT NULL,
  away_goals INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (player_id, match_id)
);

CREATE INDEX IF NOT EXISTS idx_predictions_match
  ON predictions (match_id);

CREATE INDEX IF NOT EXISTS idx_predictions_player
  ON predictions (player_id);
