import { loadSession } from '/client/session.js';
import { state, setLanguage } from '/client/state.js';
import { resolve, guard, navigate } from '/client/router.js';
import { get, post, patch, del } from '/client/api.js';
import { t, pick, formatDate, formatTime, localizeValue, errorText } from '/client/i18n.js';
import { renderSubPage } from '/client/subpages.js';

const escapeHtml = (value='') => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const qs = (s, root=document) => root.querySelector(s);
function toast(message){ const el=qs('#toast'); if(!el)return; el.textContent=message; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'),1800); }
function link(path,label,extra=''){ return `<a href="${path}" data-link ${extra}>${label}</a>`; }
function shell(content, title='') {
  const user = state.session.user;
  if (!user) return content;
  return `<div class="app-shell">
    <aside class="sidebar"></aside>
    <div class="main-area">
      <header class="topbar"><button class="mobile-menu" aria-label="${escapeHtml(t('menu'))}">☰</button><div><p class="eyebrow">${escapeHtml(pick(state.session.activeCourse||{},'name') || t('nav.studyDirection'))}</p><h1>${escapeHtml(title)}</h1></div><div class="top-actions">${link('/notifications','◌','class="icon-button"')}${link('/settings','⚙','class="icon-button"')}</div></header>
      <main class="content">${content}</main>
    </div>
  </div>`;
}

function landing(){ return `<div class="landing"><header><div class="brand"><span class="brand-mark">د</span><strong>DAFATI</strong></div><div>${link('/sign-in',t('auth.signinTitle'),'class="text-button"')} ${link('/sign-up',t('auth.create'),'class="button small"')}</div></header><main><div class="hero-copy"><span class="badge">${t('landing.tagline')}</span><h1>${t('landing.titleA')} <em>${t('landing.titleB')}</em></h1><p>${t('landing.description')}</p><div>${link('/sign-up',t('landing.start'),'class="button"')} ${link('/sign-in',t('landing.haveAccount'),'class="button secondary"')}</div></div><div class="hero-visual"><div class="orb"><b>78%</b><span>${t('landing.semesterProgress')}</span></div><div class="float-card fc1"><small>${t('landing.next')}</small><b>${t('subjects')}</b><span>${t('landing.today')} · 5:30 PM</span></div><div class="float-card fc2"><small>${t('landing.streak')}</small><b>${t('landing.days',{n:12})}</b><span>${t('landing.keepGoing')} ✦</span></div></div></main></div>`; }

function auth(kind){
  const signup=kind==='signup';
  return `<div class="auth-page"><section class="auth-art"><div class="brand"><span class="brand-mark">د</span><strong>DAFATI</strong></div><div><p class="eyebrow">${t('auth.learnConnectGrow')}</p><h1>${signup?t('auth.signupHero'):t('auth.signinHero')}</h1><p>${signup?t('auth.signupHeroBody'):t('auth.signinHeroBody')}</p></div></section><section class="auth-form"><div class="auth-card"><h2>${signup?t('auth.signupTitle'):t('auth.signinTitle')}</h2><p>${signup?t('auth.signupBody'):t('auth.signinBody')}</p><form id="authForm">${signup?`<label>${t('auth.fullName')}<input name="full_name" required maxlength="120"></label>`:''}<label>${t('auth.email')}<input name="email" type="email" required></label><label>${t('auth.password')}<input name="password" type="password" minlength="8" maxlength="128" required></label>${signup?`<div class="form-grid"><label>${t('auth.educationStage')}<select name="educational_stage" required><option value="University">${t('auth.university')}</option><option value="School">${t('auth.school')}</option></select></label><label>${t('auth.institutionType')}<select name="institution_category" required><option value="UNIVERSITY">${t('auth.university')}</option><option value="SCHOOL">${t('auth.school')}</option><option value="OTHER">${t('auth.other')}</option></select></label></div><label>${t('auth.institutionName')}<input name="institution_name" required></label><label>${t('auth.profilePhoto')}<input name="photo" type="file" accept="image/*" required></label>`:''}<button class="button wide">${signup?t('auth.create'):t('auth.signinTitle')}</button><div id="formError" class="form-error"></div></form><p class="switch-auth">${signup?`${t('auth.already')} ${link('/sign-in',t('auth.signinTitle'))}`:`${t('auth.new')} ${link('/sign-up',t('auth.create'))}`}</p></div></section></div>`;
}

function metric(label,value,detail,accent=''){ return `<article class="metric ${accent}"><small>${label}</small><strong>${value}</strong><span>${detail}</span></article>`; }
function progressRing(value){ return `<div class="progress-ring" style="--p:${Math.max(0,Math.min(100,value||0))}"><span>${Math.round(value||0)}%</span></div>`; }

function dashboard(data={}) {
  const d=data.dashboard||data.activeCourseSummary||{}; const next=d.continueLearning||[]; const upcoming=d.upcomingSchedule||[];
  return shell(`<section class="welcome"><div><span class="badge soft">${state.session.activeCourse?escapeHtml(pick(state.session.activeCourse,'name')):t('dashboard.noCourse')}</span><h2>${t('welcome')}, ${escapeHtml(state.session.user.full_name?.split(' ')[0]||t('student'))}.</h2><p>${t('dashboard.moving')}</p></div><div class="streak"><b>${state.session.user.streak||0}</b><span>${t('dashboard.dayStreak')}</span></div></section><section class="metrics">${metric(t('progress'),`${Math.round(d.lectureProgressPercent||0)}%`,t('dashboard.lecturesDone',{n:d.completedLectureCount||0}),'mint')}${metric(t('average'),`${Math.round(d.academicAverage||0)}%`,t('dashboard.weighted'),'blue')}${metric(t('study'),`${Math.round((d.studyMinutesWeek||0)/60)}h`,t('dashboard.thisWeek'),'violet')}${metric(t('subjects'),d.subjectCount||0,t('dashboard.activeCourse'),'sand')}</section><section class="dashboard-grid"><div class="panel"><div class="panel-head"><div><p class="eyebrow">${t('dashboard.focus')}</p><h3>${t('dashboard.continueTitle')}</h3></div>${link('/dashboard/continue',`${t('continue')} →`)}</div><div class="learning-list">${next.length?next.map(x=>`<a data-link href="/subjects/${x.subject_id}/lectures/${x.id}" class="learning-row"><div class="subject-dot"></div><div><b>${escapeHtml(pick(x,'title'))}</b><span>${escapeHtml(pick(x,'subject_name')||t('detail.lecture'))} · ${x.estimated_minutes||0} min</span></div><span class="arrow">→</span></a>`).join(''):`<div class="empty">${t('empty')}</div>`}</div></div><div class="panel"><div class="panel-head"><div><p class="eyebrow">${t('dashboard.plan')}</p><h3>${t('dashboard.upcomingTitle')}</h3></div>${link('/dashboard/upcoming',`${t('upcoming')} →`)}</div><div class="timeline">${upcoming.length?upcoming.slice(0,4).map(x=>`<div class="timeline-item"><time>${formatTime(x.starts_at)}</time><div><b>${escapeHtml(x.title)}</b><span>${formatDate(x.starts_at)}</span></div></div>`).join(''):`<div class="empty">${t('dashboard.noUpcoming')}</div>`}</div></div></section>`, t('dashboard'));
}

function subjects(data={}) {
  const rows=data.data||[];
  return shell(`<div class="toolbar"><label class="search"><span>⌕</span><input id="subjectSearch" placeholder="${escapeHtml(t('subjects.search'))}"></label></div><div class="subject-grid">${rows.map(s=>`<a data-link href="/subjects/${s.id}" class="subject-card"><div class="subject-card-top"><span class="subject-code">${escapeHtml(s.code||'SUBJ')}</span>${progressRing(s.progress_percentage)}</div><h3>${escapeHtml(pick(s,'name'))}</h3><p>${escapeHtml(pick(s,'description'))}</p><div class="card-meta"><span>${t('subjects.lectures',{done:s.completed_lecture_count||0,total:s.lecture_count||0})}</span></div></a>`).join('')||`<div class="empty-card">${t('empty')}</div>`}</div>`,t('subjects'));
}

function schedule(data={}) {
  const items=data.data||[];
  return shell(`<div class="toolbar"><div class="segmented"><button class="active">${t('week')}</button>${link('/schedule/agenda',t('agenda'))}</div><button id="addSchedule" class="button small">+ ${t('schedule.add')}</button></div><div class="schedule-board">${items.map(x=>`<article class="schedule-row ${x.completed?'done':''}" data-id="${x.id}"><button class="check" data-complete="${x.id}" aria-label="${escapeHtml(t('schedule.complete'))}">${x.completed?'✓':''}</button><div><small>${formatDate(x.starts_at)} · ${formatTime(x.starts_at)}</small><h3>${escapeHtml(x.title)}</h3><span>${escapeHtml(localizeValue(x.category||'study'))}</span></div><button class="more" data-delete="${x.id}" aria-label="${escapeHtml(t('menu'))}">•••</button></article>`).join('')||`<div class="empty-card">${t('schedule.empty')}</div>`}</div>`,t('schedule'));
}

function community(data={}) {
  const posts=data.data||[];
  return shell(`<div class="toolbar"><label class="search"><span>⌕</span><input id="communitySearch" placeholder="${escapeHtml(t('community.search'))}"></label><button id="newPost" class="button small">+ ${t('newPost')}</button></div><div class="feed">${posts.map(p=>`<article class="post-card"><div class="post-author"><span class="avatar">${escapeHtml(p.author?.full_name?.[0]||'S')}</span><div><b>${escapeHtml(p.author?.full_name||t('student'))}</b><small>${formatDate(p.created_at)} · ${escapeHtml(localizeValue(p.category))}</small></div>${p.pinned?`<span class="badge soft">${t('community.pinned')}</span>`:''}</div><a data-link href="/community/${p.id}"><h3>${escapeHtml(pick(p,'title')||p.title)}</h3><p>${escapeHtml(pick(p,'body')||p.body)}</p></a><footer><button data-react="${p.id}">♡ ${p.reaction_counts?.helpful||p.reaction_counts?.like||0}</button><span>${t('community.comments',{n:p.comment_count||0})}</span><button data-save-post="${p.id}">${p.saved?'★':'☆'} ${t('save')}</button></footer></article>`).join('')||`<div class="empty-card">${t('community.beFirst')}</div>`}</div>`,t('community'));
}

function rooms(data={}) {
  const rows=data.data||[];
  return shell(`<div class="toolbar"><label class="search"><span>⌕</span><input placeholder="${escapeHtml(t('rooms.search'))}"></label><button id="newRoom" class="button small">+ ${t('newRoom')}</button></div><div class="room-grid">${rows.map(r=>`<article class="room-card"><div class="room-head"><span class="badge ${String(r.status).toLowerCase()==='open'?'success':''}">${escapeHtml(localizeValue(r.status))}</span><span>${t('rooms.members',{count:r.member_count||0,capacity:r.capacity||0})}</span></div><h3>${escapeHtml(r.name)}</h3><p>${escapeHtml(r.topic||r.description)}</p><div class="member-stack">${(r.members||[]).slice(0,4).map(m=>`<span>${escapeHtml(m.full_name?.[0]||'S')}</span>`).join('')}</div>${link(`/study-rooms/${r.id}`,`${t('rooms.openRoom')} →`,'class="room-link"')}</article>`).join('')||`<div class="empty-card">${t('rooms.empty')}</div>`}</div>`,t('rooms'));
}

function opportunities(data={}, category='work') {
  const items=data.data||[];
  return shell(`<div class="category-tabs">${link('/work',t('work'),category==='work'?'class="active"':'')}${link('/scholarships',t('scholarships'),category==='scholarship'?'class="active"':'')}${link('/volunteer',t('volunteer'),category==='volunteer'?'class="active"':'')}</div><div class="opportunity-grid">${items.map(o=>`<article class="opportunity-card"><div class="opp-top"><span class="badge soft">${escapeHtml(localizeValue(o.mode||category))}</span><button data-save-opp="${o.id}" aria-label="${escapeHtml(t('save'))}">${o.saved?'★':'☆'}</button></div><h3>${escapeHtml(pick(o,'title'))}</h3><b>${escapeHtml(o.organization)}</b><p>${escapeHtml(pick(o,'description'))}</p><div class="tags">${(o.skills||[]).slice(0,3).map(s=>`<span>${escapeHtml(s)}</span>`).join('')}</div><div class="card-meta"><span>${escapeHtml(o.location||t('opp.flexible'))}</span><span>${o.deadline?t('opp.due',{date:formatDate(o.deadline)}):t('opp.open')}</span></div>${link(`/opportunities/${o.id}`,`${t('opp.view')} →`,'class="room-link"')}</article>`).join('')||`<div class="empty-card">${t('opp.none')}</div>`}</div>`,t('opportunities'));
}

function courses(data={}) {
  const enroll=data.enrollments||data.data?.enrollments||[]; const available=data.available||data.data?.available||[];
  return shell(`<section class="panel"><div class="panel-head"><div><p class="eyebrow">${t('courses.yourWorkspaces')}</p><h3>${t('courses.enrolled')}</h3></div><span>${t('courses.used',{n:enroll.length})}</span></div><div class="course-list">${enroll.map(e=>`<article class="course-row ${e.active?'active':''}"><div><span class="position">${e.position}</span><div><h3>${escapeHtml(pick(e.course||e,'name'))}</h3><p>${e.position===1?t('courses.primary'):t('courses.optional')} · ${e.active?t('active'):t('inactive')}</p></div></div>${e.active?`<span class="badge success">${t('active')}</span>`:`<button class="button small secondary" data-activate="${e.course_id||e.id}">${t('courses.activate')}</button>`}</article>`).join('')}</div></section><section class="panel"><div class="panel-head"><div><p class="eyebrow">${t('courses.discover')}</p><h3>${t('courses.public')}</h3></div></div><div class="subject-grid">${available.map(c=>`<article class="subject-card"><span class="subject-code">${t('courses.publicBadge')}</span><h3>${escapeHtml(pick(c,'name'))}</h3><p>${escapeHtml(pick(c,'description'))}</p><button class="button small" data-enroll="${c.id}">${t('courses.enroll')}</button></article>`).join('')||`<div class="empty">${t('courses.none')}</div>`}</div></section>`,t('courses'));
}

function profile(data={}) {
  const p=data.data||data;
  return shell(`<div class="profile-layout"><section class="profile-card"><div class="profile-avatar">${escapeHtml(p.full_name?.[0]||'S')}</div><h2>${escapeHtml(p.full_name||state.session.user.full_name)}</h2><p>@${escapeHtml(p.username||state.session.user.username)}</p><span class="badge soft">${escapeHtml(p.educational_stage||t('student'))}</span></section><section class="panel"><div class="panel-head"><h3>${t('profile.personalAcademic')}</h3><button id="editProfile" class="button small secondary">${t('edit')}</button></div><dl class="detail-list"><div><dt>${t('profile.bio')}</dt><dd>${escapeHtml(p.bio||t('profile.bioEmpty'))}</dd></div><div><dt>${t('profile.goal')}</dt><dd>${escapeHtml(p.learning_goal||t('profile.goalEmpty'))}</dd></div><div><dt>${t('profile.institution')}</dt><dd>${escapeHtml(p.institution_name||'—')}</dd></div><div><dt>${t('profile.field')}</dt><dd>${escapeHtml(p.academic_field||'—')}</dd></div></dl></section></div>`,t('profile'));
}

function settings(data={}) {
  const s=data.data||data; const toggles=[['study_reminders','settings.studyReminders'],['scholarship_alerts','settings.scholarshipAlerts'],['job_alerts','settings.jobAlerts'],['volunteer_alerts','settings.volunteerAlerts'],['community_notifications','settings.communityActivity'],['room_notifications','settings.roomActivity']];
  return shell(`<div class="settings-grid"><section class="panel"><h3>${t('settings.preferences')}</h3><label class="setting-row"><span><b>${t('settings.language')}</b><small>${t('settings.languageHelp')}</small></span><select id="languageSelect"><option value="en" ${state.language==='en'?'selected':''}>${t('settings.english')}</option><option value="ar" ${state.language==='ar'?'selected':''}>${t('settings.arabic')}</option></select></label>${toggles.map(([k,key])=>`<label class="setting-row"><span><b>${t(key)}</b><small>${t('settings.preferenceHelp',{name:t(key).toLowerCase()})}</small></span><input type="checkbox" data-setting="${k}" ${s[k]?'checked':''}></label>`).join('')}<label class="setting-row"><span><b>${t('settings.profileVisibility')}</b><small>${t('settings.profileVisibilityHelp')}</small></span><select data-setting="profile_visibility"><option value="everyone" ${s.profile_visibility==='everyone'?'selected':''}>${t('settings.everyone')}</option><option value="classmates" ${s.profile_visibility==='classmates'?'selected':''}>${t('settings.classmates')}</option><option value="private" ${s.profile_visibility==='private'?'selected':''}>${t('settings.private')}</option></select></label></section><section class="panel"><h3>${t('settings.account')}</h3><button id="changePassword" class="button secondary wide">${t('settings.changePassword')}</button><button id="signOut" class="danger-button wide">${t('signout')}</button></section></div>`,t('settings'));
}

function notifications(data={}) {
  const items=data.data||[];
  return shell(`<div class="toolbar"><div class="segmented"><button class="active">${t('notifications.all')}</button><button>${t('notifications.unread')}</button></div><button id="readAll" class="text-button">${t('notifications.markAll')}</button></div><div class="notification-list">${items.map(n=>`<article class="notification-row ${n.read?'':'unread'}" data-id="${n.id}"><span class="notification-icon">◌</span><div><h3>${escapeHtml(n.title)}</h3><p>${escapeHtml(n.body)}</p><small>${formatDate(n.created_at)} · ${formatTime(n.created_at)}</small></div>${n.path?link(n.path,`${t('notifications.open')} →`):''}</article>`).join('')||`<div class="empty-card">${t('notifications.caughtUp')}</div>`}</div>`,t('notifications'));
}

function subjectDetail(data={}) {
  const subject=data.subject||data.data||data; const lectures=data.lectures?.data||data.lectures||[]; const degrees=data.degrees?.data||data.degrees||[];
  const average=degrees.length?degrees.reduce((s,d)=>s+Number(d.score||0),0)/degrees.reduce((s,d)=>s+Number(d.max_score||0),0)*100:0;
  return shell(`<section class="detail-hero expanded-detail"><span class="badge soft">${escapeHtml(subject.code||t('detail.subject'))}</span><h2>${escapeHtml(pick(subject,'name'))}</h2><p>${escapeHtml(pick(subject,'description'))}</p><div class="detail-stat-row"><div><b>${lectures.length}</b><span>${t('subject.lectures')}</span></div><div><b>${degrees.length}</b><span>${t('subject.assessments')}</span></div><div><b>${Math.round(average||0)}%</b><span>${t('subject.average')}</span></div></div></section><section class="detail-columns"><div class="panel"><div class="panel-head"><h3>${t('subject.lectures')}</h3></div><div class="lecture-catalog">${lectures.length?lectures.map((l,i)=>`<a data-link href="/subjects/${subject.id}/lectures/${l.id}" class="lecture-catalog-row"><span>${String(i+1).padStart(2,'0')}</span><div><h4>${escapeHtml(pick(l,'title'))}</h4><small>${t('lecture.estimated',{n:l.estimated_minutes||0})}</small></div><i>→</i></a>`).join(''):`<div class="empty">${t('subject.noLectures')}</div>`}</div></div><aside class="panel"><h3>${t('subject.assessments')}</h3><div class="degree-list">${degrees.length?degrees.map(d=>`<div><span><b>${escapeHtml(d.title)}</b><small>${escapeHtml(localizeValue(d.assessment_kind))}</small></span><strong>${d.score}/${d.max_score}</strong></div>`).join(''):`<div class="empty">${t('subject.noGrades')}</div>`}</div></aside></section>`,t('detail.subject'));
}

function lectureDetail(data={}) {
  const l=data.lecture||data.data||data; const progress=data.progress?.data||data.progress||{};
  return shell(`<article class="lecture-reader"><header><div>${link(`/subjects/${l.subject_id}`,`← ${t('subjects')}`,'class="text-button"')}<span class="badge soft">${t('lecture.estimated',{n:l.estimated_minutes||0})}</span><h2>${escapeHtml(pick(l,'title'))}</h2><p>${escapeHtml(pick(l.subject||{},'name'))}</p></div><div class="reader-actions"><button class="button secondary" data-bookmark-lecture="${l.id}" data-bookmarked="${progress.bookmarked?1:0}">${progress.bookmarked?t('lecture.bookmarked'):t('lecture.bookmark')}</button><button class="button" data-complete-lecture="${l.id}" data-completed="${progress.completed?1:0}">${progress.completed?t('lecture.completed'):t('lecture.markComplete')}</button></div></header><section class="reader-body"><div class="reader-content"><p>${escapeHtml(pick(l,'content')||pick(l,'description')||'')}</p></div><aside><span>✦</span><h3>${t('lecture.studyNote')}</h3><p>${t('lecture.studyNoteBody')}</p></aside></section></article>`,t('detail.lecture'));
}

function roomDetail(data={}) {
  const r=data.data||data; const messages=r.messages||[]; const membership=String(r.membership_state||'none').toLowerCase(); const action=membership==='member'?t('rooms.leave'):membership==='pending'?t('rooms.pending'):String(r.visibility).toLowerCase()==='approval'?t('rooms.request'):t('rooms.join');
  return shell(`<section class="detail-hero expanded-detail"><span class="badge soft">${escapeHtml(localizeValue(r.status))}</span><h2>${escapeHtml(r.name)}</h2><p>${escapeHtml(r.description||r.topic||'')}</p><div class="detail-stat-row"><div><b>${r.member_count||0}/${r.capacity||0}</b><span>${t('rooms')}</span></div><div><b>${r.starts_at?formatTime(r.starts_at):'—'}</b><span>${r.starts_at?formatDate(r.starts_at):''}</span></div></div><button class="button" data-room-join="${r.id}" ${membership==='pending'?'disabled':''}>${action}</button></section><section class="panel room-conversation"><h3>${t('rooms.messages')}</h3><div class="message-stream">${messages.map(m=>`<div class="room-message"><span class="avatar">${escapeHtml(m.author?.full_name?.[0]||'S')}</span><div><b>${escapeHtml(m.author?.full_name||t('student'))}</b><p>${escapeHtml(m.body)}</p><small>${formatTime(m.created_at)}</small></div></div>`).join('')}</div><form id="roomMessageForm" data-room-id="${r.id}"><input name="body" required placeholder="${escapeHtml(t('rooms.messagePlaceholder'))}"><button class="button small">${t('rooms.send')}</button></form></section>`,t('detail.room'));
}

function postDetail(data={}) {
  const p=data.data||data; const comments=p.comments||[];
  return shell(`<article class="panel discussion-detail"><header><span class="avatar">${escapeHtml(p.author?.full_name?.[0]||'S')}</span><div><b>${escapeHtml(p.author?.full_name||t('student'))}</b><small>${formatDate(p.created_at)} · ${escapeHtml(localizeValue(p.category))}</small></div></header><h2>${escapeHtml(pick(p,'title')||p.title)}</h2><p class="discussion-body">${escapeHtml(pick(p,'body')||p.body)}</p><footer><button data-react="${p.id}">♡ ${(p.reaction_counts?.helpful||0)+(p.reaction_counts?.like||0)}</button><button data-save-post="${p.id}">${p.saved?'★':'☆'} ${t('save')}</button></footer></article><section class="panel comment-panel"><h3>${t('community.comments',{n:comments.length})}</h3><div class="comment-list">${comments.map(c=>`<article><span class="avatar">${escapeHtml(c.author?.full_name?.[0]||'S')}</span><div><b>${escapeHtml(c.author?.full_name||t('student'))}</b><p>${escapeHtml(c.body)}</p><small>${formatDate(c.created_at)} · ${formatTime(c.created_at)}</small></div></article>`).join('')}</div><form id="commentForm" data-post-id="${p.id}"><textarea name="body" required placeholder="${escapeHtml(t('community.reply'))}"></textarea><button class="button">${t('community.postReply')}</button></form></section>`,t('detail.discussion'));
}

function opportunityDetail(data={}) {
  const o=data.data||data;
  return shell(`<section class="opportunity-detail-page"><div class="opportunity-detail-main"><span class="badge soft">${escapeHtml(localizeValue(o.category||o.mode))}</span><h2>${escapeHtml(pick(o,'title'))}</h2><b>${escapeHtml(o.organization)}</b><p>${escapeHtml(pick(o,'description'))}</p><div class="detail-facts"><div><span>${t('opp.eligibility')}</span><p>${escapeHtml(pick(o,'eligibility')||'—')}</p></div><div><span>${t('opp.skills')}</span><p>${(o.skills||[]).map(s=>`<em>${escapeHtml(s)}</em>`).join(' ')}</p></div></div></div><aside class="panel opportunity-apply"><dl><div><dt>${t('opp.location')}</dt><dd>${escapeHtml(o.location||t('opp.flexible'))}</dd></div><div><dt>${t('opp.mode')}</dt><dd>${escapeHtml(localizeValue(o.mode))}</dd></div><div><dt>${t('opp.deadline')}</dt><dd>${o.deadline?formatDate(o.deadline):t('opp.open')}</dd></div></dl>${o.application_url?`<a href="${escapeHtml(o.application_url)}" target="_blank" rel="noreferrer" class="button wide">${t('opp.apply')} ↗</a>`:''}</aside></section>`,t('detail.opportunity'));
}

function managerList(data={}, titleKey='manager.students') { const rows=data.data||[]; return shell(`<section class="panel"><div class="panel-head"><div><p class="eyebrow">${t('manager')}</p><h3>${t(titleKey)}</h3></div></div><div class="admin-table">${rows.map(r=>`<div class="admin-row"><div><b>${escapeHtml(r.full_name||r.title||r.action||'—')}</b><small>${escapeHtml(r.username||localizeValue(r.status)||r.entity_kind||'')}</small></div><span>${r.created_at?formatDate(r.created_at):escapeHtml(localizeValue(r.status)||'')}</span></div>`).join('')||`<div class="empty">${t('manager.noRecords')}</div>`}</div></section>`,t(titleKey)); }

const SUBPAGE_ROUTES=new Set(['dashboard-continue','dashboard-upcoming','subjects-progress','subjects-bookmarked','schedule-agenda','schedule-completed','rooms-mine','rooms-upcoming','community-questions','community-resources','community-saved']);

async function loadRoute(route) {
  const p=route.params;
  if(['dashboard-continue','dashboard-upcoming'].includes(route.name)) return (await get('/api/bootstrap')).data;
  if(['subjects-progress','subjects-bookmarked'].includes(route.name)) return await get('/api/subjects');
  if(['schedule-agenda','schedule-completed'].includes(route.name)) return await get('/api/schedule');
  if(['rooms-mine','rooms-upcoming'].includes(route.name)) return await get('/api/rooms');
  if(['community-questions','community-resources','community-saved'].includes(route.name)) return await get('/api/posts');
  switch(route.name){
    case 'dashboard': return (await get('/api/bootstrap')).data;
    case 'subjects': return await get(`/api/subjects${location.search}`);
    case 'subject-detail': { const [subject,lectures,degrees]=await Promise.all([get(`/api/subjects/${p.subjectId}`),get(`/api/subjects/${p.subjectId}/lectures`),get(`/api/subjects/${p.subjectId}/degrees`)]); return {subject:subject.data,lectures,degrees}; }
    case 'lecture': { const [lecture,progress]=await Promise.all([get(`/api/lectures/${p.lectureId}`),get(`/api/lectures/${p.lectureId}/progress`)]); return {lecture:lecture.data,progress}; }
    case 'schedule': return await get('/api/schedule');
    case 'rooms': return await get('/api/rooms');
    case 'room-detail': return await get(`/api/rooms/${p.roomId}`);
    case 'community': return await get('/api/posts');
    case 'post-detail': return await get(`/api/posts/${p.postId}`);
    case 'opportunities': { const category=location.pathname==='/scholarships'?'scholarship':location.pathname==='/volunteer'?'volunteer':'work'; return await get(`/api/opportunities?category=${category}`); }
    case 'opportunity-detail': return await get(`/api/opportunities/${p.opportunityId}`);
    case 'courses': return (await get('/api/courses')).data;
    case 'notifications': return await get('/api/notifications');
    case 'profile': return await get('/api/profile');
    case 'user-profile': return await get(`/api/users/${p.userId}/profile`);
    case 'settings': return await get('/api/settings');
    case 'manager-reports': return await get('/api/manager/reports');
    case 'manager-students': return await get('/api/manager/students');
    case 'manager-student': return await get(`/api/manager/students/${p.userId}`);
    case 'manager-audit': return await get('/api/manager/audit');
    default: return {};
  }
}

function renderRoute(route,data){
  if(SUBPAGE_ROUTES.has(route.name)){const page=renderSubPage(route.name,data);return shell(page.html,page.title);}
  switch(route.name){
    case 'landing': return landing(); case 'signin': return auth('signin'); case 'signup': return auth('signup'); case 'dashboard': return dashboard(data); case 'subjects': return subjects(data); case 'schedule': return schedule(data); case 'community': return community(data); case 'rooms': return rooms(data); case 'opportunities': return opportunities(data,location.pathname.slice(1)==='scholarships'?'scholarship':location.pathname.slice(1)==='volunteer'?'volunteer':'work'); case 'courses': return courses(data); case 'notifications': return notifications(data); case 'profile': case 'user-profile': return profile(data); case 'settings': return settings(data); case 'manager-reports': return managerList(data,'manager.communityReports'); case 'manager-students': return managerList(data,'manager.students'); case 'manager-audit': return managerList(data,'manager.audit'); case 'subject-detail': return subjectDetail(data); case 'lecture': return lectureDetail(data); case 'room-detail': return roomDetail(data); case 'post-detail': return postDetail(data); case 'opportunity-detail': return opportunityDetail(data); case 'manager-student': return managerList({data:[data.data||data]},'detail.student'); case 'not-found': return shell(`<div class="state-page"><b>404</b><h2>${t('state.notFound')}</h2>${link('/dashboard',t('state.backDashboard'),'class="button"')}</div>`,'404'); default:return shell(`<div class="state-page"><b>403</b><h2>${t('state.forbidden')}</h2></div>`,'403'); }
}

function bind(root, route){
  root.querySelectorAll('[data-link]').forEach(a=>a.addEventListener('click',e=>{ if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return; e.preventDefault(); navigate(a.getAttribute('href')); }));
  const form=qs('#authForm',root); if(form) form.addEventListener('submit', async e=>{ e.preventDefault(); const fd=new FormData(form); const signup=route.name==='signup'; try { if(signup){ fd.append('preferred_language',state.language); const res=await fetch('/api/auth/signup',{method:'POST',body:fd,credentials:'same-origin'}); const payload=await res.json(); if(!res.ok) throw Object.assign(new Error(payload.error?.message||t('state.error')),{code:payload.error?.code,payload}); } else await post('/api/auth/signin',{email:fd.get('email'),password:fd.get('password')}); await loadSession(); navigate(state.session.activeCourse?'/dashboard':'/courses',{replace:true}); } catch(err){ qs('#formError',root).textContent=errorText(err); } });
  qs('#languageSelect',root)?.addEventListener('change',async e=>{ const language=e.target.value; setLanguage(language); try{await patch('/api/settings',{preferred_language:language});}catch{} renderCurrent(root); });
  qs('#signOut',root)?.addEventListener('click',async()=>{ await post('/api/auth/signout'); state.session.user=null; navigate('/',{replace:true}); });
  qs('#readAll',root)?.addEventListener('click',async()=>{ await post('/api/notifications/read-all'); toast(t('notifications.marked')); renderCurrent(root); });
  root.querySelectorAll('[data-setting]').forEach(el=>el.addEventListener('change',async()=>{ const value=el.type==='checkbox'?el.checked:el.value; await patch('/api/settings',{[el.dataset.setting]:value}); toast(t('settings.updated')); }));
  root.querySelectorAll('[data-activate]').forEach(el=>el.addEventListener('click',async()=>{ await post(`/api/courses/${el.dataset.activate}/activate`); await loadSession(); toast(t('toast.courseChanged')); renderCurrent(root); }));
  root.querySelectorAll('[data-enroll]').forEach(el=>el.addEventListener('click',async()=>{ await post(`/api/courses/${el.dataset.enroll}/enroll`); await loadSession(); toast(t('toast.courseAdded')); renderCurrent(root); }));
  root.querySelectorAll('[data-complete]').forEach(el=>el.addEventListener('click',async()=>{ const row=el.closest('.schedule-row'); await patch(`/api/schedule/${el.dataset.complete}`,{completed:!row.classList.contains('done')}); renderCurrent(root); }));
  root.querySelectorAll('[data-delete]').forEach(el=>el.addEventListener('click',async()=>{ await del(`/api/schedule/${el.dataset.delete}`); renderCurrent(root); }));
  root.querySelectorAll('[data-save-opp]').forEach(el=>el.addEventListener('click',async()=>{ await post(`/api/opportunities/${el.dataset.saveOpp}/save`); toast(t('toast.saved')); renderCurrent(root); }));
  root.querySelectorAll('[data-save-post]').forEach(el=>el.addEventListener('click',async()=>{ await post(`/api/posts/${el.dataset.savePost}/save`); toast(t('toast.saved')); renderCurrent(root); }));
  root.querySelectorAll('[data-react]').forEach(el=>el.addEventListener('click',async()=>{ await post(`/api/posts/${el.dataset.react}/reactions`,{reaction:'helpful'}); renderCurrent(root); }));
  root.querySelectorAll('[data-complete-lecture]').forEach(el=>el.addEventListener('click',async()=>{ await patch(`/api/lectures/${el.dataset.completeLecture}/progress`,{completed:el.dataset.completed!=='1'}); renderCurrent(root); }));
  root.querySelectorAll('[data-bookmark-lecture]').forEach(el=>el.addEventListener('click',async()=>{ await patch(`/api/lectures/${el.dataset.bookmarkLecture}/progress`,{bookmarked:el.dataset.bookmarked!=='1'}); renderCurrent(root); }));
  qs('#commentForm',root)?.addEventListener('submit',async e=>{ e.preventDefault(); const form=e.currentTarget; const body=new FormData(form).get('body'); await post(`/api/posts/${form.dataset.postId}/comments`,{body}); renderCurrent(root); });
  root.querySelectorAll('[data-room-join]').forEach(el=>el.addEventListener('click',async()=>{ await post(`/api/rooms/${el.dataset.roomJoin}/join`); renderCurrent(root); }));
  qs('#roomMessageForm',root)?.addEventListener('submit',async e=>{ e.preventDefault(); const form=e.currentTarget; const body=new FormData(form).get('body'); await post(`/api/rooms/${form.dataset.roomId}/messages`,{body}); renderCurrent(root); });
}

async function renderCurrent(root){
  const route=resolve(); const redirect=guard(route); if(redirect){ navigate(redirect,{replace:true}); return; }
  root.innerHTML=`<div class="loading"><span></span><p>${t('loading')}</p></div>`;
  try { const data=await loadRoute(route); root.innerHTML=renderRoute(route,data); bind(root,route); } catch(error){ if(error.status===401){ state.session.user=null; navigate(`/sign-in?next=${encodeURIComponent(location.pathname)}`,{replace:true}); return; } root.innerHTML=shell(`<div class="state-page"><b>!</b><h2>${escapeHtml(errorText(error))}</h2><p>${escapeHtml(error.requestId?`#${error.requestId}`:t('state.tryAgain'))}</p><button id="retry" class="button">${t('retry')}</button></div>`,t('state.errorTitle')); qs('#retry',root)?.addEventListener('click',()=>renderCurrent(root)); bind(root,route); }
}

export async function createApp(root){
  setLanguage(state.language);
  try { await loadSession(); } catch {}
  addEventListener('popstate',()=>renderCurrent(root));
  renderCurrent(root);
}
