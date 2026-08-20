import { navigate } from '/client/router.js';
import { state } from '/client/state.js';

const MAIN = [
  { key:'home', label:'Home', icon:'⌂', path:'/dashboard', match:['/dashboard'] },
  { key:'learn', label:'Learn', icon:'▤', path:'/subjects', match:['/subjects'] },
  { key:'plan', label:'Plan', icon:'◫', path:'/schedule', match:['/schedule'] },
  { key:'rooms', label:'Rooms', icon:'◉', path:'/study-rooms', match:['/study-rooms'] },
  { key:'community', label:'Community', icon:'◌', path:'/community', match:['/community'] },
  { key:'courses', label:'Courses', icon:'◇', path:'/courses', match:['/courses'] }
];

const SUB = {
  home: [
    { label:'Overview', icon:'⌂', action:'top' },
    { label:'Continue', icon:'↗', action:'continue' },
    { label:'Upcoming', icon:'◷', action:'upcoming' }
  ],
  learn: [
    { label:'Subjects', icon:'▤', path:'/subjects' },
    { label:'Progress', icon:'◔', action:'progress' },
    { label:'Bookmarked', icon:'☆', action:'bookmarked' }
  ],
  plan: [
    { label:'Week', icon:'▦', action:'week' },
    { label:'Agenda', icon:'≡', action:'agenda' },
    { label:'Completed', icon:'✓', action:'completed' }
  ],
  rooms: [
    { label:'Discover', icon:'⌕', path:'/study-rooms' },
    { label:'My rooms', icon:'◎', action:'mine' },
    { label:'Upcoming', icon:'◷', action:'upcoming' }
  ],
  community: [
    { label:'Feed', icon:'◌', path:'/community' },
    { label:'Questions', icon:'?', action:'questions' },
    { label:'Resources', icon:'↗', action:'resources' },
    { label:'Saved', icon:'☆', action:'saved' }
  ],
  courses: [
    { label:'Enrolled', icon:'◇', action:'enrolled' },
    { label:'Discover', icon:'✦', action:'discover' }
  ]
};

const SECONDARY = [
  { label:'Work', icon:'⌁', path:'/work', description:'Jobs & internships' },
  { label:'Scholarships', icon:'✦', path:'/scholarships', description:'Funding opportunities' },
  { label:'Volunteer', icon:'♡', path:'/volunteer', description:'Give your time' },
  { label:'Donate', icon:'◈', path:'/donate', description:'Support student access' },
  { label:'Profile', icon:'○', path:'/profile', description:'Identity & academics' },
  { label:'Settings', icon:'⚙', path:'/settings', description:'Preferences & privacy' }
];

let root;
let observer;
let frame;
let activeSubAction = sessionStorage.getItem('dafati.subnav.action') || '';

const escapeHtml = (value='') => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const currentMain = () => MAIN.find(item => item.match.some(prefix => location.pathname.startsWith(prefix))) || null;
const secondaryActive = () => SECONDARY.some(item => location.pathname.startsWith(item.path));

function mainButtons(section) {
  if (section && !secondaryActive()) {
    const items = SUB[section.key] || [];
    return `<button class="nav-back" data-nav-back aria-label="Back to main navigation"><span>←</span><b>${section.label}</b></button>${items.map((item,index)=>`<button class="adaptive-nav-item sub-item ${activeSubAction===(item.action||item.path) || (!activeSubAction&&index===0)?'active':''}" data-sub-action="${escapeHtml(item.action||'')}" data-sub-path="${escapeHtml(item.path||'')}"><span>${item.icon}</span><b>${item.label}</b></button>`).join('')}`;
  }
  return MAIN.map(item=>`<button class="adaptive-nav-item ${location.pathname.startsWith(item.path)?'active':''}" data-main-path="${item.path}"><span>${item.icon}</span><b>${item.label}</b></button>`).join('');
}

