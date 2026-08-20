import test from 'node:test';
import assert from 'node:assert/strict';
import { email, password, safeUrl, numberIn, ValidationError } from '../worker/validation.js';

test('email normalizes case and whitespace',()=>assert.equal(email('  STUDENT@Example.com '),'student@example.com'));
test('password enforces 8..128',()=>{assert.throws(()=>password('short'),ValidationError);assert.equal(password('long-enough'),'long-enough')});
test('URLs reject script protocols',()=>assert.throws(()=>safeUrl('javascript:alert(1)'),ValidationError));
test('bounded numeric values reject overflow',()=>assert.throws(()=>numberIn(51,2,50,'capacity'),ValidationError));
