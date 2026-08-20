PRAGMA foreign_keys=ON;
CREATE TABLE subjects (
 id TEXT PRIMARY KEY,code TEXT,name_en TEXT NOT NULL,name_ar TEXT NOT NULL,description_en TEXT NOT NULL DEFAULT '',description_ar TEXT NOT NULL DEFAULT '',
 published INTEGER NOT NULL DEFAULT 0 CHECK(published IN(0,1)),archived INTEGER NOT NULL DEFAULT 0 CHECK(archived IN(0,1)),created_by TEXT REFERENCES accounts(id) ON DELETE SET NULL,created_at TEXT NOT NULL,updated_at TEXT NOT NULL
);
CREATE TABLE course_subjects (course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,sort_order INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL,PRIMARY KEY(course_id,subject_id));
CREATE TABLE lectures (
 id TEXT PRIMARY KEY,subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,title_en TEXT NOT NULL,title_ar TEXT NOT NULL,content_en TEXT NOT NULL DEFAULT '',content_ar TEXT NOT NULL DEFAULT '',
 estimated_minutes INTEGER NOT NULL DEFAULT 0 CHECK(estimated_minutes BETWEEN 0 AND 1440),sort_order INTEGER NOT NULL DEFAULT 0,published INTEGER NOT NULL DEFAULT 0 CHECK(published IN(0,1)),archived INTEGER NOT NULL DEFAULT 0 CHECK(archived IN(0,1)),
 created_by TEXT REFERENCES accounts(id) ON DELETE SET NULL,created_at TEXT NOT NULL,updated_at TEXT NOT NULL
);
CREATE TABLE lecture_resources (id TEXT PRIMARY KEY,lecture_id TEXT NOT NULL REFERENCES lectures(id) ON DELETE CASCADE,title TEXT NOT NULL,url TEXT NOT NULL,resource_kind TEXT NOT NULL DEFAULT 'link',sort_order INTEGER NOT NULL DEFAULT 0,created_by TEXT REFERENCES accounts(id) ON DELETE SET NULL,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
CREATE TABLE lecture_progress (
 user_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,lecture_id TEXT NOT NULL REFERENCES lectures(id) ON DELETE CASCADE,subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
 completed INTEGER NOT NULL DEFAULT 0 CHECK(completed IN(0,1)),bookmarked INTEGER NOT NULL DEFAULT 0 CHECK(bookmarked IN(0,1)),completed_at TEXT,updated_at TEXT NOT NULL,PRIMARY KEY(user_id,lecture_id,course_id)
);
CREATE TABLE degree_records (
 id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,title TEXT NOT NULL,
 assessment_kind TEXT NOT NULL,score REAL NOT NULL CHECK(score>=0),max_score REAL NOT NULL CHECK(max_score>0),recorded_by TEXT NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,recorded_at TEXT NOT NULL,updated_at TEXT NOT NULL
);
CREATE TABLE study_activity (
 id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,subject_id TEXT REFERENCES subjects(id) ON DELETE SET NULL,lecture_id TEXT REFERENCES lectures(id) ON DELETE SET NULL,
 schedule_id TEXT,activity_kind TEXT NOT NULL,minutes INTEGER NOT NULL CHECK(minutes BETWEEN 1 AND 1440),occurred_at TEXT NOT NULL,created_at TEXT NOT NULL
);
CREATE INDEX idx_course_subjects_sort ON course_subjects(course_id,sort_order);
CREATE INDEX idx_lectures_subject ON lectures(subject_id,published,sort_order);
CREATE INDEX idx_progress_user_course ON lecture_progress(user_id,course_id,completed);
CREATE INDEX idx_degrees_user_course ON degree_records(user_id,course_id,subject_id,recorded_at);
CREATE INDEX idx_activity_user_course ON study_activity(user_id,course_id,occurred_at);