function sidebarMarkup() {
  const user = state.session.user || {};
  return `<div class="secondary-scrim" data-sidebar-close></div>
    <aside class="secondary-drawer" aria-label="Secondary navigation" aria-hidden="true">
      <div class="drawer-head">
        <div class="brand drawer-brand"><span class="brand-mark">د</span><div><strong>DAFATI</strong><small>Campusly</small></div></div>
        <button class="drawer-close" data-sidebar-close aria-label="Close menu">×</button>
      </div>
      <div class="drawer-profile">
        <span class="drawer-avatar">${escapeHtml(user.full_name?.[0]||'S')}</span>
        <div><b>${escapeHtml(user.full_name||'Student')}</b><small>@${escapeHtml(user.username||'student')}</small></div>
      </div>
      <nav class="secondary-links">${SECONDARY.map(item=>`<a href="${item.path}" data-secondary-link class="${location.pathname.startsWith(item.path)?'active':''}"><span>${item.icon}</span><div><b>${item.label}</b><small>${item.description}</small></div><i>→</i></a>`).join('')}</nav>
      ${user.role==='MANAGER'?`<div class="drawer-section-label">MANAGER</div><nav class="secondary-links manager-links"><a href="/manager/students" data-secondary-link><span>◎</span><div><b>Students</b><small>Administration</small></div><i>→</i></a><a href="/manager/reports" data-secondary-link><span>!</span><div><b>Reports</b><small>Moderation queue</small></div><i>→</i></a><a href="/manager/audit" data-secondary-link><span>≡</span><div><b>Audit</b><small>Privileged activity</small></div><i>→</i></a></nav>`:''}
      <div class="drawer-foot"><span>Study with direction.</span><span class="drawer-version">Campusly</span></div>
    </aside>`;
}

function utilityMarkup() {
  return `<div class="adaptive-utility">
    <button class="utility-menu" data-sidebar-open aria-label="Open secondary navigation"><span></span><span></span></button>
    <div class="utility-brand"><span class="brand-mark mini">د</span><b>DAFATI</b></div>
    <div class="utility-actions">
      <button class="utility-lang" data-nav-language>${state.language==='en'?'ع':'EN'}</button>
      <button class="utility-notification ${state.notifications.unreadCount?'has-unread':''}" data-nav-notifications aria-label="Notifications"><span>◍</span>${state.notifications.unreadCount?`<i>${state.notifications.unreadCount}</i>`:''}</button>
    </div>
  </div>`;
}

function buildShell() {
  if (!root || !state.session.user) return;
  const shell = root.querySelector('.app-shell');
  if (!shell || shell.dataset.adaptiveReady==='1') return;
  shell.dataset.adaptiveReady='1';

  // The original sidebar is replaced by the global overlay drawer. Keeping it in
  // the DOM would duplicate navigation semantics for assistive technologies.
  shell.querySelector('.sidebar')?.remove();
  const oldTopbar = shell.querySelector('.topbar');
  if (oldTopbar) oldTopbar.classList.add('legacy-topbar');

  const section = currentMain();
  const utility = document.createElement('div');
  utility.innerHTML = utilityMarkup();
  shell.prepend(utility.firstElementChild);

  const nav = document.createElement('nav');
  nav.className = `adaptive-main-nav ${section&&!secondaryActive()?'showing-subnav':''}`;
  nav.setAttribute('aria-label', section&&!secondaryActive()?`${section.label} sub navigation`:'Main navigation');
  nav.innerHTML = mainButtons(section);
  shell.append(nav);

  const drawer = document.createElement('div');
  drawer.className='secondary-layer';
  drawer.innerHTML=sidebarMarkup();
  shell.append(drawer);

  requestAnimationFrame(()=>{
    shell.classList.add('adaptive-enter');
    bindShell(shell);
    applySubAction(activeSubAction, false);
  });
}

function openSidebar(shell) {
  shell.classList.add('sidebar-open');
  const drawer=shell.querySelector('.secondary-drawer');
  drawer?.setAttribute('aria-hidden','false');
  requestAnimationFrame(()=>drawer?.querySelector('[data-sidebar-close]')?.focus());
  document.body.classList.add('nav-overlay-open');
}

