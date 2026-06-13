ALTER TABLE leagues ADD COLUMN score_mode TEXT NOT NULL DEFAULT 'regular_time';

ALTER TABLE shared_matches ADD COLUMN score_regular_home INTEGER;
ALTER TABLE shared_matches ADD COLUMN score_regular_away INTEGER;
ALTER TABLE shared_matches ADD COLUMN score_full_home INTEGER;
ALTER TABLE shared_matches ADD COLUMN score_full_away INTEGER;

UPDATE shared_matches
   SET score_regular_home = COALESCE(score_regular_home, score_home),
       score_regular_away = COALESCE(score_regular_away, score_away),
       score_full_home = COALESCE(score_full_home, score_home),
       score_full_away = COALESCE(score_full_away, score_away);
