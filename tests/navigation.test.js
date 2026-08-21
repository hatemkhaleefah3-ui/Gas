import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const router=fs.readFileSync(new URL('../public/client/router.js',import.meta.url),'utf8');
const navigation=fs.readFileSync(new URL('../public/client/navigation.js',import.meta.url),'utf8');
const i18n=fs.readFileSync(new URL('../public/client/i18n.js',import.meta.url),'utf8');
const rtl=fs.readFileSync(new URL('../public/rtl-adaptive.css',import.meta.url),'utf8');

const subRoutes=[
  '/dashboard/continue','/dashboard/upcoming',
  '/subjects/progress','/subjects/bookmarked',
  '/schedule/agenda','/schedule/completed',
  '/study-rooms/mine','/study-rooms/upcoming',
  '/community/questions','/community/resources','/community/saved'
];

test('every context sub-navigation destination is a real route',()=>{
  for(const path of subRoutes){
    assert.ok(router.includes(`'${path}'`),`router missing ${path}`);
    assert.ok(navigation.includes(`path:'${path}'`),`navigation missing ${path}`);
  }
});

test('primary navigation excludes courses and course switching is a utility',()=>{
  const mainBlock=navigation.slice(navigation.indexOf('const MAIN'),navigation.indexOf('const SUB'));
  assert.ok(!mainBlock.includes("path:'/courses'"));
  assert.ok(navigation.includes('data-course-toggle'));
  assert.ok(navigation.includes('data-course-manage'));
});

test('interface dictionary contains both English and Arabic navigation vocabulary',()=>{
  assert.ok(i18n.includes("en: {"));
  assert.ok(i18n.includes("ar: {"));
  for(const key of ['nav.switchCourse','subjects.progressTitle','community.savedTitle','settings.language']) assert.ok(i18n.includes(`'${key}'`),key);
});

test('tablet navigation mirrors for RTL',()=>{
  assert.ok(rtl.includes('[dir="rtl"] .adaptive-main-nav'));
  assert.ok(rtl.includes('right:0!important'));
  assert.ok(rtl.includes('[dir="rtl"] .secondary-drawer'));
  assert.ok(rtl.includes('left:0!important'));
});