function closeSidebar(shell) {
  shell.classList.remove('sidebar-open');
  shell.querySelector('.secondary-drawer')?.setAttribute('aria-hidden','true');
  document.body.classList.remove('nav-overlay-open');
}

function scrollToSelector(selector) {
  const target=root.querySelector(selector);
  target?.scrollIntoView({behavior:'smooth',block:'start'});
}

function filterCards(selector, predicate) {
  root.querySelectorAll(selector).forEach((el,index)=>{
    const show=predicate(el,index);
    el.hidden=!show;
    el.classList.toggle('nav-filtered',!show);
  });
}

function applySubAction(action, remember=true) {
  if (!action) return;
  if (remember) {
    activeSubAction=action;
    sessionStorage.setItem('dafati.subnav.action',action);
  }
  root.querySelectorAll('[data-sub-action]').forEach(btn=>btn.classList.toggle('active',btn.dataset.subAction===action));
  document.querySelectorAll('.nav-context-note').forEach(el=>el.remove());

  switch(action) {
    case 'top': window.scrollTo({top:0,behavior:'smooth'}); break;
    case 'continue': scrollToSelector('.dashboard-grid'); break;
    case 'upcoming': scrollToSelector('.timeline'); break;
    case 'progress': scrollToSelector('.subject-grid'); break;
    case 'bookmarked': filterCards('.subject-card',(_,i)=>i<2); contextualNote('Showing bookmarked study items in preview.'); break;
    case 'week': root.querySelector('.segmented button:first-child')?.click(); filterCards('.schedule-row',()=>true); break;
    case 'agenda': root.querySelector('.segmented button:nth-child(2)')?.click(); filterCards('.schedule-row',()=>true); break;
    case 'completed': filterCards('.schedule-row',el=>el.classList.contains('done')); contextualNote('Completed sessions'); break;
    case 'mine': filterCards('.room-card',(_,i)=>i===0); contextualNote('Your rooms'); break;
    case 'questions': filterCards('.post-card',el=>/question/i.test(el.textContent)); contextualNote('Questions'); break;
    case 'resources': filterCards('.post-card',el=>/resource/i.test(el.textContent)); contextualNote('Resources'); break;
    case 'saved': filterCards('.post-card',(_,i)=>i===0); contextualNote('Saved discussions'); break;
    case 'enrolled': scrollToSelector('.course-list'); break;
    case 'discover': scrollToSelector('.subject-grid'); break;
  }
}

function contextualNote(text) {
  const content=root.querySelector('.content');
  if(!content)return;
  const note=document.createElement('div');
  note.className='nav-context-note';
  note.innerHTML=`<span>✦</span><b>${escapeHtml(text)}</b><button aria-label="Clear filter">×</button>`;
  note.querySelector('button').addEventListener('click',()=>{
    note.remove();
    filterCards('.subject-card,.schedule-row,.room-card,.post-card',()=>true);
  });
  content.prepend(note);
}

function bindShell(shell) {
  shell.querySelector('[data-sidebar-open]')?.addEventListener('click',()=>openSidebar(shell));
  shell.querySelectorAll('[data-sidebar-close]').forEach(el=>el.addEventListener('click',()=>closeSidebar(shell)));
  shell.querySelector('[data-nav-notifications]')?.addEventListener('click',()=>navigate('/notifications'));
  shell.querySelector('[data-nav-language]')?.addEventListener('click',()=>document.querySelector('#langToggle')?.click());

  shell.querySelectorAll('[data-main-path]').forEach(btn=>btn.addEventListener('click',()=>{
    activeSubAction='';
    sessionStorage.removeItem('dafati.subnav.action');
    btn.classList.add('nav-pressed');
    setTimeout(()=>navigate(btn.dataset.mainPath),120);
  }));

  shell.querySelector('[data-nav-back]')?.addEventListener('click',()=>{
    activeSubAction='';
    sessionStorage.removeItem('dafati.subnav.action');
    const nav=shell.querySelector('.adaptive-main-nav');
    nav?.classList.add('nav-morphing');
    setTimeout(()=>{
      if(nav){nav.classList.remove('showing-subnav','nav-morphing');nav.setAttribute('aria-label','Main navigation');nav.innerHTML=mainButtons(null);bindShellNavigationOnly(nav);}
    },170);
  });
  bindShellNavigationOnly(shell.querySelector('.adaptive-main-nav'));

  shell.querySelectorAll('[data-secondary-link]').forEach(a=>a.addEventListener('click',e=>{
    e.preventDefault();closeSidebar(shell);setTimeout(()=>navigate(a.getAttribute('href')),180);
  }));

  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&shell.classList.contains('sidebar-open'))closeSidebar(shell);
  },{once:true});
}

