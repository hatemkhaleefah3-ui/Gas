import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword, newSessionToken, hashToken, sessionCookie } from '../worker/security.js';

test('password hashes are scrypt and verify without storing raw password',()=>{const h=hashPassword('correct horse');assert.match(h,/^scrypt\$/);assert.ok(!h.includes('correct horse'));assert.equal(verifyPassword('correct horse',h),true);assert.equal(verifyPassword('wrong password',h),false)});
test('session token is stored as hashable opaque entropy',()=>{const token=newSessionToken();assert.ok(token.length>32);assert.equal(hashToken(token).length,64)});
test('session cookie uses required security attributes',()=>{const c=sessionCookie('token');for(const x of ['HttpOnly','Secure','SameSite=Lax','Path=/','Max-Age=604800'])assert.ok(c.includes(x))});
