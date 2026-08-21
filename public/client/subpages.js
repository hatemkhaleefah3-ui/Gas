import { state } from '/client/state.js';
import { t, pick, formatDate, formatTime, localizeValue } from '/client/i18n.js';

const escapeHtml = (value='') => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const link = (path,label,extra='') => `<a href="${path}" data-link ${extra}>${label}</a>`;
const ring = value => `<div class="subpage-ring" style="--p:${Math.max(0,Math.min(100,Number(value)||0))}"><span>${Math.round(Number(value)||0)}%</span></div>`;
const hero = (eyebrow,title,lead,icon='✦') => `<section class="subpage-hero"><div><p class="eyebrow">${escapeHtml(eyebrow)}</p><h2>${escapeHtml(title)}</h2><p>${escapeHtml(lead)}</p></div><div class="subpage-hero-mark" aria-hidden="true">${icon}</div></section>`;

function continueLearning(data={}) {
  const items=data.dashboard?.continueLearning || data.activeCourseSummary?.continueLearning || [];
  return {
    title:t('dashboard.continueTitle'),
    html:`${hero(t('dashboard.focus'),t('dashboard.continueTitle'),t('dashboard.continueLead'),'↗')}<section class="subpage-layout"><div class="subpage-primary"><div class="section-kicker"><span>${t('continue')}</span><b>${items.length}</b></div><div class="journey-list">${items.length?items.map((item,index)=>`<a data-link href="/subjects/${item.subject_id}/lectures/${item.id}" class="journey-card"><span class="journey-index">${String(index+1).padStart(2,'0')}</span><div><small>${escapeHtml(pick(item,'subject_name') || t('detail.lecture'))}</small><h3>${escapeHtml(pick(item,'title'))}</h3><p>${t('lecture.estimated',{n:item.estimated_minutes||0})}</p></div><i>→</i></a>`).join(''):`<div class="empty-card">${t('empty')}</div>`}</div></div><aside class="panel subpage-aside"><p class="eyebrow">${t('progress')}</p><h3>${Math.round(data.dashboard?.lectureProgressPercent||0)}%</h3><p>${t('dashboard.lecturesDone',{n:data.dashboard?.completedLectureCount||0})}</p>${ring(data.dashboard?.lectureProgressPercent||0)}</aside></section>`
  };
}

