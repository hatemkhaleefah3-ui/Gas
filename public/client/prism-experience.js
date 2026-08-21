import { navigate } from '/client/router.js';
import { state } from '/client/state.js';
import { post, patch } from '/client/api.js';
import { prismIcon, routeIcon } from '/client/prism-icons.js';

let appRoot;
let observer;
let scheduledFrame;
let focusTimer = null;
let focusRemaining = 25 * 60;
let focusRunning = false;

const lang = () => state.language === 'ar' ? 'ar' : 'en';
const tx = (en, ar) => lang() === 'ar' ? ar : en;
const esc = (value='') => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const route = () => location.pathname;
const isAuthenticated = () => !!state.session.user;
const dispatchRefresh = () => window.dispatchEvent(new PopStateEvent('popstate'));

const PAGE_META = [
  ['/dashboard/continue','continue', 'Continue learning','تابع التعلّم','Your next useful step, already selected.','خطوتك المفيدة التالية جاهزة.'],
  ['/dashboard/upcoming','upcoming','Upcoming study','الدراسة القادمة','A calm view of what is next.','نظرة هادئة على ما هو قادم.'],
  ['/dashboard','home','Study cockpit','مركز الدراسة','Your semester, shaped into one clear operating view.','فصلك الدراسي في لوحة تشغيل واضحة واحدة.'],
  ['/subjects/progress','progress','Learning progress','تقدم التعلّم','See momentum by subject and choose the next gap to close.','شاهد تقدمك حسب المادة واختر الفجوة التالية.'],
  ['/subjects/bookmarked','bookmark','Saved learning','المحتوى المحفوظ','Your personal shelf of important study material.','رفك الشخصي للمحتوى الدراسي المهم.'],
  ['/subjects','learn','Subject studio','استوديو المواد','Lectures, resources and assessment signals in one place.','المحاضرات والمصادر ومؤشرات التقييم في مكان واحد.'],
  ['/schedule/agenda','agenda','Study agenda','أجندة الدراسة','A chronological plan that keeps the week breathable.','خطة زمنية تحافظ على أسبوع متوازن.'],
  ['/schedule/completed','completed','Completed sessions','الجلسات المكتملة','Review the work you have already converted into progress.','راجع العمل الذي حوّلته بالفعل إلى تقدم.'],
  ['/schedule','plan','Weekly planner','مخطط الأسبوع','Build focused sessions around real academic priorities.','ابنِ جلسات مركزة حول أولوياتك الأكاديمية.'],
  ['/study-rooms/mine','rooms','My rooms','غرفي','The study spaces where you already belong.','مساحات الدراسة التي تنتمي إليها.'],
  ['/study-rooms/upcoming','upcoming','Upcoming rooms','الغرف القادمة','Live and scheduled collaboration for your active course.','تعاون مباشر ومجدول لدورتك النشطة.'],
  ['/study-rooms','rooms','Study rooms','غرف الدراسة','Find people, create a room and turn studying into momentum.','اعثر على زملاء وأنشئ غرفة وحوّل الدراسة إلى زخم.'],
  ['/community/questions','questions','Questions','الأسئلة','Focused questions from people studying the same course.','أسئلة مركزة من طلبة يدرسون نفس الدورة.'],
  ['/community/resources','resources','Resource library','مكتبة المصادر','Useful material discovered and shared by your community.','مواد مفيدة اكتشفها وشاركها مجتمعك.'],
  ['/community/saved','bookmark','Saved discussions','المناقشات المحفوظة','Threads you marked for a second, deeper look.','نقاشات حفظتها للعودة إليها بعمق.'],
  ['/community','community','Course community','مجتمع الدورة','Ask, explain, share and study with the people around you.','اسأل واشرح وشارك وادرس مع من حولك.'],
  ['/work','work','Work opportunities','فرص العمل','Internships and roles matched to emerging student skills.','تدريب ووظائف تناسب مهارات الطلبة الناشئة.'],
  ['/scholarships','scholarship','Scholarships','المنح الدراسية','Funding paths, requirements and deadlines made easier to scan.','مسارات تمويل ومتطلبات ومواعيد أسهل للمراجعة.'],
  ['/volunteer','volunteer','Volunteer','التطوع','Give your time, build experience and strengthen your network.','امنح وقتك وابنِ خبرتك ووسّع شبكتك.'],
  ['/donate','donate','Support access','دعم الوصول','Help future student support programs grow responsibly.','ساعد برامج دعم الطلبة المستقبلية على النمو بمسؤولية.'],
  ['/courses','courses','Course switchboard','لوحة الدورات','Manage the academic context that shapes the whole workspace.','أدر السياق الأكاديمي الذي يشكل مساحة عملك.'],
  ['/notifications','notifications','Activity inbox','صندوق النشاط','Important updates without the noise.','تحديثات مهمة بلا ضوضاء.'],
  ['/profile','profile','Learning identity','هويتك التعليمية','Your academic story, goals and visible progress.','قصتك الأكاديمية وأهدافك وتقدمك.'],
  ['/settings','settings','Workspace settings','إعدادات المساحة','Language, privacy, alerts and account behavior.','اللغة والخصوصية والتنبيهات وسلوك الحساب.'],
  ['/manager/','settings','Manager console','لوحة المدير','Protected administration, moderation and audit context.','إدارة محمية وإشراف وسجل تدقيق.']
];

