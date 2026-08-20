PRAGMA foreign_keys=ON;
CREATE TABLE courses (
 id TEXT PRIMARY KEY,slug TEXT NOT NULL UNIQUE,name_en TEXT NOT NULL,name_ar TEXT NOT NULL,description_en TEXT NOT NULL DEFAULT '',description_ar TEXT NOT NULL DEFAULT '',
 audience TEXT NOT NULL CHECK(audience IN('TARGETED','PUBLIC')),educational_stage TEXT,grade TEXT,academic_field TEXT,college TEXT,
 institution_category TEXT CHECK(institution_category IN('SCHOOL','UNIVERSITY','OTHER')),institution_name TEXT,published INTEGER NOT NULL DEFAULT 0 CHECK(published IN(0,1)),created_at TEXT NOT NULL,updated_at TEXT NOT NULL
);
CREATE TABLE course_enrollments (
 user_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,position INTEGER NOT NULL CHECK(position BETWEEN 1 AND 3),
 active INTEGER NOT NULL DEFAULT 0 CHECK(active IN(0,1)),source TEXT NOT NULL CHECK(source IN('AUTO','SELF','MANAGER')),enrolled_at TEXT NOT NULL,updated_at TEXT NOT NULL,
 PRIMARY KEY(user_id,course_id),UNIQUE(user_id,position)
);
CREATE UNIQUE INDEX idx_one_active_course ON course_enrollments(user_id) WHERE active=1;
CREATE INDEX idx_enrollments_course ON course_enrollments(course_id);
CREATE INDEX idx_enrollments_active ON course_enrollments(user_id,active);
