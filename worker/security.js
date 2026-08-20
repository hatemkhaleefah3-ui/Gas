import { randomBytes, createHash, scryptSync, timingSafeEqual } from 'node:crypto';

export const now = () => new Date().toISOString();
export const id = (prefix = 'id') => `${prefix}_${crypto.randomUUID().replaceAll('-', '')}`;
export const hashToken = token => createHash('sha256').update(token).digest('hex');
export const newSessionToken = () => randomBytes(32).toString('base64url');
export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const digest = scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${digest}`;
}
export function verifyPassword(password, encoded) {
  const [kind, salt, digest] = String(encoded || '').split('$');
  if (kind !== 'scrypt' || !salt || !digest) return false;
  const expected = Buffer.from(digest, 'hex');
  const actual = scryptSync(password, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
export function sessionCookie(token) {
  return `dafati_session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`;
}
export const clearSessionCookie = () => 'dafati_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0';
export function readCookie(request, name) {
  const raw = request.headers.get('cookie') || '';
  for (const part of raw.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return null;
}
export function assertMutationOrigin(request) {
  if (!['POST','PATCH','PUT','DELETE'].includes(request.method)) return;
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) throw Object.assign(new Error('Cross-origin mutation rejected'), { status: 403, code: 'INVALID_ORIGIN' });
}