function metaForPath(pathname=route()) {
  const exact = PAGE_META.find(([prefix]) => pathname === prefix);
  if(exact) return exact;
  const prefix = PAGE_META.find(([candidate]) => candidate.endsWith('/') && pathname.startsWith(candidate));
  if(prefix) return prefix;
  if(/^\/subjects\/[^/]+\/lectures\//.test(pathname)) return [pathname,'learn','Lecture reader','قارئ المحاضرة','Read, bookmark and complete learning in one focused space.','اقرأ واحفظ وأكمل التعلم في مساحة مركزة.'];
  if(/^\/subjects\/[^/]+$/.test(pathname)) return [pathname,'learn','Subject workspace','مساحة المادة','Lectures, assessments and progress for this subject.','محاضرات وتقييمات وتقدم هذه المادة.'];
  if(/^\/study-rooms\/[^/]+$/.test(pathname)) return [pathname,'rooms','Room workspace','مساحة الغرفة','Conversation, resources and tasks for the room.','المحادثة والمصادر والمهام الخاصة بالغرفة.'];
  if(/^\/community\/[^/]+$/.test(pathname)) return [pathname,'community','Discussion','المناقشة','A complete thread with context, reactions and replies.','نقاش كامل مع السياق والتفاعلات والردود.'];
  if(/^\/opportunities\/[^/]+$/.test(pathname)) return [pathname,'work','Opportunity brief','ملف الفرصة','Review fit, requirements, timing and the application path.','راجع الملاءمة والمتطلبات والوقت ومسار التقديم.'];
  return [pathname,routeIcon(pathname),'DAFATI workspace','مساحة دفاتـي','A focused place to move your study forward.','مكان مركز لدفع دراستك إلى الأمام.'];
}

function ensureGlobalLayers() {
  if(document.querySelector('#prismCommand')) return;
  document.body.insertAdjacentHTML('beforeend', `
    <div class="prism-command-layer" id="prismCommand" aria-hidden="true">
      <button class="prism-layer-backdrop" data-prism-command-close aria-label="${esc(tx('Close search','إغلاق البحث'))}"></button>
      <section class="prism-command" role="dialog" aria-modal="true" aria-labelledby="prismCommandTitle">
        <header><span>${prismIcon('search')}</span><input id="prismCommandInput" autocomplete="off" placeholder="${esc(tx('Search pages and actions…','ابحث في الصفحات والإجراءات…'))}"><kbd>ESC</kbd></header>
        <div class="prism-command-label" id="prismCommandTitle">${esc(tx('Navigate','التنقل'))}</div>
        <div class="prism-command-results" id="prismCommandResults"></div>
        <footer><span><i></i>${esc(tx('Move','تحرك'))}</span><span><kbd>↵</kbd>${esc(tx('Open','فتح'))}</span><span><kbd>⌘ K</kbd>${esc(tx('Search','بحث'))}</span></footer>
      </section>
    </div>
    <div class="prism-modal-layer" id="prismModal" aria-hidden="true"></div>
    <div class="prism-quick-layer" id="prismQuick" aria-hidden="true">
      <button class="prism-quick-backdrop" data-prism-quick-close></button>
      <section class="prism-quick-sheet">
        <header><div><small>${esc(tx('QUICK CREATE','إنشاء سريع'))}</small><h3>${esc(tx('Turn an intention into a real action.','حوّل نيتك إلى إجراء حقيقي.'))}</h3></div><button data-prism-quick-close>${prismIcon('close')}</button></header>
        <div class="prism-quick-grid">
          <button data-prism-action="schedule"><span>${prismIcon('plan')}</span><b>${esc(tx('Study session','جلسة دراسة'))}</b><small>${esc(tx('Place focused time on your schedule.','أضف وقتاً مركزاً إلى جدولك.'))}</small></button>
          <button data-prism-action="post"><span>${prismIcon('community')}</span><b>${esc(tx('Community post','منشور مجتمع'))}</b><small>${esc(tx('Ask, share or start a discussion.','اسأل أو شارك أو ابدأ نقاشاً.'))}</small></button>
          <button data-prism-action="room"><span>${prismIcon('rooms')}</span><b>${esc(tx('Study room','غرفة دراسة'))}</b><small>${esc(tx('Create a collaborative study space.','أنشئ مساحة دراسة تعاونية.'))}</small></button>
          <button data-prism-action="focus"><span>${prismIcon('focus')}</span><b>${esc(tx('Focus timer','مؤقت التركيز'))}</b><small>${esc(tx('Begin a distraction-light study sprint.','ابدأ فترة دراسة قليلة التشتيت.'))}</small></button>
        </div>
      </section>
    </div>
    <button class="prism-fab" id="prismFab" aria-label="${esc(tx('Quick create','إنشاء سريع'))}">${prismIcon('plus')}</button>
  `);
  bindGlobalLayers();
}

function commandItems() {
  return [
    ['/dashboard','home',tx('Study cockpit','مركز الدراسة')],
    ['/dashboard/continue','continue',tx('Continue learning','تابع التعلّم')],
    ['/dashboard/upcoming','upcoming',tx('Upcoming study','الدراسة القادمة')],
    ['/subjects','learn',tx('Subjects','المواد')],
    ['/subjects/progress','progress',tx('Learning progress','تقدم التعلّم')],
    ['/subjects/bookmarked','bookmark',tx('Bookmarked learning','التعلّم المحفوظ')],
    ['/schedule','plan',tx('Weekly planner','مخطط الأسبوع')],
    ['/schedule/agenda','agenda',tx('Study agenda','أجندة الدراسة')],
    ['/schedule/completed','completed',tx('Completed sessions','الجلسات المكتملة')],
    ['/study-rooms','rooms',tx('Study rooms','غرف الدراسة')],
    ['/study-rooms/mine','rooms',tx('My rooms','غرفي')],
    ['/community','community',tx('Community','المجتمع')],
    ['/community/questions','questions',tx('Questions','الأسئلة')],
    ['/community/resources','resources',tx('Resources','المصادر')],
    ['/work','work',tx('Work opportunities','فرص العمل')],
    ['/scholarships','scholarship',tx('Scholarships','المنح')],
    ['/volunteer','volunteer',tx('Volunteer','التطوع')],
    ['/courses','courses',tx('Courses','الدورات')],
    ['/notifications','notifications',tx('Notifications','الإشعارات')],
    ['/profile','profile',tx('Profile','الملف الشخصي')],
    ['/settings','settings',tx('Settings','الإعدادات')]
  ];
}

function renderCommand(query='') {
  const target=document.querySelector('#prismCommandResults');
  if(!target)return;
  const normalized=query.trim().toLowerCase();
  const items=commandItems().filter(item=>!normalized||item[2].toLowerCase().includes(normalized)||item[0].includes(normalized));
  target.innerHTML=items.length?items.map(([path,icon,label],index)=>`<button class="${index===0?'selected':''}" data-prism-route="${path}"><span>${prismIcon(icon)}</span><div><b>${esc(label)}</b><small>${path}</small></div><i>${prismIcon('arrow')}</i></button>`).join(''):`<div class="prism-command-empty">${esc(tx('No matching page.','لا توجد صفحة مطابقة.'))}</div>`;
}

function openCommand() {
  const layer=document.querySelector('#prismCommand');
  if(!layer)return;
  renderCommand();
  layer.classList.add('open');layer.setAttribute('aria-hidden','false');
  document.body.classList.add('prism-overlay-open');
  requestAnimationFrame(()=>document.querySelector('#prismCommandInput')?.focus());
}
function closeCommand(){const layer=document.querySelector('#prismCommand');layer?.classList.remove('open');layer?.setAttribute('aria-hidden','true');document.body.classList.remove('prism-overlay-open');}
function openQuick(){const layer=document.querySelector('#prismQuick');layer?.classList.add('open');layer?.setAttribute('aria-hidden','false');document.body.classList.add('prism-overlay-open');}
function closeQuick(){const layer=document.querySelector('#prismQuick');layer?.classList.remove('open');layer?.setAttribute('aria-hidden','true');document.body.classList.remove('prism-overlay-open');}

function bindGlobalLayers() {
  document.querySelector('#prismCommandInput')?.addEventListener('input',event=>renderCommand(event.target.value));
  document.querySelector('#prismCommand')?.addEventListener('click',event=>{
    if(event.target.closest('[data-prism-command-close]')){closeCommand();return;}
    const routeButton=event.target.closest('[data-prism-route]');if(routeButton){closeCommand();navigate(routeButton.dataset.prismRoute);}
  });
  document.querySelector('#prismQuick')?.addEventListener('click',event=>{
    if(event.target.closest('[data-prism-quick-close]')){closeQuick();return;}
    const action=event.target.closest('[data-prism-action]')?.dataset.prismAction;if(action){closeQuick();openAction(action);}
  });
  document.querySelector('#prismFab')?.addEventListener('click',openQuick);
  document.addEventListener('keydown',event=>{
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();openCommand();}
    if(event.key==='Escape'){closeCommand();closeQuick();closeModal();}
  });
}

