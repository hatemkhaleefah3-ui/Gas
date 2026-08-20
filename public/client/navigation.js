import { navigate } from '/client/router.js';
import { state } from '/client/state.js';
import { post } from '/client/api.js';
import { loadSession } from '/client/session.js';

const SVG = {
  home:'<path d="M3.5 10.5 12 3.8l8.5 6.7"/><path d="M5.5 9.5v10h13v-10"/><path d="M9.5 19.5v-6h5v6"/>',
  book:'<path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H12v18H7.5A3.5 3.5 0 0 0 4 23V5.5Z"/><path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H12v18h4.5A3.5 3.5 0 0 1 20 23V5.5Z"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/><path d="M8 14h3M14 14h2M8 17h2"/>',
  users:'<path d="M16 20v-1.5A4.5 4.5 0 0 0 11.5 14h-4A4.5 4.5 0 0 0 3 18.5V20"/><circle cx="9.5" cy="7" r="3"/><path d="M18 8a3 3 0 0 1 0 6M21 20v-1.5a4.5 4.5 0 0 0-3-4.2"/>',
  chat:'<path d="M21 12a8 8 0 0 1-8 8H7l-4 2 1.5-4.5A8.5 8.5 0 1 1 21 12Z"/><path d="M8 11h.01M12 11h.01M16 11h.01"/>',
  grid:'<rect x="4" y="4" width="6" height="6" rx="1.5"/><rect x="14" y="4" width="6" height="6" rx="1.5"/><rect x="4" y="14" width="6" height="6" rx="1.5"/><rect x="14" y="14" width="6" height="6" rx="1.5"/>',
  arrowUpRight:'<path d="M7 17 17 7M8 7h9v9"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  chart:'<path d="M4 19V9M10 19V5M16 19v-7M22 19V3"/>',
  bookmark:'<path d="M6 4.8A1.8 1.8 0 0 1 7.8 3h8.4A1.8 1.8 0 0 1 18 4.8V21l-6-3.5L6 21V4.8Z"/>',
  list:'<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6h.01M4 12h.01M4 18h.01"/>',
  checkCircle:'<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.3 2.4 4.9-5"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  sparkles:'<path d="m12 3 1.25 3.25L16.5 7.5l-3.25 1.25L12 12l-1.25-3.25L7.5 7.5l3.25-1.25L12 3Z"/><path d="m19 14 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z"/><path d="m5 14 .7 1.8 1.8.7-1.8.7L5 19l-.7-1.8-1.8-.7 1.8-.7L5 14Z"/>',
  briefcase:'<rect x="3" y="7" width="18" height="13" rx="3"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"/>',
  scholarship:'<path d="m3 9 9-5 9 5-9 5-9-5Z"/><path d="M7 12v4.5c2.8 2 7.2 2 10 0V12M21 10v6"/>',
  heart:'<path d="M20.8 5.9a5 5 0 0 0-7.1 0L12 7.6l-1.7-1.7a5 5 0 0 0-7.1 7.1L12 21l8.8-8a5 5 0 0 0 0-7.1Z"/>',
  donate:'<path d="M12 21s-7-4.2-7-9.2A4.4 4.4 0 0 1 12 8a4.4 4.4 0 0 1 7 3.8C19 16.8 12 21 12 21Z"/><path d="M12 8V3M9.5 5.5 12 3l2.5 2.5"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .86V20.5h-4v-.24a1.7 1.7 0 0 0-1-.86 1.7 1.7 0 0 0-1.87.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.86-1H3.5v-4h.24a1.7 1.7 0 0 0 .86-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.86V3.5h4v.24a1.7 1.7 0 0 0 1 .86 1.7 1.7 0 0 0 1.87-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.16.39.46.71.86 1h.24v4h-.24c-.4.29-.7.61-.86 1Z"/>',
  bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z"/><path d="M10 21h4"/>',
  layers:'<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/>',
  chevronDown:'<path d="m8 10 4 4 4-4"/>',
  arrowLeft:'<path d="m14 7-5 5 5 5M9 12h10"/>',
  arrowRight:'<path d="m10 7 5 5-5 5M5 12h10"/>',
  menu:'<path d="M5 8h14M5 16h14"/>',
  close:'<path d="m7 7 10 10M17 7 7 17"/>',
  shield:'<path d="M12 3 5 6v5c0 5 3.2 8.3 7 10 3.8-1.7 7-5 7-10V6l-7-3Z"/>',
  alert:'<path d="M12 4 3 20h18L12 4Z"/><path d="M12 9v5M12 17h.01"/>'
};

