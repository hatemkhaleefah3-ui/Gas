import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const bootstrap = read('public/app.js');
const experience = read('public/client/prism-experience.js');
const bridge = read('public/client/prism-flow-bridge.js');
const icons = read('public/client/prism-icons.js');
const publicHtml = read('public/index.html');
const desktop = read('public/prism-desktop.css');
const tablet = read('public/prism-tablet.css');
const mobile = read('public/prism-mobile.css');
const motion = read('public/prism-motion.css');

const mainRoutes = ['/dashboard','/subjects','/schedule','/study-rooms','/community'];
const subRoutes = [
  '/dashboard/continue','/dashboard/upcoming',
  '/subjects/progress','/subjects/bookmarked',
  '/schedule/agenda','/schedule/completed',
  '/study-rooms/mine','/study-rooms/upcoming',
  '/community/questions','/community/resources','/community/saved'
];
const secondaryRoutes = ['/work','/scholarships','/volunteer','/donate','/profile','/settings','/courses','/notifications'];

test('Prism bootstrap initializes navigation, experience and flow bridge', () => {
  for (const module of ['navigation.js','prism-experience.js','prism-flow-bridge.js']) {
    assert.ok(bootstrap.includes(module), module);
  }
  assert.ok(bootstrap.includes('initAdaptiveNavigation(root)'));
  assert.ok(bootstrap.includes('initPrismExperience(root)'));
  assert.ok(bootstrap.includes('initPrismFlowBridge(root)'));
});

test('every primary, sub-navigation and secondary route has a Prism destination', () => {
  for (const route of [...mainRoutes, ...subRoutes, ...secondaryRoutes]) {
    assert.ok(experience.includes(`'${route}'`) || experience.includes(`\"${route}\"`), route);
  }
});

test('quick-create flows call real application endpoints', () => {
  for (const endpoint of ['/api/schedule','/api/posts','/api/rooms']) {
    assert.ok(experience.includes(endpoint), endpoint);
  }
  assert.ok(experience.includes("data-prism-action=\"focus\""));
});

test('profile and account actions are connected to canonical APIs', () => {
  assert.ok(bridge.includes("patch('/api/profile'"));
  assert.ok(bridge.includes("patch('/api/account/password'"));
  for (const selector of ['#addSchedule','#newPost','#newRoom','#editProfile','#changePassword']) {
    assert.ok(bridge.includes(selector), selector);
  }
});

test('Prism provides a cohesive custom icon system', () => {
  for (const name of ['home','learn','plan','rooms','community','work','scholarship','volunteer','donate','profile','settings','courses','notifications','focus']) {
    assert.ok(icons.includes(`${name}:`), name);
  }
  assert.ok(icons.includes('export function prismIcon'));
});

test('new typography and all device themes are loaded', () => {
  for (const font of ['Space+Grotesk','DM+Sans','IBM+Plex+Sans+Arabic']) assert.ok(publicHtml.includes(font), font);
  for (const file of ['prism-theme.css','prism-desktop.css','prism-tablet.css','prism-mobile.css','prism-motion.css','prism-polish.css']) {
    assert.ok(publicHtml.includes(file), file);
  }
});

test('desktop, tablet and mobile use intentionally different compositions', () => {
  assert.ok(desktop.includes('wide command-centre composition'));
  assert.ok(desktop.includes('grid-template-columns:112px 1fr 360px'));
  assert.ok(tablet.includes('language-aware studio rail'));
  assert.ok(tablet.includes('[dir=rtl] .adaptive-main-nav'));
  assert.ok(tablet.includes('[dir=rtl] .secondary-drawer'));
  assert.ok(mobile.includes('tactile bottom dock'));
  assert.ok(mobile.includes('scroll-snap-type:x mandatory'));
  assert.ok(mobile.includes('bottom:10px'));
});

test('motion system is interactive and respects reduced-motion preferences', () => {
  for (const token of ['prismFloat','prismPulse','prismRouteIn','prismDockIn','prism-reveal']) assert.ok(motion.includes(token), token);
  assert.ok(motion.includes('@media (prefers-reduced-motion:reduce)'));
  assert.ok(experience.includes('IntersectionObserver'));
  assert.ok(experience.includes('pointermove'));
});

test('workspace expansion includes route-specific information modules', () => {
  for (const module of ['dashboardModules','subjectModules','scheduleModules','roomModules','communityModules','opportunityModules','profileModules','settingsModules']) {
    assert.ok(experience.includes(`function ${module}`), module);
  }
  assert.ok(experience.includes('Cmd/Ctrl+K') || experience.includes("key.toLowerCase()==='k'"));
});