function modalShell(title,lead,body,submitLabel) {
  const layer=document.querySelector('#prismModal');
  layer.innerHTML=`<button class="prism-modal-backdrop" data-prism-modal-close></button><section class="prism-modal-card" role="dialog" aria-modal="true"><header><div><small>${esc(tx('DAFATI ACTION','إجراء دفاتـي'))}</small><h2>${esc(title)}</h2><p>${esc(lead)}</p></div><button type="button" data-prism-modal-close>${prismIcon('close')}</button></header><form id="prismActionForm">${body}<div class="prism-form-error" id="prismFormError"></div><footer><button type="button" class="button secondary" data-prism-modal-close>${esc(tx('Cancel','إلغاء'))}</button><button type="submit" class="button">${esc(submitLabel)}</button></footer></form></section>`;
  layer.classList.add('open');layer.setAttribute('aria-hidden','false');document.body.classList.add('prism-overlay-open');
  layer.querySelectorAll('[data-prism-modal-close]').forEach(button=>button.addEventListener('click',closeModal));
  requestAnimationFrame(()=>layer.querySelector('input,textarea,select')?.focus());
  return layer.querySelector('#prismActionForm');
}
function closeModal(){const layer=document.querySelector('#prismModal');if(!layer)return;layer.classList.remove('open');layer.setAttribute('aria-hidden','true');layer.innerHTML='';document.body.classList.remove('prism-overlay-open');}
function field(label,control){return `<label><span>${esc(label)}</span>${control}</label>`;}
function isoFromLocal(value){return value?new Date(value).toISOString():new Date().toISOString();}
function defaultLocal(hours=1){const d=new Date(Date.now()+hours*3600000);d.setMinutes(Math.ceil(d.getMinutes()/15)*15,0,0);return d.toISOString().slice(0,16);}

