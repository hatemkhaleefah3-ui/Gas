import { readCookie, hashToken } from '../security.js';
import { first } from '../db.js';
import { activeCourse } from '../course-context.js';
export async function sessionContext(request, env) {
  const raw = readCookie(request, 'dafati_session');
  if (!raw) return { user: null, activeCourse: null, tokenHash: null };
  const tokenHash = hashToken(raw);
  const user = await first(env.DB, `SELECT a.* FROM account_sessions s JOIN accounts a ON a.id=s.user_id WHERE s.token_hash=? AND s.expires_at>? LIMIT 1`, tokenHash, new Date().toISOString());
  if (!user || user.status !== 'ACTIVE') return { user: null, activeCourse: null, tokenHash };
  const course = await activeCourse(env.DB, user.id);
  return { user, activeCourse: course, tokenHash };
}
export function requireAuth(ctx) { if (!ctx.user) throw Object.assign(new Error('Sign in required'), { status:401, code:'UNAUTHENTICATED' }); return ctx.user; }
export function requireManager(ctx) { const user=requireAuth(ctx); if(user.role!=='MANAGER') throw Object.assign(new Error('Manager access required'), { status:403, code:'FORBIDDEN' }); return user; }
export function requireCourse(ctx) { requireAuth(ctx); if(!ctx.activeCourse) throw Object.assign(new Error('Choose an active course'), { status:409, code:'NO_ACTIVE_COURSE' }); return ctx.activeCourse; }
