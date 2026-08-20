PRAGMA foreign_keys=ON;
CREATE TABLE study_rooms (
 id TEXT PRIMARY KEY,owner_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,subject_id TEXT REFERENCES subjects(id) ON DELETE SET NULL,name TEXT NOT NULL,topic TEXT NOT NULL DEFAULT '',description TEXT NOT NULL DEFAULT '',
 starts_at TEXT,duration_minutes INTEGER NOT NULL CHECK(duration_minutes BETWEEN 15 AND 360),capacity INTEGER NOT NULL CHECK(capacity BETWEEN 2 AND 50),visibility TEXT NOT NULL CHECK(visibility IN('Open','Approval')),status TEXT NOT NULL DEFAULT 'Open' CHECK(status IN('Open','Closed','Completed')),created_at TEXT NOT NULL,updated_at TEXT NOT NULL
);
CREATE TABLE room_members (room_id TEXT NOT NULL REFERENCES study_rooms(id) ON DELETE CASCADE,user_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,role TEXT NOT NULL CHECK(role IN('Host','Member')),joined_at TEXT NOT NULL,PRIMARY KEY(room_id,user_id));
CREATE TABLE room_join_requests (room_id TEXT NOT NULL REFERENCES study_rooms(id) ON DELETE CASCADE,user_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN('Pending','Approved','Declined')),created_at TEXT NOT NULL,updated_at TEXT NOT NULL,PRIMARY KEY(room_id,user_id));
CREATE TABLE room_messages (id TEXT PRIMARY KEY,room_id TEXT NOT NULL REFERENCES study_rooms(id) ON DELETE CASCADE,user_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,body TEXT NOT NULL,message_kind TEXT NOT NULL CHECK(message_kind IN('Message','Announcement')),created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
CREATE TABLE room_resources (id TEXT PRIMARY KEY,room_id TEXT NOT NULL REFERENCES study_rooms(id) ON DELETE CASCADE,user_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,title TEXT NOT NULL,url TEXT NOT NULL,note TEXT NOT NULL DEFAULT '',created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
CREATE TABLE room_tasks (id TEXT PRIMARY KEY,room_id TEXT NOT NULL REFERENCES study_rooms(id) ON DELETE CASCADE,creator_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,title TEXT NOT NULL,due_at TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
CREATE TABLE room_task_completions (task_id TEXT NOT NULL REFERENCES room_tasks(id) ON DELETE CASCADE,user_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,completed_at TEXT NOT NULL,PRIMARY KEY(task_id,user_id));
CREATE INDEX idx_rooms_course ON study_rooms(course_id,status,starts_at);
CREATE INDEX idx_room_members_room ON room_members(room_id);
CREATE INDEX idx_room_members_user ON room_members(user_id);
CREATE INDEX idx_room_requests ON room_join_requests(room_id,status);
CREATE INDEX idx_room_messages ON room_messages(room_id,created_at);
CREATE INDEX idx_room_tasks ON room_tasks(room_id,due_at);