function openAction(action) {
  if(action==='focus'){openFocusModal();return;}
  if(action==='schedule'){
    const start=defaultLocal(2);const end=new Date(new Date(start).getTime()+60*60000).toISOString().slice(0,16);
    const form=modalShell(tx('Create a study session','إنشاء جلسة دراسة'),tx('Give the session a clear outcome and a protected time window.','امنح الجلسة نتيجة واضحة ووقتاً محمياً.'),`${field(tx('Session title','عنوان الجلسة'),'<input name="title" required maxlength="160" placeholder="'+esc(tx('Example: Algorithms problem set','مثال: مسائل الخوارزميات'))+'">')}<div class="prism-form-grid">${field(tx('Starts','تبدأ'),`<input name="starts_at" type="datetime-local" value="${start}" required>`)}${field(tx('Ends','تنتهي'),`<input name="ends_at" type="datetime-local" value="${end}" required>`)}</div><div class="prism-form-grid">${field(tx('Category','الفئة'),`<select name="category"><option value="study">${esc(tx('Study','دراسة'))}</option><option value="revision">${esc(tx('Revision','مراجعة'))}</option><option value="group">${esc(tx('Group work','عمل جماعي'))}</option></select>`)}${field(tx('Reminder','تذكير'),`<select name="reminder"><option value="1">${esc(tx('On','مفعل'))}</option><option value="0">${esc(tx('Off','متوقف'))}</option></select>`)}</div>`,tx('Create session','إنشاء الجلسة'));
    form.addEventListener('submit',async event=>{event.preventDefault();await submitAction(form,()=>post('/api/schedule',{title:form.title.value.trim(),category:form.category.value,starts_at:isoFromLocal(form.starts_at.value),ends_at:isoFromLocal(form.ends_at.value),reminder:form.reminder.value==='1'}),tx('Study session created.','تم إنشاء جلسة الدراسة.'));});
  }
  if(action==='post'){
    const form=modalShell(tx('Start a useful discussion','ابدأ نقاشاً مفيداً'),tx('Give classmates enough context to respond well.','امنح زملاءك سياقاً كافياً للرد بشكل جيد.'),`${field(tx('Title','العنوان'),'<input name="title" required maxlength="200">')}<div class="prism-form-grid">${field(tx('Category','الفئة'),`<select name="category"><option>Question</option><option>Study tip</option><option>Resource</option><option>Discussion</option></select>`)}${field(tx('Visibility','الظهور'),`<input value="${esc(tx('Active course','الدورة النشطة'))}" disabled>`)}</div>${field(tx('What do you want to share?','ماذا تريد أن تشارك؟'),'<textarea name="body" required maxlength="10000" rows="6"></textarea>')}`,tx('Publish post','نشر المنشور'));
    form.addEventListener('submit',async event=>{event.preventDefault();await submitAction(form,()=>post('/api/posts',{title:form.title.value.trim(),category:form.category.value,body:form.body.value.trim()}),tx('Discussion published.','تم نشر النقاش.'));});
  }
  if(action==='room'){
    const form=modalShell(tx('Create a study room','إنشاء غرفة دراسة'),tx('Define a clear topic so the right people can join.','حدد موضوعاً واضحاً لينضم الأشخاص المناسبون.'),`${field(tx('Room name','اسم الغرفة'),'<input name="name" required maxlength="160">')}${field(tx('Topic','الموضوع'),'<input name="topic" required maxlength="300">')}${field(tx('Description','الوصف'),'<textarea name="description" rows="4" maxlength="2000"></textarea>')}<div class="prism-form-grid">${field(tx('Capacity','السعة'),'<input name="capacity" type="number" min="2" max="50" value="8" required>')}${field(tx('Duration','المدة'),`<select name="duration_minutes"><option value="45">45 ${esc(tx('minutes','دقيقة'))}</option><option value="60" selected>60 ${esc(tx('minutes','دقيقة'))}</option><option value="90">90 ${esc(tx('minutes','دقيقة'))}</option></select>`)}</div><div class="prism-form-grid">${field(tx('Starts','تبدأ'),`<input name="starts_at" type="datetime-local" value="${defaultLocal(3)}">`)}${field(tx('Joining','الانضمام'),`<select name="visibility"><option value="Open">${esc(tx('Open','مفتوحة'))}</option><option value="Approval">${esc(tx('Approval required','تحتاج موافقة'))}</option></select>`)}</div>`,tx('Create room','إنشاء الغرفة'));
    form.addEventListener('submit',async event=>{event.preventDefault();await submitAction(form,()=>post('/api/rooms',{name:form.name.value.trim(),topic:form.topic.value.trim(),description:form.description.value.trim(),capacity:Number(form.capacity.value),duration_minutes:Number(form.duration_minutes.value),starts_at:isoFromLocal(form.starts_at.value),visibility:form.visibility.value}),tx('Study room created.','تم إنشاء غرفة الدراسة.'));});
  }
}

async function submitAction(form,request,successMessage){const submit=form.querySelector('[type="submit"]');const error=form.querySelector('#prismFormError');submit.disabled=true;submit.classList.add('loading');error.textContent='';try{await request();closeModal();showPrismToast(successMessage);dispatchRefresh();}catch(err){error.textContent=err.message||tx('Something went wrong.','حدث خطأ ما.');submit.disabled=false;submit.classList.remove('loading');}}

