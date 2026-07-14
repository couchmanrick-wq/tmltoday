CREATE TABLE IF NOT EXISTS blocked_content (
  link TEXT PRIMARY KEY,
  reason TEXT NOT NULL DEFAULT 'unrelated',
  blocked_at TEXT NOT NULL DEFAULT (datetime('now'))
);
