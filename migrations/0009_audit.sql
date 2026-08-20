PRAGMA foreign_keys=ON;
CREATE TABLE audit_events (
 id TEXT PRIMARY KEY,actor_user_id TEXT REFERENCES accounts(id) ON DELETE SET NULL,target_user_id TEXT REFERENCES accounts(id) ON DELETE SET NULL,action TEXT NOT NULL,entity_kind TEXT NOT NULL,entity_id TEXT,
 course_id TEXT REFERENCES courses(id) ON DELETE SET NULL,metadata TEXT NOT NULL DEFAULT '{}',request_id TEXT,created_at TEXT NOT NULL
);
CREATE INDEX idx_audit_created ON audit_events(created_at);
CREATE INDEX idx_audit_actor ON audit_events(actor_user_id,created_at);
CREATE INDEX idx_audit_target ON audit_events(target_user_id,created_at);