function openFocusModal(){
  const form=modalShell(tx('Focus sprint','جلسة تركيز'),tx('A quiet twenty-five minute block with one visible intention.','خمس وعشرون دقيقة هادئة مع نية واحدة واضحة.'),`<div class="prism-focus-modal"><div class="prism-focus-time" id="prismFocusTime">25:00</div>${field(tx('Session intention','نية الجلسة'),'<input id="prismFocusIntent" maxlength="120" placeholder="'+esc(tx('What will be complete when the timer ends?','ما الذي سينتهي عند انتهاء المؤقت؟'))+'">')}<div class="prism-focus-actions"><button type="button" class="button" id="prismFocusToggle">${esc(tx('Start focus','ابدأ التركيز'))}</button><button type="button" class="button secondary" id="prismFocusReset">${esc(tx('Reset','إعادة'))}</button></div></div>`,tx('Keep open','أبقها مفتوحة'));
  form.querySelector('footer').style.display='none';
  const update=()=>{const min=String(Math.floor(focusRemaining/60)).padStart(2,'0');const sec=String(focusRemaining%60).padStart(2,'0');form.querySelector('#prismFocusTime').textContent=`${min}:${sec}`;form.querySelector('#prismFocusToggle').textContent=focusRunning?tx('Pause','إيقاف مؤقت'):tx('Start focus','ابدأ التركيز');};
  form.querySelector('#prismFocusToggle').addEventListener('click',()=>{focusRunning=!focusRunning;clearInterval(focusTimer);if(focusRunning)focusTimer=setInterval(()=>{focusRemaining=Math.max(0,focusRemaining-1);update();if(!focusRemaining){focusRunning=false;clearInterval(focusTimer);showPrismToast(tx('Focus sprint complete.','اكتملت جلسة التركيز.'));}},1000);update();});
  form.querySelector('#prismFocusReset').addEventListener('click',()=>{focusRunning=false;clearInterval(focusTimer);focusRemaining=25*60;update();});
  update();
}

function showPrismToast(message){const toast=document.querySelector('#toast');if(!toast)return;toast.textContent=message;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2200);}

function addUtilityEnhancements(shell){
  const utility=shell.querySelector('.adaptive-utility');if(!utility||utility.dataset.prismUtility)return;utility.dataset.prismUtility='1';
  const actions=utility.querySelector('.utility-actions');
  if(actions)actions.insertAdjacentHTML('afterbegin',`<button class="prism-command-trigger" data-prism-command-open aria-label="${esc(tx('Search workspace','بحث في المساحة'))}">${prismIcon('search')}<span>${esc(tx('Search','بحث'))}</span><kbd>⌘K</kbd></button>`);
  utility.querySelector('[data-prism-command-open]')?.addEventListener('click',openCommand);
}

function replaceNavigationIcons(shell){
  const pathMap={
    '/dashboard':'home','/dashboard/continue':'continue','/dashboard/upcoming':'upcoming',
    '/subjects':'learn','/subjects/progress':'progress','/subjects/bookmarked':'bookmark',
    '/schedule':'plan','/schedule/agenda':'agenda','/schedule/completed':'completed',
    '/study-rooms':'rooms','/study-rooms/mine':'rooms','/study-rooms/upcoming':'upcoming',
    '/community':'community','/community/questions':'questions','/community/resources':'resources','/community/saved':'bookmark',
    '/work':'work','/scholarships':'scholarship','/volunteer':'volunteer','/donate':'donate','/profile':'profile','/settings':'settings','/courses':'courses'
  };
  shell.querySelectorAll('[data-main-path],[data-sub-path]').forEach(button=>{const path=button.dataset.mainPath||button.dataset.subPath;const wrap=button.querySelector('.nav-icon-wrap');if(wrap)wrap.innerHTML=prismIcon(pathMap[path]||routeIcon(path));});
  shell.querySelectorAll('[data-secondary-link]').forEach(link=>{const href=link.getAttribute('href')||'';const wrap=link.querySelector(':scope > span');if(wrap)wrap.innerHTML=prismIcon(pathMap[href]||routeIcon(href));const arrow=link.querySelector(':scope > i');if(arrow)arrow.innerHTML=prismIcon('arrow');});
  const menu=shell.querySelector('[data-sidebar-open]');if(menu)menu.innerHTML=prismIcon('menu');
  const notification=shell.querySelector('[data-nav-notifications]');if(notification){const badge=notification.querySelector('i')?.outerHTML||'';notification.innerHTML=`${prismIcon('notifications')}${badge}`;}
  const course=shell.querySelector('[data-course-toggle] .utility-course-icon');if(course)course.innerHTML=prismIcon('courses');
}

function routeHeroMarkup(){
  const [,icon,titleEn,titleAr,leadEn,leadAr]=metaForPath();
  const title=tx(titleEn,titleAr),lead=tx(leadEn,leadAr);
  const course=state.session.activeCourse?.[`name_${lang()}`]||state.session.activeCourse?.name_en||tx('Your active course','دورتك النشطة');
  return `<section class="prism-route-hero"><div class="prism-route-orb">${prismIcon(icon,'prism-route-icon')}</div><div><div class="prism-route-kicker"><span>${esc(course)}</span><i></i><span>${esc(tx('Live workspace','مساحة مباشرة'))}</span></div><h2>${esc(title)}</h2><p>${esc(lead)}</p></div><div class="prism-route-actions"><button data-prism-action="focus">${prismIcon('focus')}<span>${esc(tx('Focus','تركيز'))}</span></button><button data-prism-action="schedule">${prismIcon('plus')}<span>${esc(tx('Plan','خطط'))}</span></button></div></section>`;
}

