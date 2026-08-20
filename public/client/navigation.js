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
    { label:'Upcoming', icon:'◷', action:'upcoming-rooms' }
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
const isSecondaryRoute = () => SECONDARY.some(item => location.pathname.startsWith(item.path)) || location.pathname.startsWith('/manager/');

function navMarkup(section=null) {
  if (section && !isSecondaryRoute()) {
    const items=SUB[section.key]||[];
    return `<button class="nav-back" data-nav-back aria-label="Back to main navigation"><span>←</span><b>${section.label}</b></button>${items.map((item,index)=>`<button class="adaptive-nav-item sub-item ${activeSubAction===(item.action||item.path)||(!activeSubAction&&index===0)?'active':''}" data-sub-action="${escapeHtml(item.action||'')}" data-sub-path="${escapeHtml(item.path||'')}"><span>${item.icon}</span><b>${item.label}</b></button>`).join('')}`;
  }
  return MAIN.map(item=>`<button class="adaptive-nav-item ${location.pathname.startsWith(item.path)?'active':''}" data-main-path="${item.path}"><span>${item.icon}</span><b>${item.label}</b></button>`).join('');
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

function sidebarMarkup() {
  const user=state.session.user||{};
  const manager=user.role==='MANAGER'?`<div class="drawer-section-label">MANAGER</div><nav class="secondary-links manager-links"><a href="/manager/students" data-secondary-link><span>◎</span><div><b>Students</b><small>Administration</small></div><i>→</i></a><a href="/manager/reports" data-secondary-link><span>!</span><div><b>Reports</b><small>Moderation queue</small></div><i>→</i></a><a href="/manager/audit" data-secondary-link><span>≡</span><div><b>Audit</b><small>Privileged activity</small></div><i>→</i></a></nav>`:'';
  return `<div class="secondary-scrim" data-sidebar-close></div><aside class="secondary-drawer" aria-label="Secondary navigation" aria-hidden="true">
    <div class="drawer-head"><div class="brand drawer-brand"><span class="brand-mark">د</span><div><strong>DAFATI</strong><small>Campusly</small></div></div><button class="drawer-close" data-sidebar-close aria-label="Close menu">×</button></div>
    <div class="drawer-profile"><span class="drawer-avatar">${escapeHtml(user.full_name?.[0]||'S')}</span><div><b>${escapeHtml(user.full_name||'Student')}</b><small>@${escapeHtml(user.username||'student')}</small></div></div>
    <nav class="secondary-links">${SECONDARY.map(item=>`<a href="${item.path}" data-secondary-link class="${location.pathname.startsWith(item.path)?'active':''}"><span>${item.icon}</span><div><b>${item.label}</b><small>${item.description}</small></div><i>→</i></a>`).join('')}</nav>${manager}
    <div class="drawer-foot"><span>Study with direction.</span><span class="drawer-version">Campusly</span></div>
  </aside>`;
}

function openSidebar(shell){shell.classList.add('sidebar-open');shell.querySelector('.secondary-drawer')?.setAttribute('aria-hidden','false');document.body.classList.add('nav-overlay-open');}
function closeSidebar(shell){shell.classList.remove('sidebar-open');shell.querySelector('.secondary-drawer')?.setAttribute('aria-hidden','true');document.body.classList.remove('nav-overlay-open');}
function scrollToSelector(selector){root.querySelector(selector)?.scrollIntoView({behavior:'smooth',block:'start'});}
function filterCards(selector,predicate){root.querySelectorAll(selector).forEach((el,index)=>{const show=predicate(el,index);el.hidden=!show;el.classList.toggle('nav-filtered',!show);});}
function clearFilters(){filterCards('.subject-card,.schedule-row,.room-card,.post-card',()=>true);root.querySelector('.nav-context-note')?.remove();}

function contextualNote(text){
  root.querySelector('.nav-context-note')?.remove();
  const content=root.querySelector('.content');if(!content)return;
  const note=document.createElement('div');note.className='nav-context-note';note.innerHTML=`<span>✦</span><b>${escapeHtml(text)}</b><button data-clear-filter aria-label="Clear filter">×</button>`;content.prepend(note);
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
    case 'enrolled':scrollToSelector('.course-list');break;
    case 'discover':scrollToSelector('.subject-grid');break;
  }
}

function morphToMain(nav){
  setActiveSub('');nav.classList.add('nav-morphing');setTimeout(()=>{nav.classList.remove('showing-subnav','nav-morphing');nav.setAttribute('aria-label','Main navigation');nav.innerHTML=navMarkup();},160);
}

function bindShell(shell){
  if(shell.dataset.navBound==='1')return;shell.dataset.navBound='1';
  shell.addEventListener('click',event=>{
    const target=event.target.closest('button,a');if(!target)return;
    if(target.matches('[data-sidebar-open]')){openSidebar(shell);return;}
    if(target.matches('[data-sidebar-close]')){closeSidebar(shell);return;}
    if(target.matches('[data-nav-notifications]')){navigate('/notifications');return;}
    if(target.matches('[data-nav-language]')){document.querySelector('#langToggle')?.click();return;}
    if(target.matches('[data-main-path]')){setActiveSub('');target.classList.add('nav-pressed');setTimeout(()=>navigate(target.dataset.mainPath),100);return;}
    if(target.matches('[data-nav-back]')){morphToMain(shell.querySelector('.adaptive-main-nav'));return;}
    if(target.matches('[data-sub-path]')){const path=target.dataset.subPath;const action=target.dataset.subAction;if(path){setActiveSub(path);if(location.pathname!==path)navigate(path);}else applySubAction(action);return;}
    if(target.matches('[data-secondary-link]')){event.preventDefault();closeSidebar(shell);setTimeout(()=>navigate(target.getAttribute('href')),160);return;}
    if(target.matches('[data-clear-filter]')){clearFilters();return;}
  });
  shell.addEventListener('keydown',event=>{if(event.key==='Escape'&&shell.classList.contains('sidebar-open'))closeSidebar(shell);});
}

function renderDonationPage(){
  if(location.pathname!=='/donate'||!state.session.user)return;
  const content=root.querySelector('.app-shell .content');if(!content||content.dataset.donateReady==='1')return;
  content.dataset.donateReady='1';
  const title=root.querySelector('.legacy-topbar h1');if(title)title.textContent='Donate';
  content.innerHTML=`<section class="donate-hero"><div><span class="badge soft">STUDENT ACCESS</span><h2>Help another student keep learning.</h2><p>DAFATI's donation area is a product surface for future verified support programs. No payment is collected in this preview.</p></div><div class="donate-symbol">◈</div></section><section class="donate-grid"><article class="panel donate-card"><span>01</span><h3>Learning access</h3><p>Support course resources, study materials and learning infrastructure.</p><button class="button" data-donate-preview>Explore program</button></article><article class="panel donate-card"><span>02</span><h3>Student opportunities</h3><p>Help make scholarships and training opportunities easier to reach.</p><button class="button secondary" data-donate-preview>Learn more</button></article><article class="panel donate-card"><span>03</span><h3>Community support</h3><p>Contribute to future verified student-led initiatives and campus programs.</p><button class="button secondary" data-donate-preview>See initiatives</button></article></section><div class="donate-notice"><b>Preview only</b><span>No transaction or payment endpoint exists yet. A real donation feature will require an audited payment provider and a defined financial policy.</span></div>`;
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
