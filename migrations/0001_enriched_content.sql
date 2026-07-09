CREATE TABLE IF NOT EXISTS enriched_content (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  source TEXT NOT NULL,
  source_url TEXT NOT NULL,
  link TEXT NOT NULL UNIQUE,
  image TEXT,
  published_at TEXT NOT NULL,
  content_type TEXT NOT NULL,
  category TEXT,
  author TEXT,
  ai_summary TEXT,
  key_takeaways TEXT,
  players TEXT,
  coaches TEXT,
  topic TEXT,
  is_rumour INTEGER NOT NULL DEFAULT 0,
  rumour_confidence INTEGER,
  sentiment TEXT,
  tags TEXT,
  duplicate_of TEXT,
  importance INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_enriched_content_published_at
  ON enriched_content (published_at DESC);

CREATE INDEX IF NOT EXISTS idx_enriched_content_importance
  ON enriched_content (importance DESC, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_enriched_content_type
  ON enriched_content (content_type, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_enriched_content_topic
  ON enriched_content (topic, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_enriched_content_rumour
  ON enriched_content (is_rumour, rumour_confidence DESC);
