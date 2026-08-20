import { id, now, newSessionToken, hashToken, hashPassword, verifyPassword } from '../security.js';
import { first } from '../db.js';
export async function createSession(db, userId) {
  const raw = newSessionToken(); const tokenHash = hashToken(raw); const created = now(); const expires = new Date(Date.now()+7*86400000).toISOString();
  await db.prepare(`INSERT INTO account_sessions(token_hash,user_id,created_at,expires_at,last_seen_at) VALUES(?,?,?,?,?)`).bind(tokenHash,userId,created,expires,created).run();
  return raw;
}
export async function authenticate(db, email, password) {
  const user = await first(db, `SELECT * FROM accounts WHERE email=? COLLATE NOCASE`, email);
  if (!user || user.status !== 'ACTIVE' || !verifyPassword(password, user.password_hash)) return null;
  return user;
}
export async function uniqueUsername(db, email) {
  const local = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g,'').slice(0,32) || 'student';
  let candidate=local; let n=1;
  while(await first(db,`SELECT 1 ok FROM accounts WHERE username=? COLLATE NOCASE`,candidate)) candidate=`${local}${++n}`;
  return candidate;
}
export { hashPassword, id, now };
