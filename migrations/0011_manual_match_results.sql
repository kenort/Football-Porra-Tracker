ALTER TABLE shared_matches ADD COLUMN score_source TEXT NOT NULL DEFAULT 'api';
ALTER TABLE shared_matches ADD COLUMN manual_score_updated_at TEXT;
ALTER TABLE shared_matches ADD COLUMN manual_score_updated_by_user_id TEXT;