function bindShellNavigationOnly(nav) {
  if(!nav)return;
  nav.querySelectorAll('[data-main-path]').forEach(btn=>{
    if(btn.dataset.bound)return;btn.dataset.bound='1';
    btn.addEventListener('click',()=>{activeSubAction='';sessionStorage.removeItem('dafati.subnav.action');setTimeout(()=>navigate(btn.dataset.mainPath),100);});
  });
  nav.querySelectorAll('[data-sub-path]').forEach(btn=>{
    if(btn.dataset.bound)return;btn.dataset.bound='1';
    btn.addEventListener('click',()=>{
      const path=btn.dataset.subPath;const action=btn.dataset.subAction;
      if(path){activeSubAction=path;sessionStorage.setItem('dafati.subnav.action',path);if(location.pathname!==path)navigate(path);}
      else applySubAction(action);
    });
  });
  nav.querySelectorAll('[data-sub-action]').forEach(btn=>{
    if(btn.dataset.boundAction)return;btn.dataset.boundAction='1';
    btn.addEventListener('click',()=>{if(!btn.dataset.subPath)applySubAction(btn.dataset.subAction);});
  });
}

function renderDonationPage() {
  if(location.pathname!=='/donate' || !state.session.user)return false;
  const shell=root.querySelector('.app-shell');
  const content=shell?.querySelector('.content');
  if(!content)return false;
  const title=shell.querySelector('.legacy-topbar h1');if(title)title.textContent='Donate';
  content.innerHTML=`<section class="donate-hero"><div><span class="badge soft">STUDENT ACCESS</span><h2>Help another student keep learning.</h2><p>DAFATI's donation area is a product surface for future verified support programs. No payment is collected in this preview.</p></div><div class="donate-symbol">◈</div></section><section class="donate-grid"><article class="panel donate-card"><span>01</span><h3>Learning access</h3><p>Support course resources, study materials and learning infrastructure.</p><button class="button" data-donate-preview>Explore program</button></article><article class="panel donate-card"><span>02</span><h3>Student opportunities</h3><p>Help make scholarships and training opportunities easier to reach.</p><button class="button secondary" data-donate-preview>Learn more</button></article><article class="panel donate-card"><span>03</span><h3>Community support</h3><p>Contribute to future verified student-led initiatives and campus programs.</p><button class="button secondary" data-donate-preview>See initiatives</button></article></section><div class="donate-notice"><b>Preview only</b><span>No transaction or payment endpoint exists yet. A real donation feature will require an audited payment provider and a defined financial policy.</span></div>`;
  content.querySelectorAll('[data-donate-preview]').forEach(btn=>btn.addEventListener('click',()=>{
    btn.textContent='Coming soon';btn.disabled=true;
  }));
  return true;
}

function enhance() {
  cancelAnimationFrame(frame);
  frame=requestAnimationFrame(()=>{
    if(!root)return;
    renderDonationPage();
    buildShell();
  });
}

export function initAdaptiveNavigation(appRoot) {
  root=appRoot;
  observer?.disconnect();
  observer=new MutationObserver(enhance);
  observer.observe(root,{childList:true,subtree:true});
  enhance();
}
