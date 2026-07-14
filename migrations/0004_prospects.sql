CREATE TABLE IF NOT EXISTS prospects (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  is_goalie INTEGER NOT NULL DEFAULT 0,
  age INTEGER,
  current_club TEXT,
  current_league TEXT,
  nhl_games_played INTEGER NOT NULL DEFAULT 0,
  headshot TEXT,
  career TEXT NOT NULL DEFAULT '[]',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
