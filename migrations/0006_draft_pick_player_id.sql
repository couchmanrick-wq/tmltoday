ALTER TABLE draft_picks ADD COLUMN player_id INTEGER;

CREATE INDEX IF NOT EXISTS idx_draft_picks_player_id ON draft_picks (player_id);