function dashboardModules(){
  const name=state.session.user?.full_name?.split(' ')[0]||tx('Student','طالب');
  return `<section class="prism-bento prism-dashboard-modules">
    <article class="prism-card prism-focus-card" data-prism-action="focus"><header><span>${prismIcon('focus')}</span><small>${esc(tx('FOCUS COMPASS','بوصلة التركيز'))}</small></header><div class="prism-focus-score"><b>82</b><span>/100</span></div><h3>${esc(tx('You are in a strong rhythm,','إيقاعك قوي،'))} ${esc(name)}.</h3><p>${esc(tx('Protect one uninterrupted block today to keep the curve rising.','احمِ فترة واحدة بلا مقاطعة اليوم للمحافظة على تقدمك.'))}</p><footer><span>${esc(tx('Start 25 min','ابدأ 25 دقيقة'))}</span>${prismIcon('arrow')}</footer></article>
    <article class="prism-card prism-rhythm-card"><header><div><small>${esc(tx('WEEKLY RHYTHM','إيقاع الأسبوع'))}</small><h3>${esc(tx('Study consistency','ثبات الدراسة'))}</h3></div><b>6.7h</b></header><div class="prism-bars">${[42,68,54,84,72,35,66].map((height,index)=>`<i style="--bar:${height}%"><span>${['M','T','W','T','F','S','S'][index]}</span></i>`).join('')}</div><footer><span><i></i>${esc(tx('Focused study','دراسة مركزة'))}</span><span><i></i>${esc(tx('Collaboration','تعاون'))}</span></footer></article>
    <article class="prism-card prism-team-card"><header><small>${esc(tx('STUDY CIRCLE','دائرة الدراسة'))}</small><span class="prism-live-dot">${esc(tx('4 online','4 متصلون'))}</span></header><div class="prism-avatar-row"><span>SA</span><span>OA</span><span>LK</span><span>+4</span></div><h3>${esc(tx('Algorithms sprint starts at 7:00 PM','تبدأ جلسة الخوارزميات 7:00 م'))}</h3><p>${esc(tx('A shared room is waiting with a prepared problem set.','غرفة مشتركة تنتظرك مع مجموعة مسائل جاهزة.'))}</p><a href="/study-rooms" data-link>${esc(tx('Open rooms','افتح الغرف'))}${prismIcon('arrow')}</a></article>
    <article class="prism-card prism-signal-card"><small>${esc(tx('NEXT MILESTONE','المحطة التالية'))}</small><div><b>03</b><span>${esc(tx('days','أيام'))}</span></div><h3>${esc(tx('Database systems quiz','اختبار أنظمة قواعد البيانات'))}</h3><p>${esc(tx('4 of 6 preparation steps complete.','اكتملت 4 من 6 خطوات تحضير.'))}</p><div class="prism-linear"><i style="width:67%"></i></div></article>
  </section>`;
}