function icon(name, className='nav-svg') {
  return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${SVG[name] || SVG.sparkles}</svg>`;
}

const MAIN = [
  { key:'home', label:'Home', icon:'home', path:'/dashboard', match:['/dashboard'] },
  { key:'learn', label:'Learn', icon:'book', path:'/subjects', match:['/subjects'] },
  { key:'plan', label:'Plan', icon:'calendar', path:'/schedule', match:['/schedule'] },
  { key:'rooms', label:'Rooms', icon:'users', path:'/study-rooms', match:['/study-rooms'] },
  { key:'community', label:'Community', icon:'chat', path:'/community', match:['/community'] }
];

const SUB = {
  home: [
    { label:'Overview', icon:'grid', action:'top' },
    { label:'Continue', icon:'arrowUpRight', action:'continue' },
    { label:'Upcoming', icon:'clock', action:'upcoming' }
  ],
  learn: [
    { label:'Subjects', icon:'book', path:'/subjects' },
    { label:'Progress', icon:'chart', action:'progress' },
    { label:'Bookmarked', icon:'bookmark', action:'bookmarked' }
  ],
  plan: [
    { label:'Week', icon:'calendar', action:'week' },
    { label:'Agenda', icon:'list', action:'agenda' },
    { label:'Completed', icon:'checkCircle', action:'completed' }
  ],
  rooms: [
    { label:'Discover', icon:'search', path:'/study-rooms' },
    { label:'My rooms', icon:'users', action:'mine' },
    { label:'Upcoming', icon:'clock', action:'upcoming-rooms' }
  ],
  community: [
    { label:'Feed', icon:'chat', path:'/community' },
    { label:'Questions', icon:'search', action:'questions' },
    { label:'Resources', icon:'sparkles', action:'resources' },
    { label:'Saved', icon:'bookmark', action:'saved' }
  ]
};

const SECONDARY = [
  { label:'Work', icon:'briefcase', path:'/work', description:'Jobs & internships' },
  { label:'Scholarships', icon:'scholarship', path:'/scholarships', description:'Funding opportunities' },
  { label:'Volunteer', icon:'heart', path:'/volunteer', description:'Give your time' },
  { label:'Donate', icon:'donate', path:'/donate', description:'Support student access' },
  { label:'Profile', icon:'user', path:'/profile', description:'Identity & academics' },
  { label:'Settings', icon:'settings', path:'/settings', description:'Preferences & privacy' }
];

let root;
let observer;
let frame;
let activeSubAction = sessionStorage.getItem('dafati.subnav.action') || '';

const escapeHtml = (value='') => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const currentMain = () => MAIN.find(item => item.match.some(prefix => location.pathname.startsWith(prefix))) || null;
const isSecondaryRoute = () => SECONDARY.some(item => location.pathname.startsWith(item.path)) || location.pathname.startsWith('/manager/') || location.pathname.startsWith('/courses');
const enrolledCourses = () => state.session.enrollments || [];
const enrollmentCourseId = enrollment => enrollment.course_id || enrollment.course?.id || enrollment.id;
const enrollmentName = enrollment => enrollment.course?.[`name_${state.language}`] || enrollment[`name_${state.language}`] || enrollment.course?.name_en || enrollment.name_en || enrollment.course?.name || enrollment.name || 'Course';
const activeCourseId = () => state.session.activeCourse?.id || enrolledCourses().find(item => item.active)?.course_id || null;
const activeCourseName = () => state.session.activeCourse?.[`name_${state.language}`] || state.session.activeCourse?.name_en || state.session.activeCourse?.name || 'Courses';

function navMarkup(section=null) {
  if (section && !isSecondaryRoute()) {
    const items=SUB[section.key]||[];
    return `<button class="nav-back" data-nav-back aria-label="Back to main navigation" title="Back to main navigation"><span class="nav-icon-wrap">${icon('arrowLeft')}</span><b>${section.label}</b></button>${items.map((item,index)=>`<button class="adaptive-nav-item sub-item ${activeSubAction===(item.action||item.path)||(!activeSubAction&&index===0)?'active':''}" data-sub-action="${escapeHtml(item.action||'')}" data-sub-path="${escapeHtml(item.path||'')}" aria-label="${escapeHtml(item.label)}" title="${escapeHtml(item.label)}"><span class="nav-icon-wrap">${icon(item.icon)}</span><b>${item.label}</b></button>`).join('')}`;
  }
  return MAIN.map(item=>`<button class="adaptive-nav-item ${location.pathname.startsWith(item.path)?'active':''}" data-main-path="${item.path}" aria-label="${escapeHtml(item.label)}" title="${escapeHtml(item.label)}"><span class="nav-icon-wrap">${icon(item.icon)}</span><b>${item.label}</b></button>`).join('');
}

function courseSwitcherMarkup() {
  const activeId=activeCourseId();
  const courses=enrolledCourses();
  return `<div class="course-switch-wrap">
    <button class="utility-course" data-course-toggle aria-label="Switch course" aria-expanded="false" title="Switch course">
      <span class="utility-course-icon">${icon('layers')}</span>
      <span class="utility-course-label">${escapeHtml(activeCourseName())}</span>
      <span class="course-chevron">${icon('chevronDown')}</span>
    </button>
    <div class="course-switcher" data-course-menu hidden>
      <div class="course-switcher-head"><span>Active course</span><b>${escapeHtml(activeCourseName())}</b></div>
      <div class="course-switcher-list">
        ${courses.length?courses.map((course,index)=>{const id=enrollmentCourseId(course);const active=id===activeId||!!course.active;return `<button class="course-option ${active?'active':''}" data-course-id="${escapeHtml(id||'')}" ${active?'aria-current="true"':''}><span class="course-option-icon">${icon(active?'checkCircle':'book')}</span><span><b>${escapeHtml(enrollmentName(course))}</b><small>${active?'Currently active':`Course ${course.position||index+1}`}</small></span>${active?'<i>Active</i>':''}</button>`;}).join(''):'<div class="course-switcher-empty">No enrolled courses yet.</div>'}
      </div>
      <a href="/courses" data-course-manage>${icon('settings')}<span>Manage courses</span>${icon('arrowRight')}</a>
    </div>
  </div>`;
}

function utilityMarkup() {
  return `<div class="adaptive-utility">
    <button class="utility-menu" data-sidebar-open aria-label="Open secondary navigation" title="Menu">${icon('menu')}</button>
    <div class="utility-brand"><span class="brand-mark mini">د</span><b>DAFATI</b></div>
    <div class="utility-actions">
      ${courseSwitcherMarkup()}
      <button class="utility-notification ${state.notifications.unreadCount?'has-unread':''}" data-nav-notifications aria-label="Notifications" title="Notifications">${icon('bell')}${state.notifications.unreadCount?`<i>${state.notifications.unreadCount}</i>`:''}</button>
    </div>
  </div>`;
}

function sidebarMarkup() {
  const user=state.session.user||{};
  const manager=user.role==='MANAGER'?`<div class="drawer-section-label">MANAGER</div><nav class="secondary-links manager-links"><a href="/manager/students" data-secondary-link><span>${icon('users')}</span><div><b>Students</b><small>Administration</small></div><i>${icon('arrowRight')}</i></a><a href="/manager/reports" data-secondary-link><span>${icon('alert')}</span><div><b>Reports</b><small>Moderation queue</small></div><i>${icon('arrowRight')}</i></a><a href="/manager/audit" data-secondary-link><span>${icon('shield')}</span><div><b>Audit</b><small>Privileged activity</small></div><i>${icon('arrowRight')}</i></a></nav>`:'';
  return `<div class="secondary-scrim" data-sidebar-close></div><aside class="secondary-drawer" aria-label="Secondary navigation" aria-hidden="true">
    <div class="drawer-head"><div class="brand drawer-brand"><span class="brand-mark">د</span><div><strong>DAFATI</strong><small>Campusly</small></div></div><button class="drawer-close" data-sidebar-close aria-label="Close menu">${icon('close')}</button></div>
    <div class="drawer-profile"><span class="drawer-avatar">${escapeHtml(user.full_name?.[0]||'S')}</span><div><b>${escapeHtml(user.full_name||'Student')}</b><small>@${escapeHtml(user.username||'student')}</small></div></div>
    <nav class="secondary-links">${SECONDARY.map(item=>`<a href="${item.path}" data-secondary-link class="${location.pathname.startsWith(item.path)?'active':''}"><span>${icon(item.icon)}</span><div><b>${item.label}</b><small>${item.description}</small></div><i>${icon('arrowRight')}</i></a>`).join('')}</nav>${manager}
    <div class="drawer-foot"><span>Study with direction.</span><span class="drawer-version">Campusly</span></div>
  </aside>`;
}

function openSidebar(shell){closeCourseMenu(shell);shell.classList.add('sidebar-open');shell.querySelector('.secondary-drawer')?.setAttribute('aria-hidden','false');document.body.classList.add('nav-overlay-open');}
function closeSidebar(shell){shell.classList.remove('sidebar-open');shell.querySelector('.secondary-drawer')?.setAttribute('aria-hidden','true');document.body.classList.remove('nav-overlay-open');}
function openCourseMenu(shell){const menu=shell.querySelector('[data-course-menu]');const trigger=shell.querySelector('[data-course-toggle]');if(!menu||!trigger)return;menu.hidden=false;trigger.setAttribute('aria-expanded','true');shell.classList.add('course-menu-open');}
function closeCourseMenu(shell){const menu=shell.querySelector('[data-course-menu]');const trigger=shell.querySelector('[data-course-toggle]');if(menu)menu.hidden=true;if(trigger)trigger.setAttribute('aria-expanded','false');shell.classList.remove('course-menu-open');}
function toggleCourseMenu(shell){shell.classList.contains('course-menu-open')?closeCourseMenu(shell):openCourseMenu(shell);}
function scrollToSelector(selector){root.querySelector(selector)?.scrollIntoView({behavior:'smooth',block:'start'});}
function filterCards(selector,predicate){root.querySelectorAll(selector).forEach((el,index)=>{const show=predicate(el,index);el.hidden=!show;el.classList.toggle('nav-filtered',!show);});}
function clearFilters(){filterCards('.subject-card,.schedule-row,.room-card,.post-card',()=>true);root.querySelector('.nav-context-note')?.remove();}

function contextualNote(text){
  root.querySelector('.nav-context-note')?.remove();
  const content=root.querySelector('.content');if(!content)return;
  const note=document.createElement('div');note.className='nav-context-note';note.innerHTML=`<span>${icon('sparkles')}</span><b>${escapeHtml(text)}</b><button data-clear-filter aria-label="Clear filter">${icon('close')}</button>`;content.prepend(note);
}

function setActiveSub(action){activeSubAction=action||'';if(activeSubAction)sessionStorage.setItem('dafati.subnav.action',activeSubAction);else sessionStorage.removeItem('dafati.subnav.action');root.querySelectorAll('[data-sub-action]').forEach(btn=>btn.classList.toggle('active',btn.dataset.subAction===activeSubAction));}

function applySubAction(action){
  if(!action)return;clearFilters();setActiveSub(action);
  switch(action){
    case 'top':window.scrollTo({top:0,behavior:'smooth'});break;
    case 'continue':scrollToSelector('.dashboard-grid');break;
    case 'upcoming':scrollToSelector('.timeline');break;
    case 'progress':scrollToSelector('.subject-grid');break;
    case 'bookmarked':filterCards('.subject-card',(_,i)=>i<2);contextualNote('Bookmarked study items');break;
    case 'week':filterCards('.schedule-row',()=>true);scrollToSelector('.schedule-board');break;
    case 'agenda':filterCards('.schedule-row',()=>true);scrollToSelector('.schedule-board');break;
    case 'completed':filterCards('.schedule-row',el=>el.classList.contains('done'));contextualNote('Completed sessions');break;
    case 'mine':filterCards('.room-card',(_,i)=>i===0);contextualNote('Your study rooms');break;
    case 'upcoming-rooms':filterCards('.room-card',()=>true);scrollToSelector('.room-grid');break;
    case 'questions':filterCards('.post-card',el=>/question/i.test(el.textContent));contextualNote('Questions');break;
    case 'resources':filterCards('.post-card',el=>/resource/i.test(el.textContent));contextualNote('Resources');break;
    case 'saved':filterCards('.post-card',(_,i)=>i===0);contextualNote('Saved discussions');break;
  }
}

function morphToMain(nav){
  setActiveSub('');nav.classList.add('nav-morphing');setTimeout(()=>{nav.classList.remove('showing-subnav','nav-morphing');nav.setAttribute('aria-label','Main navigation');nav.innerHTML=navMarkup();},160);
}

async function activateCourse(shell, courseId) {
  if(!courseId||courseId===activeCourseId()){closeCourseMenu(shell);return;}
  const option=shell.querySelector(`[data-course-id="${CSS.escape(courseId)}"]`);
  option?.classList.add('switching');
  try{
    await post(`/api/courses/${courseId}/activate`);
    await loadSession();
    closeCourseMenu(shell);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }catch(error){
    option?.classList.remove('switching');
    const label=option?.querySelector('small');if(label)label.textContent=error.message||'Could not switch course';
  }
}

function bindShell(shell){
  if(shell.dataset.navBound==='1')return;shell.dataset.navBound='1';
  shell.addEventListener('click',async event=>{
    if(event.target.closest('[data-sidebar-close]')){closeSidebar(shell);return;}
    if(!event.target.closest('.course-switch-wrap'))closeCourseMenu(shell);
    const target=event.target.closest('button,a');if(!target)return;
    if(target.matches('[data-sidebar-open]')){openSidebar(shell);return;}
    if(target.matches('[data-nav-notifications]')){navigate('/notifications');return;}
    if(target.matches('[data-course-toggle]')){toggleCourseMenu(shell);return;}
    if(target.matches('[data-course-id]')){await activateCourse(shell,target.dataset.courseId);return;}
    if(target.matches('[data-course-manage]')){event.preventDefault();closeCourseMenu(shell);navigate('/courses');return;}
    if(target.matches('[data-main-path]')){setActiveSub('');target.classList.add('nav-pressed');setTimeout(()=>navigate(target.dataset.mainPath),100);return;}
    if(target.matches('[data-nav-back]')){morphToMain(shell.querySelector('.adaptive-main-nav'));return;}
    if(target.matches('[data-sub-path]')){const path=target.dataset.subPath;const action=target.dataset.subAction;if(path){setActiveSub(path);if(location.pathname!==path)navigate(path);}else applySubAction(action);return;}
    if(target.matches('[data-secondary-link]')){event.preventDefault();closeSidebar(shell);setTimeout(()=>navigate(target.getAttribute('href')),160);return;}
    if(target.matches('[data-clear-filter]')){clearFilters();return;}
  });
  shell.addEventListener('keydown',event=>{if(event.key==='Escape'){if(shell.classList.contains('sidebar-open'))closeSidebar(shell);else closeCourseMenu(shell);}});
}

function renderDonationPage(){
  if(location.pathname!=='/donate'||!state.session.user)return;
  const content=root.querySelector('.app-shell .content');if(!content||content.dataset.donateReady==='1')return;
  content.dataset.donateReady='1';
  const title=root.querySelector('.legacy-topbar h1');if(title)title.textContent='Donate';
  content.innerHTML=`<section class="donate-hero"><div><span class="badge soft">STUDENT ACCESS</span><h2>Help another student keep learning.</h2><p>DAFATI's donation area is a product surface for future verified support programs. No payment is collected in this preview.</p></div><div class="donate-symbol">${icon('donate','donate-svg')}</div></section><section class="donate-grid"><article class="panel donate-card"><span>01</span><h3>Learning access</h3><p>Support course resources, study materials and learning infrastructure.</p><button class="button" data-donate-preview>Explore program</button></article><article class="panel donate-card"><span>02</span><h3>Student opportunities</h3><p>Help make scholarships and training opportunities easier to reach.</p><button class="button secondary" data-donate-preview>Learn more</button></article><article class="panel donate-card"><span>03</span><h3>Community support</h3><p>Contribute to future verified student-led initiatives and campus programs.</p><button class="button secondary" data-donate-preview>See initiatives</button></article></section><div class="donate-notice"><b>Preview only</b><span>No transaction or payment endpoint exists yet. A real donation feature will require an audited payment provider and a defined financial policy.</span></div>`;
  content.querySelectorAll('[data-donate-preview]').forEach(btn=>btn.addEventListener('click',()=>{btn.textContent='Coming soon';btn.disabled=true;}));
}

