import { first } from './db.js';
export async function activeCourse(db, userId) {
  return first(db, `SELECT c.*, ce.position, ce.source FROM course_enrollments ce JOIN courses c ON c.id=ce.course_id WHERE ce.user_id=? AND ce.active=1 LIMIT 1`, userId);
}
export async function assertSubjectInCourse(db, subjectId, courseId) {
  const row = await first(db, `SELECT 1 ok FROM course_subjects WHERE subject_id=? AND course_id=?`, subjectId, courseId);
  if (!row) throw Object.assign(new Error('Record not found'), { status: 404, code: 'NOT_FOUND' });
}