function upcomingStudy(data={}) {
  const items=data.dashboard?.upcomingSchedule || data.activeCourseSummary?.upcomingSchedule || [];
  return {
    title:t('dashboard.upcomingTitle'),
    html:`${hero(t('dashboard.plan'),t('dashboard.upcomingTitle'),t('dashboard.upcomingLead'),'◷')}<div class="agenda-stream">${items.length?items.map((item,index)=>`<article class="agenda-card"><div class="agenda-date"><b>${formatDate(item.starts_at,{day:'2-digit'})}</b><span>${formatDate(item.starts_at,{month:'short'})}</span></div><div><small>${formatTime(item.starts_at)} · ${escapeHtml(localizeValue(item.category||'study'))}</small><h3>${escapeHtml(item.title)}</h3><p>${formatDate(item.starts_at,{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p></div><span class="agenda-order">${String(index+1).padStart(2,'0')}</span></article>`).join(''):`<div class="empty-card">${t('dashboard.noUpcoming')}</div>`}</div>`
  };
}

function subjectProgress(data={}) {
  const rows=data.data||[];
  const average=rows.length?rows.reduce((sum,row)=>sum+Number(row.progress_percentage||0),0)/rows.length:0;
  return {
    title:t('subjects.progressTitle'),
    html:`${hero(t('learn'),t('subjects.progressTitle'),t('subjects.progressLead'),'◒')}<section class="progress-overview"><article class="progress-master"><div><span>${t('average')}</span><b>${Math.round(average)}%</b><small>${t('dashboard.activeCourse')}</small></div>${ring(average)}</article><div class="progress-subjects">${rows.length?rows.map(row=>`<a data-link href="/subjects/${row.id}" class="progress-subject"><div><span>${escapeHtml(row.code||'')}</span><h3>${escapeHtml(pick(row,'name'))}</h3><small>${t('subjects.lectures',{done:row.completed_lecture_count||0,total:row.lecture_count||0})}</small></div><div class="progress-track"><i style="width:${Math.max(0,Math.min(100,row.progress_percentage||0))}%"></i></div><b>${Math.round(row.progress_percentage||0)}%</b></a>`).join(''):`<div class="empty-card">${t('empty')}</div>`}</div></section>`
  };
}

function bookmarkedLearning(data={}) {
  const rows=(data.data||[]).filter(row => Number(row.progress_percentage||0) > 0).slice(0,6);
  return {
    title:t('subjects.bookmarkedTitle'),
    html:`${hero(t('bookmarked'),t('subjects.bookmarkedTitle'),t('subjects.bookmarkedLead'),'◇')}<div class="bookmark-board">${rows.length?rows.map(row=>`<a data-link href="/subjects/${row.id}" class="bookmark-study-card"><div class="bookmark-ribbon">◇</div><span>${escapeHtml(row.code||'')}</span><h3>${escapeHtml(pick(row,'name'))}</h3><p>${escapeHtml(pick(row,'description'))}</p><footer><span>${Math.round(row.progress_percentage||0)}% ${t('progress').toLowerCase()}</span><i>→</i></footer></a>`).join(''):`<div class="empty-card">${t('subjects.noBookmarks')}</div>`}</div>`
  };
}

function schedulePage(data={},mode='agenda') {
  const all=data.data||[];
  const rows=mode==='completed'?all.filter(item=>item.completed):[...all].sort((a,b)=>new Date(a.starts_at)-new Date(b.starts_at));
  const title=mode==='completed'?t('schedule.completedTitle'):t('schedule.agendaTitle');
  const lead=mode==='completed'?t('schedule.completedLead'):t('schedule.agendaLead');
  return {
    title,
    html:`${hero(t('plan'),title,lead,mode==='completed'?'✓':'≡')}<div class="agenda-page">${rows.length?rows.map(item=>`<article class="agenda-page-row ${item.completed?'done':''}"><div class="agenda-time"><b>${formatTime(item.starts_at)}</b><span>${formatDate(item.starts_at,{weekday:'short'})}</span></div><div><small>${formatDate(item.starts_at,{month:'long',day:'numeric',year:'numeric'})}</small><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(localizeValue(item.category||'study'))}</p></div><span class="agenda-state">${item.completed?'✓':''}</span></article>`).join(''):`<div class="empty-card">${mode==='completed'?t('schedule.noneCompleted'):t('schedule.empty')}</div>`}</div>`
  };
}

function roomsPage(data={},mode='mine') {
  const all=data.data||[];
  const rows=mode==='mine'?all.filter(room=>['member','host','pending'].includes(String(room.membership_state||'').toLowerCase())||room.owner_id===state.session.user?.id):[...all].sort((a,b)=>new Date(a.starts_at||0)-new Date(b.starts_at||0));
  const title=mode==='mine'?t('rooms.mineTitle'):t('rooms.upcomingTitle');
  const lead=mode==='mine'?t('rooms.mineLead'):t('rooms.upcomingLead');
  return {
    title,
    html:`${hero(t('rooms'),title,lead,'◎')}<div class="room-feature-grid">${rows.length?rows.map(room=>`<article class="room-feature"><div class="room-feature-top"><span>${escapeHtml(localizeValue(room.status||'Open'))}</span><b>${t('rooms.members',{count:room.member_count||0,capacity:room.capacity||0})}</b></div><h3>${escapeHtml(room.name)}</h3><p>${escapeHtml(room.topic||room.description||'')}</p><div class="room-feature-time">${room.starts_at?`${formatDate(room.starts_at,{weekday:'short',month:'short',day:'numeric'})} · ${formatTime(room.starts_at)}`:''}</div>${link(`/study-rooms/${room.id}`,t('rooms.openRoom'),'class="button small secondary"')}</article>`).join(''):`<div class="empty-card">${mode==='mine'?t('rooms.noMine'):t('rooms.noUpcoming')}</div>`}</div>`
  };
}

function communityPage(data={},mode='questions') {
  const all=data.data||[];
  const rows=mode==='questions'?all.filter(post=>/question/i.test(post.category||'')):mode==='resources'?all.filter(post=>/resource|tip/i.test(`${post.category||''} ${post.title||''} ${post.body||''}`)):all.filter(post=>post.saved);
  const title=mode==='questions'?t('community.questionsTitle'):mode==='resources'?t('community.resourcesTitle'):t('community.savedTitle');
  const lead=mode==='questions'?t('community.questionsLead'):mode==='resources'?t('community.resourcesLead'):t('community.savedLead');
  return {
    title,
    html:`${hero(t('community'),title,lead,mode==='questions'?'?':mode==='resources'?'↗':'◇')}<div class="discussion-library">${rows.length?rows.map(post=>`<article class="discussion-library-card"><header><span class="avatar">${escapeHtml(post.author?.full_name?.[0]||'S')}</span><div><b>${escapeHtml(post.author?.full_name||t('student'))}</b><small>${formatDate(post.created_at)}</small></div><em>${escapeHtml(localizeValue(post.category||'Discussion'))}</em></header><a data-link href="/community/${post.id}"><h3>${escapeHtml(post.title)}</h3><p>${escapeHtml(post.body)}</p></a><footer><span>♡ ${(post.reaction_counts?.helpful||0)+(post.reaction_counts?.like||0)}</span><span>${t('community.comments',{n:post.comment_count||0})}</span></footer></article>`).join(''):`<div class="empty-card">${mode==='saved'?t('community.noSaved'):t('community.beFirst')}</div>`}</div>`
  };
}

export function renderSubPage(routeName,data={}) {
  switch(routeName) {
    case 'dashboard-continue': return continueLearning(data);
    case 'dashboard-upcoming': return upcomingStudy(data);
    case 'subjects-progress': return subjectProgress(data);
    case 'subjects-bookmarked': return bookmarkedLearning(data);
    case 'schedule-agenda': return schedulePage(data,'agenda');
    case 'schedule-completed': return schedulePage(data,'completed');
    case 'rooms-mine': return roomsPage(data,'mine');
    case 'rooms-upcoming': return roomsPage(data,'upcoming');
    case 'community-questions': return communityPage(data,'questions');
    case 'community-resources': return communityPage(data,'resources');
    case 'community-saved': return communityPage(data,'saved');
    default: return null;
  }
}
