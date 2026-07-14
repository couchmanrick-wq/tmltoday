CREATE TABLE IF NOT EXISTS draft_picks (
  year INTEGER NOT NULL,
  overall INTEGER NOT NULL,
  round INTEGER NOT NULL DEFAULT 0,
  pick_in_round INTEGER NOT NULL DEFAULT 0,
  name TEXT NOT NULL,
  position TEXT,
  club TEXT,
  league TEXT,
  PRIMARY KEY (year, overall)
);

CREATE INDEX IF NOT EXISTS idx_draft_picks_year ON draft_picks (year DESC, overall ASC);
