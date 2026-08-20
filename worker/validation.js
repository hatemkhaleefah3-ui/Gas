export class ValidationError extends Error {
  constructor(fields, message = 'Please correct the highlighted fields.') { super(message); this.fields = fields; }
}
export const trim = (value) => typeof value === 'string' ? value.trim() : '';
export function requireText(body, name, max) {
  const value = trim(body[name]);
  if (!value) throw new ValidationError({ [name]: 'Required' });
  if (value.length > max) throw new ValidationError({ [name]: `Must be ${max} characters or fewer` });
  return value;
}
export function optionalText(body, name, max) {
  const value = trim(body[name]);
  if (value.length > max) throw new ValidationError({ [name]: `Must be ${max} characters or fewer` });
  return value;
}
export function email(value) {
  const result = trim(value).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result)) throw new ValidationError({ email: 'Enter a valid email' });
  return result;
}
export function password(value) {
  const result = String(value || '');
  if (result.length < 8 || result.length > 128) throw new ValidationError({ password: 'Password must be 8–128 characters' });
  return result;
}
export function oneOf(value, allowed, field) {
  if (!allowed.includes(value)) throw new ValidationError({ [field]: `Must be one of: ${allowed.join(', ')}` });
  return value;
}
export function bool(value, field) {
  if (typeof value !== 'boolean') throw new ValidationError({ [field]: 'Must be true or false' });
  return value;
}
export function numberIn(value, min, max, field) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < min || n > max) throw new ValidationError({ [field]: `Must be between ${min} and ${max}` });
  return n;
}
export function safeUrl(value, field = 'url') {
  let url; try { url = new URL(trim(value)); } catch { throw new ValidationError({ [field]: 'Enter a valid URL' }); }
  if (!['http:', 'https:'].includes(url.protocol)) throw new ValidationError({ [field]: 'Only http and https URLs are allowed' });
  return url.toString();
}
export function rejectUnknown(body, allowed) {
  const extras = Object.keys(body).filter(key => !allowed.includes(key));
  if (extras.length) throw new ValidationError(Object.fromEntries(extras.map(k => [k, 'Unexpected field'])));
}
