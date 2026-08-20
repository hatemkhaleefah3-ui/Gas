PRAGMA foreign_keys=ON;
CREATE TABLE schedule_items (
 id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,title TEXT NOT NULL,subject_id TEXT REFERENCES subjects(id) ON DELETE SET NULL,
 category TEXT NOT NULL DEFAULT 'study',starts_at TEXT NOT NULL,ends_at TEXT NOT NULL,reminder INTEGER NOT NULL DEFAULT 0 CHECK(reminder IN(0,1)),completed INTEGER NOT NULL DEFAULT 0 CHECK(completed IN(0,1)),completed_at TEXT,
 created_by TEXT NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL
);
CREATE INDEX idx_schedule_user_course ON schedule_items(user_id,course_id,starts_at);
CREATE INDEX idx_schedule_completion ON schedule_items(user_id,completed,starts_at);
CREATE UNIQUE INDEX idx_schedule_completion_activity ON study_activity(schedule_id) WHERE schedule_id IS NOT NULL AND activity_kind='schedule_completion';