function subjectModules(){return `<section class="prism-split-section"><article class="prism-card prism-resource-shelf"><header><div><small>${esc(tx('RESOURCE PULSE','نبض المصادر'))}</small><h3>${esc(tx('New in your subjects','الجديد في موادك'))}</h3></div><span>12</span></header><div class="prism-resource-list"><a href="/subjects" data-link><span>${prismIcon('resources')}</span><div><b>${esc(tx('Algorithm patterns sheet','ملخص أنماط الخوارزميات'))}</b><small>${esc(tx('Added today · 8 pages','أضيف اليوم · 8 صفحات'))}</small></div></a><a href="/subjects" data-link><span>${prismIcon('learn')}</span><div><b>${esc(tx('Database query planning','تخطيط استعلامات قواعد البيانات'))}</b><small>${esc(tx('Lecture update · 38 min','تحديث محاضرة · 38 دقيقة'))}</small></div></a><a href="/subjects" data-link><span>${prismIcon('progress')}</span><div><b>${esc(tx('Discrete math practice set','تمارين الرياضيات المتقطعة'))}</b><small>${esc(tx('Recommended from your progress','موصى بها حسب تقدمك'))}</small></div></a></div></article><aside class="prism-card prism-study-map"><small>${esc(tx('COURSE MAP','خريطة الدورة'))}</small><h3>${esc(tx('4 subjects moving','4 مواد تتقدم'))}</h3><div class="prism-map-nodes"><span style="--x:14%;--y:30%">CS</span><span style="--x:57%;--y:18%">DB</span><span style="--x:78%;--y:58%">SE</span><span style="--x:30%;--y:72%">M</span></div><p>${esc(tx('Your strongest momentum is in Discrete Mathematics.','أقوى زخم لديك في الرياضيات المتقطعة.'))}</p></aside></section>`;}
function scheduleModules(){return `<section class="prism-bento prism-plan-modules"><article class="prism-card prism-dayline"><header><small>${esc(tx('TODAY AT A GLANCE','نظرة على اليوم'))}</small><b>${esc(tx('3 protected blocks','3 فترات محمية'))}</b></header><div class="prism-dayline-track"><i style="--start:7%;--size:18%"><span>09:00</span></i><i style="--start:38%;--size:25%"><span>14:30</span></i><i style="--start:72%;--size:17%"><span>19:00</span></i></div><footer><span>08</span><span>12</span><span>16</span><span>20</span></footer></article><article class="prism-card prism-plan-tip"><span>${prismIcon('spark')}</span><small>${esc(tx('SMART SUGGESTION','اقتراح ذكي'))}</small><h3>${esc(tx('Leave a 20-minute recovery gap before your group room.','اترك 20 دقيقة راحة قبل غرفتك الجماعية.'))}</h3><button data-prism-action="schedule">${esc(tx('Add buffer','أضف فترة'))}</button></article></section>`;}
function roomModules(){return `<section class="prism-split-section"><article class="prism-card prism-live-room"><header><span class="prism-live-dot">${esc(tx('LIVE NOW','مباشر الآن'))}</span><small>CS204</small></header><h3>${esc(tx('Algorithm patterns clinic','عيادة أنماط الخوارزميات'))}</h3><p>${esc(tx('Five students are comparing dynamic-programming state designs.','خمسة طلبة يقارنون تصاميم حالات البرمجة الديناميكية.'))}</p><div class="prism-avatar-row"><span>SA</span><span>OA</span><span>LK</span><span>+2</span></div><a href="/study-rooms" data-link>${esc(tx('Enter room','ادخل الغرفة'))}${prismIcon('arrow')}</a></article><article class="prism-card prism-partner-match"><small>${esc(tx('PARTNER MATCH','توافق الزملاء'))}</small><h3>91%</h3><p>${esc(tx('Your schedule and study goals overlap with four active classmates.','يتوافق جدولك وأهدافك مع أربعة زملاء نشطين.'))}</p><div class="prism-linear"><i style="width:91%"></i></div></article></section>`;}
function communityModules(){return `<section class="prism-community-strip"><article><small>${esc(tx('TRENDING','رائج'))}</small><b># ${esc(tx('exam-prep','تحضير-الاختبار'))}</b><span>28 ${esc(tx('posts','منشوراً'))}</span></article><article><small>${esc(tx('MOST HELPFUL','الأكثر فائدة'))}</small><b>${esc(tx('SQL query plan routine','روتين خطة استعلام SQL'))}</b><span>19 ${esc(tx('helps','إفادة'))}</span></article><article><small>${esc(tx('PEERS ONLINE','الزملاء المتصلون'))}</small><b>17</b><span>${esc(tx('in this course','في هذه الدورة'))}</span></article></section>`;}
function opportunityModules(kind){const labels={work:[tx('Application tracker','متابعة التقديم'),'3',tx('active applications','طلبات نشطة')],scholarship:[tx('Deadline radar','رادار المواعيد'),'12',tx('days to nearest deadline','يوماً لأقرب موعد')],volunteer:[tx('Impact hours','ساعات الأثر'),'18',tx('hours available this month','ساعة متاحة هذا الشهر')]};const data=labels[kind]||labels.work;return `<section class="prism-opportunity-band"><article><span>${prismIcon(kind==='scholarship'?'scholarship':kind==='volunteer'?'volunteer':'work')}</span><div><small>${esc(data[0])}</small><b>${esc(data[1])}</b><p>${esc(data[2])}</p></div></article><div><span>${esc(tx('Profile fit','توافق الملف'))}</span><b>84%</b><div class="prism-linear"><i style="width:84%"></i></div></div><a href="/profile" data-link>${esc(tx('Improve profile','حسّن ملفك'))}${prismIcon('arrow')}</a></section>`;}
function profileModules(){return `<section class="prism-bento prism-profile-modules"><article class="prism-card"><small>${esc(tx('LEARNING SIGNATURE','بصمتك التعليمية'))}</small><h3>${esc(tx('Consistent · Collaborative · Visual','ثابت · تعاوني · بصري'))}</h3><p>${esc(tx('Your strongest sessions combine clear goals, diagrams and a peer check-in.','أفضل جلساتك تجمع أهدافاً واضحة ورسومات ومراجعة مع زميل.'))}</p></article><article class="prism-card prism-achievements"><small>${esc(tx('ACHIEVEMENTS','الإنجازات'))}</small><div><span>${prismIcon('completed')}<b>${esc(tx('12-day rhythm','إيقاع 12 يوماً'))}</b></span><span>${prismIcon('rooms')}<b>${esc(tx('Room contributor','مساهم في الغرف'))}</b></span><span>${prismIcon('community')}<b>${esc(tx('Helpful voice','صوت مفيد'))}</b></span></div></article><article class="prism-card prism-network-card"><small>${esc(tx('COURSE NETWORK','شبكة الدورة'))}</small><b>24</b><span>${esc(tx('classmates in your learning circle','زميلاً في دائرة تعلّمك'))}</span><div class="prism-avatar-row"><span>SA</span><span>OA</span><span>LK</span><span>+21</span></div></article></section>`;}
function settingsModules(){return `<section class="prism-settings-lab"><article class="prism-card"><small>${esc(tx('INTERFACE MODE','وضع الواجهة'))}</small><h3>${esc(tx('Tune how DAFATI feels','اضبط شعور دفاتـي'))}</h3><div class="prism-choice-row"><button data-prism-density="comfortable" class="active">${esc(tx('Comfortable','مريح'))}</button><button data-prism-density="compact">${esc(tx('Compact','مضغوط'))}</button></div></article><article class="prism-card"><small>${esc(tx('MOTION','الحركة'))}</small><h3>${esc(tx('Responsive motion system','نظام حركة متجاوب'))}</h3><label class="prism-switch"><input type="checkbox" data-prism-motion checked><span></span><b>${esc(tx('Motion enabled','الحركة مفعلة'))}</b></label></article></section>`;}

