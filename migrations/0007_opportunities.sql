PRAGMA foreign_keys=ON;
CREATE TABLE opportunities (
 id TEXT PRIMARY KEY,category TEXT NOT NULL CHECK(category IN('work','scholarship','volunteer')),title_en TEXT NOT NULL,title_ar TEXT NOT NULL,organization TEXT NOT NULL,description_en TEXT NOT NULL DEFAULT '',description_ar TEXT NOT NULL DEFAULT '',
 eligibility_en TEXT NOT NULL DEFAULT '',eligibility_ar TEXT NOT NULL DEFAULT '',skills TEXT NOT NULL DEFAULT '[]',location TEXT NOT NULL DEFAULT '',mode TEXT NOT NULL DEFAULT '',level TEXT NOT NULL DEFAULT '',deadline TEXT,application_url TEXT NOT NULL,
 published INTEGER NOT NULL DEFAULT 0 CHECK(published IN(0,1)),published_at TEXT,created_by TEXT NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL
);
CREATE TABLE saved_opportunities (user_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,opportunity_id TEXT NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,created_at TEXT NOT NULL,PRIMARY KEY(user_id,opportunity_id));
CREATE INDEX idx_opportunities_publish ON opportunities(category,published,published_at);
CREATE INDEX idx_opportunities_deadline ON opportunities(deadline);
CREATE INDEX idx_saved_opportunities_user ON saved_opportunities(user_id);
