import { state } from '/client/state.js';

const routes = [
  ['/', 'landing', 'public'], ['/sign-in','signin','public-only'], ['/sign-up','signup','public-only'],
  ['/dashboard','dashboard','auth'], ['/subjects','subjects','course'], ['/subjects/:subjectId','subject-detail','course'], ['/subjects/:subjectId/lectures/:lectureId','lecture','course'],
  ['/schedule','schedule','course'], ['/study-rooms','rooms','course'], ['/study-rooms/:roomId','room-detail','course'], ['/community','community','course'], ['/community/:postId','post-detail','course'],
  ['/work','opportunities','auth'], ['/scholarships','opportunities','auth'], ['/volunteer','opportunities','auth'], ['/opportunities/:opportunityId','opportunity-detail','auth'], ['/donate','donate','auth'],
  ['/courses','courses','auth'], ['/notifications','notifications','auth'], ['/profile','profile','auth'], ['/users/:userId','user-profile','auth'], ['/settings','settings','auth'],
  ['/manager/reports','manager-reports','manager'], ['/manager/students','manager-students','manager'], ['/manager/students/:userId','manager-student','manager'], ['/manager/audit','manager-audit','manager']
];

function compile(pattern) {
  const keys = [];
  const source = pattern.replace(/:[^/]+/g, token => { keys.push(token.slice(1)); return '([^/]+)'; });
  return { regex: new RegExp(`^${source === '/' ? '\\/' : source}$`), keys };
}

export function resolve(path = location.pathname) {
  for (const [pattern, name, access] of routes) {
    const { regex, keys } = compile(pattern);
    const match = path.match(regex);
    if (match) return { name, access, params: Object.fromEntries(keys.map((k,i)=>[k, decodeURIComponent(match[i+1])])) };
  }
  return { name:'not-found', access:'public', params:{} };
}

export function guard(route) {
  const user = state.session.user;
  if (route.access === 'public-only' && user) return '/dashboard';
  if (['auth','course','manager'].includes(route.access) && !user) return `/sign-in?next=${encodeURIComponent(location.pathname + location.search)}`;
  if (route.access === 'course' && !state.session.activeCourse) return '/courses?reason=no-active-course';
  if (route.access === 'manager' && user?.role !== 'MANAGER') return '/forbidden';
  return null;
}

export function navigate(path, { replace = false } = {}) {
  history[replace ? 'replaceState' : 'pushState']({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export const routeTable = routes;
