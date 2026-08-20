PRAGMA foreign_keys=ON;
CREATE TABLE community_posts (
 id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,subject_id TEXT REFERENCES subjects(id) ON DELETE SET NULL,
 category TEXT NOT NULL CHECK(category IN('Question','Study tip','Resource','Discussion')),title TEXT NOT NULL,body TEXT NOT NULL,pinned INTEGER NOT NULL DEFAULT 0 CHECK(pinned IN(0,1)),locked INTEGER NOT NULL DEFAULT 0 CHECK(locked IN(0,1)),created_at TEXT NOT NULL,updated_at TEXT NOT NULL
);
CREATE TABLE community_reactions (post_id TEXT NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,user_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,reaction TEXT NOT NULL CHECK(reaction IN('like','helpful','insightful')),created_at TEXT NOT NULL,updated_at TEXT NOT NULL,PRIMARY KEY(post_id,user_id));
CREATE TABLE community_saves (post_id TEXT NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,user_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,created_at TEXT NOT NULL,PRIMARY KEY(post_id,user_id));
CREATE TABLE community_comments (id TEXT PRIMARY KEY,post_id TEXT NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,user_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,body TEXT NOT NULL,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
CREATE TABLE community_reports (
 id TEXT PRIMARY KEY,post_id TEXT NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,user_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,reason TEXT NOT NULL CHECK(reason IN('Spam','Harassment','Misinformation','Other')),details TEXT NOT NULL DEFAULT '',
 status TEXT NOT NULL DEFAULT 'Open' CHECK(status IN('Open','Resolved','Dismissed')),resolved_by TEXT REFERENCES accounts(id) ON DELETE SET NULL,resolved_at TEXT,resolution_note TEXT NOT NULL DEFAULT '',created_at TEXT NOT NULL,UNIQUE(post_id,user_id)
);
CREATE INDEX idx_posts_course_created ON community_posts(course_id,pinned,created_at);
CREATE INDEX idx_posts_category ON community_posts(course_id,category,created_at);
CREATE INDEX idx_comments_post ON community_comments(post_id,created_at);
CREATE INDEX idx_reports_status ON community_reports(status,created_at);
