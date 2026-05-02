PRAGMA foreign_keys = OFF;

CREATE TABLE IF NOT EXISTS shared_matches (
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
  last_synced_at TEXT NOT NULL,
  UNIQUE (competition_code, season, source_match_id)
);

CREATE INDEX IF NOT EXISTS idx_shared_matches_competition_date
  ON shared_matches (competition_code, season, utc_date);

CREATE TABLE IF NOT EXISTS shared_standings (
  id TEXT PRIMARY KEY,
  competition_code TEXT NOT NULL,
  competition_name TEXT,
  season INTEGER NOT NULL,
  label TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  rows_json TEXT NOT NULL,
  last_synced_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_shared_standings_competition_sort
  ON shared_standings (competition_code, season, sort_order);

INSERT OR IGNORE INTO shared_matches (
  id,
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
  'match:' || league_matches.competition_code || ':' || league_matches.season || ':' || league_matches.source_match_id,
  league_matches.source_match_id,
  league_matches.competition_code,
  league_matches.competition_name,
  league_matches.season,
  league_matches.utc_date,
  league_matches.stage,
  league_matches.status,
  league_matches.home_team,
  league_matches.away_team,
  league_matches.score_home,
  league_matches.score_away,
  league_matches.matchday,
  league_matches.last_synced_at
FROM league_matches;

INSERT OR IGNORE INTO shared_standings (
  id,
  competition_code,
  competition_name,
  season,
  label,
  sort_order,
  rows_json,
  last_synced_at
)
SELECT
  'standing:' || leagues.competition_code || ':' || leagues.season || ':' || league_standings.sort_order,
  leagues.competition_code,
  leagues.competition_name,
  leagues.season,
  league_standings.label,
  league_standings.sort_order,
  league_standings.rows_json,
  league_standings.last_synced_at
FROM league_standings
JOIN leagues ON leagues.id = league_standings.league_id;

CREATE TABLE IF NOT EXISTS league_predictions_next (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  league_id TEXT NOT NULL,
  match_id TEXT NOT NULL,
  home_goals INTEGER NOT NULL,
  away_goals INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, league_id, match_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE CASCADE,
  FOREIGN KEY (match_id) REFERENCES shared_matches(id) ON DELETE CASCADE
);

INSERT OR IGNORE INTO league_predictions_next (
  id,
  user_id,
  league_id,
  match_id,
  home_goals,
  away_goals,
  created_at,
  updated_at
)
SELECT
  league_predictions.id,
  league_predictions.user_id,
  league_matches.league_id,
  'match:' || league_matches.competition_code || ':' || league_matches.season || ':' || league_matches.source_match_id,
  league_predictions.home_goals,
  league_predictions.away_goals,
  league_predictions.created_at,
  league_predictions.updated_at
FROM league_predictions
JOIN league_matches ON league_matches.id = league_predictions.match_id;

DROP TABLE league_predictions;
ALTER TABLE league_predictions_next RENAME TO league_predictions;

CREATE INDEX IF NOT EXISTS idx_league_predictions_user_match
  ON league_predictions (user_id, match_id);

CREATE INDEX IF NOT EXISTS idx_league_predictions_match
  ON league_predictions (match_id);

CREATE INDEX IF NOT EXISTS idx_league_predictions_league_match
  ON league_predictions (league_id, match_id);

DELETE FROM league_standings;
DELETE FROM league_matches;

PRAGMA foreign_keys = ON;
