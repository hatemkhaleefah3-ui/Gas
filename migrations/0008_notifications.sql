PRAGMA foreign_keys=ON;
CREATE TABLE notifications (
 id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,category TEXT NOT NULL CHECK(category IN('study','community','room','work','scholarship','volunteer','account','moderation')),event TEXT NOT NULL,title TEXT NOT NULL,body TEXT NOT NULL,
 path TEXT,source_type TEXT,source_id TEXT,dedupe_key TEXT,read INTEGER NOT NULL DEFAULT 0 CHECK(read IN(0,1)),read_at TEXT,created_at TEXT NOT NULL,UNIQUE(user_id,dedupe_key)
);
CREATE INDEX idx_notifications_unread ON notifications(user_id,read,created_at DESC);
CREATE INDEX idx_notifications_created ON notifications(user_id,created_at DESC);
