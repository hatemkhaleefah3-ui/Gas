PRAGMA foreign_keys=ON;
CREATE TABLE accounts (
 id TEXT PRIMARY KEY,email TEXT NOT NULL UNIQUE COLLATE NOCASE,username TEXT NOT NULL UNIQUE COLLATE NOCASE,password_hash TEXT NOT NULL,
 role TEXT NOT NULL CHECK(role IN('STUDENT','MANAGER')),full_name TEXT NOT NULL,bio TEXT NOT NULL DEFAULT '',learning_goal TEXT NOT NULL DEFAULT '',
 streak INTEGER NOT NULL DEFAULT 0 CHECK(streak>=0),status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN('ACTIVE','SUSPENDED')),
 joined_at TEXT NOT NULL,updated_at TEXT NOT NULL,last_login_at TEXT
);
CREATE TABLE account_settings (
 user_id TEXT PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,preferred_language TEXT NOT NULL DEFAULT 'en' CHECK(preferred_language IN('en','ar')),
 study_reminders INTEGER NOT NULL DEFAULT 1 CHECK(study_reminders IN(0,1)),scholarship_alerts INTEGER NOT NULL DEFAULT 1 CHECK(scholarship_alerts IN(0,1)),
 job_alerts INTEGER NOT NULL DEFAULT 1 CHECK(job_alerts IN(0,1)),volunteer_alerts INTEGER NOT NULL DEFAULT 1 CHECK(volunteer_alerts IN(0,1)),
 community_notifications INTEGER NOT NULL DEFAULT 1 CHECK(community_notifications IN(0,1)),room_notifications INTEGER NOT NULL DEFAULT 1 CHECK(room_notifications IN(0,1)),
 profile_visibility TEXT NOT NULL DEFAULT 'classmates' CHECK(profile_visibility IN('everyone','classmates','private')),updated_at TEXT NOT NULL
);
CREATE TABLE account_sessions (token_hash TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,created_at TEXT NOT NULL,expires_at TEXT NOT NULL,last_seen_at TEXT);
CREATE TABLE account_academics (
 user_id TEXT PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,educational_stage TEXT NOT NULL,grade TEXT,academic_field TEXT,college TEXT,
 institution_category TEXT NOT NULL CHECK(institution_category IN('SCHOOL','UNIVERSITY','OTHER')),institution_name TEXT NOT NULL,country TEXT,photo_key TEXT NOT NULL,updated_at TEXT NOT NULL
);
CREATE INDEX idx_sessions_user ON account_sessions(user_id);
CREATE INDEX idx_sessions_expiry ON account_sessions(expires_at);
