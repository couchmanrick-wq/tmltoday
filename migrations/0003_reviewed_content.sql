CREATE TABLE IF NOT EXISTS reviewed_content (
  id TEXT PRIMARY KEY,
  reviewed_at TEXT NOT NULL DEFAULT (datetime('now'))
);