function enrichContent(shell){
  const content=shell.querySelector('.content');if(!content||content.dataset.prismContent)return;content.dataset.prismContent='1';
  content.insertAdjacentHTML('afterbegin',routeHeroMarkup());
  const pathname=route();
  let extra='';
  if(pathname==='/dashboard') extra=dashboardModules();
  else if(pathname==='/subjects') extra=subjectModules();
  else if(pathname==='/schedule') extra=scheduleModules();
  else if(pathname==='/study-rooms') extra=roomModules();
  else if(pathname==='/community') extra=communityModules();
  else if(pathname==='/work') extra=opportunityModules('work');
  else if(pathname==='/scholarships') extra=opportunityModules('scholarship');
  else if(pathname==='/volunteer') extra=opportunityModules('volunteer');
  else if(pathname==='/profile') extra=profileModules();
  else if(pathname==='/settings') extra=settingsModules();
  if(extra)content.insertAdjacentHTML('beforeend',extra);
  content.querySelectorAll('[data-prism-action]').forEach(button=>button.addEventListener('click',()=>openAction(button.dataset.prismAction)));
  bindSettingsLab(content);
  bindSearchFilters(content);
  bindTilt(content);
  observeEntrance(content);
}

function bindSettingsLab(content){
  content.querySelectorAll('[data-prism-density]').forEach(button=>button.addEventListener('click',()=>{content.querySelectorAll('[data-prism-density]').forEach(x=>x.classList.remove('active'));button.classList.add('active');document.documentElement.dataset.density=button.dataset.prismDensity;localStorage.setItem('dafati.density',button.dataset.prismDensity);}));
  const motion=content.querySelector('[data-prism-motion]');if(motion){motion.checked=localStorage.getItem('dafati.motion')!=='off';motion.addEventListener('change',()=>{localStorage.setItem('dafati.motion',motion.checked?'on':'off');document.documentElement.classList.toggle('prism-motion-off',!motion.checked);});}
}
function bindSearchFilters(content){content.querySelectorAll('.search input').forEach(input=>{if(input.dataset.prismSearch)return;input.dataset.prismSearch='1';input.addEventListener('input',()=>{const q=input.value.trim().toLowerCase();const cards=content.querySelectorAll('.subject-card,.post-card,.room-card,.opportunity-card,.admin-row');cards.forEach(card=>card.hidden=!!q&&!card.textContent.toLowerCase().includes(q));});});}
function bindTilt(content){if(!matchMedia('(hover:hover) and (pointer:fine)').matches)return;content.querySelectorAll('.subject-card,.room-card,.opportunity-card,.prism-card').forEach(card=>{if(card.dataset.prismTilt)return;card.dataset.prismTilt='1';card.addEventListener('pointermove',event=>{const r=card.getBoundingClientRect();const x=(event.clientX-r.left)/r.width-.5;const y=(event.clientY-r.top)/r.height-.5;card.style.setProperty('--tilt-x',`${(-y*4).toFixed(2)}deg`);card.style.setProperty('--tilt-y',`${(x*5).toFixed(2)}deg`);card.style.setProperty('--glow-x',`${(x+.5)*100}%`);card.style.setProperty('--glow-y',`${(y+.5)*100}%`);});card.addEventListener('pointerleave',()=>{card.style.removeProperty('--tilt-x');card.style.removeProperty('--tilt-y');});});}
function observeEntrance(content){const items=content.querySelectorAll('.panel,.subject-card,.schedule-row,.post-card,.room-card,.opportunity-card,.prism-card,.prism-route-hero,.subpage-hero');const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('prism-visible');io.unobserve(entry.target);}}),{threshold:.08});items.forEach((item,index)=>{item.classList.add('prism-reveal');item.style.setProperty('--reveal-index',index%8);io.observe(item);});}

function enhancePublicPage(){
  const landing=appRoot.querySelector('.landing');if(landing&&!landing.dataset.prismPublic){landing.dataset.prismPublic='1';landing.insertAdjacentHTML('afterbegin','<div class="prism-public-grid" aria-hidden="true"></div>');observeEntrance(landing);}
  const auth=appRoot.querySelector('.auth-page');if(auth&&!auth.dataset.prismPublic){auth.dataset.prismPublic='1';auth.insertAdjacentHTML('afterbegin','<div class="prism-auth-aura" aria-hidden="true"></div>');observeEntrance(auth);}
}

function enhance(){
  ensureGlobalLayers();
  document.documentElement.dataset.prism='active';
  document.documentElement.dataset.density=localStorage.getItem('dafati.density')||'comfortable';
  document.documentElement.classList.toggle('prism-motion-off',localStorage.getItem('dafati.motion')==='off');
  if(!isAuthenticated()){document.querySelector('#prismFab')?.classList.add('hidden');enhancePublicPage();return;}
  document.querySelector('#prismFab')?.classList.remove('hidden');
  const shell=appRoot.querySelector('.app-shell');if(!shell||shell.dataset.prismReady)return;shell.dataset.prismReady='1';
  shell.insertAdjacentHTML('afterbegin','<div class="prism-ambient" aria-hidden="true"><i></i><i></i><i></i></div>');
  addUtilityEnhancements(shell);replaceNavigationIcons(shell);enrichContent(shell);
}

function scheduleEnhance(){cancelAnimationFrame(scheduledFrame);scheduledFrame=requestAnimationFrame(enhance);}

export function initPrismExperience(root){
  appRoot=root;
  observer?.disconnect();
  observer=new MutationObserver(scheduleEnhance);
  observer.observe(root,{childList:true,subtree:true});
  scheduleEnhance();
}