function buildShell(){
  if(!root||!state.session.user)return;
  const shell=root.querySelector('.app-shell');if(!shell||shell.dataset.adaptiveReady==='1')return;
  shell.dataset.adaptiveReady='1';shell.querySelector('.sidebar')?.remove();shell.querySelector('.topbar')?.classList.add('legacy-topbar');
  const section=currentMain();
  const utility=document.createElement('div');utility.innerHTML=utilityMarkup();shell.prepend(utility.firstElementChild);
  const nav=document.createElement('nav');nav.className=`adaptive-main-nav ${section&&!isSecondaryRoute()?'showing-subnav':''}`;nav.setAttribute('aria-label',section&&!isSecondaryRoute()?`${section.label} sub navigation`:'Main navigation');nav.innerHTML=navMarkup(section);shell.append(nav);
  const layer=document.createElement('div');layer.className='secondary-layer';layer.innerHTML=sidebarMarkup();shell.append(layer);
  bindShell(shell);requestAnimationFrame(()=>shell.classList.add('adaptive-enter'));
  if(activeSubAction&&section)requestAnimationFrame(()=>applySubAction(activeSubAction));
}

function enhance(){cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{buildShell();renderDonationPage();});}

export function initAdaptiveNavigation(appRoot){
  root=appRoot;observer?.disconnect();observer=new MutationObserver(enhance);observer.observe(root,{childList:true,subtree:true});enhance();
}
