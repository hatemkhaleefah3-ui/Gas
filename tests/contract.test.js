import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const router=fs.readFileSync(new URL('../public/client/router.js',import.meta.url),'utf8');
const worker=fs.readFileSync(new URL('../worker/router.js',import.meta.url),'utf8');
const migrations=Array.from({length:9},(_,i)=>fs.readFileSync(new URL(`../migrations/000${i+1}_${['accounts','courses','learning','schedule','community','rooms','opportunities','notifications','audit'][i]}.sql`,import.meta.url),'utf8')).join('\n');

test('all 25 canonical routes are registered',()=>{for(const path of ['/','/sign-in','/sign-up','/dashboard','/subjects','/subjects/:subjectId','/subjects/:subjectId/lectures/:lectureId','/schedule','/study-rooms','/study-rooms/:roomId','/community','/community/:postId','/work','/scholarships','/volunteer','/opportunities/:opportunityId','/courses','/notifications','/profile','/users/:userId','/settings','/manager/reports','/manager/students','/manager/students/:userId','/manager/audit'])assert.ok(router.includes(`'${path}'`),path)});
test('privileged routes use manager authorization',()=>assert.ok(worker.includes('requireManager(ctx)')));
test('canonical structured entities live in D1 migrations',()=>{for(const table of ['accounts','account_settings','account_sessions','account_academics','courses','course_enrollments','subjects','course_subjects','lectures','lecture_resources','lecture_progress','degree_records','study_activity','schedule_items','community_posts','community_reactions','community_saves','community_comments','community_reports','study_rooms','room_members','room_join_requests','room_messages','room_resources','room_tasks','room_task_completions','opportunities','saved_opportunities','notifications','audit_events'])assert.ok(migrations.includes(`CREATE TABLE ${table}`),table)});
test('course isolation is represented by active-course checks',()=>{assert.ok(worker.includes('requireCourse(ctx)'));assert.ok(worker.includes('assertSubjectInCourse'))});
