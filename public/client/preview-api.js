const KEY = 'dafati.preview.v2';

const iso = (offsetDays = 0, hour = 9, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};
const clone = value => JSON.parse(JSON.stringify(value));
const page = () => ({ cursor: null, nextCursor: null, hasMore: false });
const id = prefix => `${prefix}_${crypto.randomUUID().slice(0, 8)}`;

function seed() {
  return {
    session: null,
    users: {},
    settings: {},
    activeCourseId: {},
    enrollments: {},
    progress: {},
    savedPosts: {},
    savedOpps: {},
    reactions: {},
    courses: [
      { id:'course_cs2', slug:'cs-year-2', name_en:'Computer Science · Year 2', name_ar:'علوم الحاسوب · المرحلة الثانية', description_en:'Core algorithms, databases and software engineering.', description_ar:'الخوارزميات وقواعد البيانات وهندسة البرمجيات.', audience:'TARGETED', published:1 },
      { id:'course_focus', slug:'focus-lab', name_en:'Focus Lab', name_ar:'مختبر التركيز', description_en:'A public study-skills course for better weekly systems.', description_ar:'دورة عامة لبناء عادات وأنظمة دراسة أسبوعية أفضل.', audience:'PUBLIC', published:1 },
      { id:'course_english', slug:'academic-english', name_en:'Academic English', name_ar:'الإنجليزية الأكاديمية', description_en:'Writing, presentation and research communication.', description_ar:'الكتابة والعرض والتواصل البحثي.', audience:'PUBLIC', published:1 }
    ],
    subjects: [
      { id:'sub_algo', code:'CS204', name_en:'Algorithms', name_ar:'الخوارزميات', description_en:'Design, analyse and reason about efficient algorithms.', description_ar:'تصميم وتحليل الخوارزميات الفعالة.', published:1, lecture_count:8, completed_lecture_count:5, progress_percentage:63 },
      { id:'sub_db', code:'CS212', name_en:'Database Systems', name_ar:'أنظمة قواعد البيانات', description_en:'Relational design, SQL, transactions and indexing.', description_ar:'التصميم العلائقي وSQL والمعاملات والفهارس.', published:1, lecture_count:7, completed_lecture_count:4, progress_percentage:57 },
      { id:'sub_se', code:'CS220', name_en:'Software Engineering', name_ar:'هندسة البرمجيات', description_en:'Architecture, testing, teamwork and maintainable systems.', description_ar:'المعمارية والاختبار والعمل الجماعي والأنظمة القابلة للصيانة.', published:1, lecture_count:6, completed_lecture_count:2, progress_percentage:33 },
      { id:'sub_math', code:'MTH201', name_en:'Discrete Mathematics', name_ar:'الرياضيات المتقطعة', description_en:'Logic, graphs, counting and proof techniques.', description_ar:'المنطق والرسوم البيانية والعد وتقنيات البرهان.', published:1, lecture_count:9, completed_lecture_count:7, progress_percentage:78 }
    ],
    lectures: [
      { id:'lec_algo_1', subject_id:'sub_algo', title_en:'Greedy algorithms', title_ar:'الخوارزميات الجشعة', content_en:'Learn when a locally optimal choice produces a globally optimal solution. Work through interval scheduling and exchange arguments.', content_ar:'تعلّم متى يقود الاختيار الأمثل محلياً إلى حل أمثل عالمياً، مع أمثلة عملية.', estimated_minutes:42, published:1 },
      { id:'lec_algo_2', subject_id:'sub_algo', title_en:'Dynamic programming', title_ar:'البرمجة الديناميكية', content_en:'Model overlapping subproblems, define state transitions and reconstruct optimal solutions.', content_ar:'نمذجة المسائل الفرعية المتداخلة وبناء انتقالات الحالة وإعادة تكوين الحلول المثلى.', estimated_minutes:55, published:1 },
      { id:'lec_db_1', subject_id:'sub_db', title_en:'Indexes and query plans', title_ar:'الفهارس وخطط الاستعلام', content_en:'Understand B-trees, selectivity and how query planners choose access paths.', content_ar:'فهم أشجار B والانتقائية وكيف تختار مخططات الاستعلام مسارات الوصول.', estimated_minutes:38, published:1 },
      { id:'lec_se_1', subject_id:'sub_se', title_en:'Testing strategies', title_ar:'استراتيجيات الاختبار', content_en:'Build a balanced testing pyramid and choose useful boundaries for unit and integration tests.', content_ar:'بناء هرم اختبار متوازن واختيار حدود مناسبة لاختبارات الوحدة والتكامل.', estimated_minutes:34, published:1 }
    ],
    degrees: [
      { id:'deg1', subject_id:'sub_algo', title:'Midterm', assessment_kind:'Exam', score:42, max_score:50, recorded_at:iso(-10) },
      { id:'deg2', subject_id:'sub_db', title:'SQL project', assessment_kind:'Project', score:18, max_score:20, recorded_at:iso(-7) }
    ],
    schedule: [
      { id:'sch1', title:'Algorithms · problem set', subject_id:'sub_algo', category:'study', starts_at:iso(0,17,30), ends_at:iso(0,18,30), reminder:1, completed:0 },
      { id:'sch2', title:'Database revision', subject_id:'sub_db', category:'study', starts_at:iso(1,16,0), ends_at:iso(1,17,15), reminder:1, completed:0 },
      { id:'sch3', title:'Software engineering room', subject_id:'sub_se', category:'group', starts_at:iso(2,19,0), ends_at:iso(2,20,0), reminder:0, completed:0 }
    ],
    posts: [
      { id:'post1', user_id:'preview_peer_1', author:{id:'preview_peer_1',full_name:'Sara Ahmed',username:'sara'}, subject_id:'sub_algo', category:'Question', title:'How are you deciding between greedy and DP?', body:'I made a small checklist from the lecture, but I still hesitate when the optimal-substructure clue is subtle. What signal do you look for first?', pinned:1, locked:0, reaction_counts:{like:9,helpful:14,insightful:3}, comment_count:5, created_at:iso(-1,20,10) },
      { id:'post2', user_id:'preview_peer_2', author:{id:'preview_peer_2',full_name:'Omar Ali',username:'omar'}, subject_id:'sub_db', category:'Study tip', title:'A 20-minute SQL query-plan routine', body:'Run EXPLAIN, write what you expect first, then compare. It made indexes much easier to understand because you stop treating the planner like magic.', pinned:0, locked:0, reaction_counts:{like:6,helpful:19,insightful:8}, comment_count:3, created_at:iso(-2,18,0) }
    ],
    comments: {
      post1: [
        { id:'c1', user_id:'preview_peer_2', author:{full_name:'Omar Ali'}, body:'I first ask whether a local choice can be proven safe. If not, I start looking for reusable subproblems.', created_at:iso(-1,20,30) },
        { id:'c2', user_id:'preview_peer_3', author:{full_name:'Lina Kareem'}, body:'Drawing the recurrence before coding helps me decide quickly.', created_at:iso(-1,21,0) }
      ]
    },
    rooms: [
      { id:'room1', owner_id:'preview_peer_3', owner:{full_name:'Lina Kareem'}, subject_id:'sub_algo', name:'Algorithms sprint', topic:'DP patterns before the quiz', description:'Quiet 60-minute problem solving, then 20 minutes comparing solutions.', starts_at:iso(0,19,0), duration_minutes:80, capacity:8, visibility:'Open', status:'Open', member_count:5, membership_state:'none' },
      { id:'room2', owner_id:'preview_peer_1', owner:{full_name:'Sara Ahmed'}, subject_id:'sub_db', name:'Database clinic', topic:'Indexes + normalization', description:'Bring one confusing query or schema.', starts_at:iso(1,18,0), duration_minutes:60, capacity:6, visibility:'Approval', status:'Open', member_count:4, membership_state:'none' }
    ],
    roomMessages: {
      room1: [
        { id:'m1', user_id:'preview_peer_3', author:{full_name:'Lina Kareem'}, body:'Start with questions 2, 4 and 7. We will compare recurrences at 7:45.', message_kind:'Announcement', created_at:iso(0,18,50) }
      ]
    },
    opportunities: [
      { id:'opp1', category:'work', title_en:'Software Engineering Intern', title_ar:'متدرب هندسة برمجيات', organization:'Northstar Labs', description_en:'Join a product engineering team building education tools used across the region.', description_ar:'انضم إلى فريق هندسة منتجات يبني أدوات تعليمية مستخدمة في المنطقة.', eligibility_en:'Computer science students in year 2 or above.', eligibility_ar:'طلبة علوم الحاسوب من المرحلة الثانية فما فوق.', skills:['JavaScript','Git','APIs'], location:'Baghdad · Iraq', mode:'Hybrid', level:'Internship', deadline:iso(12), application_url:'https://example.com/apply', published:1 },
      { id:'opp2', category:'scholarship', title_en:'Digital Futures Scholarship', title_ar:'منحة المستقبل الرقمي', organization:'Future Foundation', description_en:'Support for students pursuing computing and digital research.', description_ar:'دعم للطلبة في تخصصات الحوسبة والبحث الرقمي.', eligibility_en:'Strong academic standing and a short personal statement.', eligibility_ar:'معدل أكاديمي جيد وبيان شخصي قصير.', skills:['Research','Writing'], location:'Iraq', mode:'Funding', level:'Undergraduate', deadline:iso(25), application_url:'https://example.com/scholarship', published:1 },
      { id:'opp3', category:'volunteer', title_en:'Code Club Mentor', title_ar:'مرشد نادي البرمجة', organization:'Open Learning Network', description_en:'Mentor secondary-school students in a weekly beginner coding club.', description_ar:'إرشاد طلبة المدارس في نادي برمجة أسبوعي للمبتدئين.', eligibility_en:'Comfortable explaining programming basics.', eligibility_ar:'القدرة على شرح أساسيات البرمجة.', skills:['Mentoring','Programming'], location:'Remote', mode:'Remote', level:'Volunteer', deadline:null, application_url:'https://example.com/volunteer', published:1 }
    ],
    notifications: [
      { id:'ntf1', category:'study', event:'schedule_reminder', title:'Algorithms session in 45 minutes', body:'Problem set · 5:30 PM', path:'/schedule', read:0, created_at:iso(0,16,45) },
      { id:'ntf2', category:'community', event:'post_comment', title:'New reply on your discussion', body:'Omar replied to your post.', path:'/community/post1', read:0, created_at:iso(-1,21,0) },
      { id:'ntf3', category:'scholarship', event:'published', title:'New scholarship match', body:'Digital Futures Scholarship is now open.', path:'/opportunities/opp2', read:1, created_at:iso(-2,12,0) }
    ]
  };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const next = seed();
  save(next);
  return next;
}
function save(db) { localStorage.setItem(KEY, JSON.stringify(db)); }
function currentUser(db) { return db.session ? db.users[db.session] || null : null; }
function activeCourse(db, userId) {
  const cid = db.activeCourseId[userId];
  return db.courses.find(c => c.id === cid) || null;
}
function requireUser(db) {
  const user = currentUser(db);
  if (!user) throw previewError(401,'UNAUTHENTICATED','Sign in required');
  return user;
}
function previewError(status, code, message, fields = {}) {
  const error = new Error(message);
  error.status = status; error.code = code; error.fields = fields; error.requestId = 'pages-preview';
  return error;
}
function response(data, extra = {}) { return { data: clone(data), ...extra }; }
function usernameFrom(email) { return String(email || 'student').split('@')[0].replace(/[^a-z0-9._-]/gi,'').slice(0,36) || 'student'; }
function subjectFor(db, id) { return db.subjects.find(s => s.id === id); }
function lectureFor(db, id) { return db.lectures.find(l => l.id === id); }

export async function previewRequest(path, init = {}) {
  const db = load();
  const method = (init.method || 'GET').toUpperCase();
  const url = new URL(path, location.origin);
  const pathname = url.pathname;
  const body = init.body instanceof FormData ? Object.fromEntries(init.body.entries()) : (typeof init.body === 'string' ? JSON.parse(init.body || '{}') : (init.body || {}));

  if (pathname === '/api/auth/signup' && method === 'POST') {
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const fullName = String(body.full_name || '').trim();
    if (!fullName) throw previewError(422,'VALIDATION_ERROR','Please enter your full name',{full_name:'Required'});
    if (!/^\S+@\S+\.\S+$/.test(email)) throw previewError(422,'VALIDATION_ERROR','Enter a valid email',{email:'Invalid email'});
    if (password.length < 8) throw previewError(422,'VALIDATION_ERROR','Password must be at least 8 characters',{password:'Minimum 8 characters'});
    const existing = Object.values(db.users).find(u => u.email === email);
    if (existing) throw previewError(409,'EMAIL_IN_USE','This preview account already exists. Sign in instead.');
    const userId = id('usr');
    const user = { id:userId, email, username:usernameFrom(email), full_name:fullName, role:'STUDENT', streak:12, status:'ACTIVE', bio:'', learning_goal:'Build a consistent weekly study system.' };
    db.users[userId] = user;
    db.settings[userId] = { preferred_language:String(body.preferred_language || 'en'), study_reminders:1, scholarship_alerts:1, job_alerts:1, volunteer_alerts:1, community_notifications:1, room_notifications:1, profile_visibility:'classmates' };
    db.enrollments[userId] = [{ user_id:userId, course_id:'course_cs2', position:1, active:1, source:'AUTO', ...db.courses.find(c=>c.id==='course_cs2') }];
    db.activeCourseId[userId] = 'course_cs2';
    db.session = userId;
    save(db);
    return response({ user, activeCourse:activeCourse(db,userId), preview:true });
  }

  if (pathname === '/api/auth/signin' && method === 'POST') {
    const email = String(body.email || '').trim().toLowerCase();
    if (email === 'manager@dafati.app' && String(body.password) === 'manager123') {
      const managerId = 'preview_manager';
      if (!db.users[managerId]) {
        db.users[managerId] = { id:managerId,email,username:'manager',full_name:'DAFATI Manager',role:'MANAGER',streak:0,status:'ACTIVE',bio:'Platform manager',learning_goal:'' };
        db.settings[managerId] = { preferred_language:'en',study_reminders:1,scholarship_alerts:1,job_alerts:1,volunteer_alerts:1,community_notifications:1,room_notifications:1,profile_visibility:'private' };
        db.enrollments[managerId] = [{ user_id:managerId,course_id:'course_cs2',position:1,active:1,source:'MANAGER',...db.courses.find(c=>c.id==='course_cs2') }];
        db.activeCourseId[managerId] = 'course_cs2';
      }
      db.session = managerId; save(db); return response({user:db.users[managerId]});
    }
    const user = Object.values(db.users).find(u => u.email === email);
    if (!user) throw previewError(401,'INVALID_CREDENTIALS','No preview account found. Create one first, or use the manager demo.');
    db.session = user.id; save(db); return response({user});
  }

  if (pathname === '/api/auth/signout' && method === 'POST') { db.session = null; save(db); return null; }
  if (pathname === '/api/auth/me' && method === 'GET') {
    const user = currentUser(db);
    if (!user) throw previewError(401,'UNAUTHENTICATED','No active preview session');
    return response({ user, activeCourse:activeCourse(db,user.id) });
  }

  const user = requireUser(db);
  const uid = user.id;
  const course = activeCourse(db,uid);

  if (pathname === '/api/bootstrap' && method === 'GET') {
    const completed = Object.values(db.progress[uid] || {}).filter(p => p.completed).length || 18;
    const lectureCount = db.subjects.reduce((n,s)=>n+s.lecture_count,0);
    const unread = db.notifications.filter(n=>!n.read).length;
    const summary = {
      subjectCount:db.subjects.length,
      lectureCount,
      completedLectureCount:completed,
      lectureProgressPercent:Math.round(completed/lectureCount*100),
      academicAverage:86,
      studyMinutesWeek:405,
      continueLearning:db.lectures.slice(0,4).map(l=>({ ...l, subject_name_en:subjectFor(db,l.subject_id)?.name_en, subject_name_ar:subjectFor(db,l.subject_id)?.name_ar })),
      upcomingSchedule:db.schedule.filter(s=>!s.completed).slice(0,4)
    };
    return response({ user, settings:db.settings[uid], enrollments:db.enrollments[uid] || [], activeCourse:course, activeCourseSummary:summary, dashboard:summary, notificationUnreadCount:unread, permissions:user.role==='MANAGER'?['manage_catalog','manage_assessments','moderate','manage_opportunities','manage_users','view_audit']:[] });
  }

  if (pathname === '/api/profile' && method === 'GET') return response({ ...user, educational_stage:'University', academic_field:'Computer Science', institution_category:'UNIVERSITY', institution_name:'Tikrit University', country:'Iraq' });
  if (pathname === '/api/profile' && method === 'PATCH') { Object.assign(db.users[uid],body); save(db); return response(db.users[uid]); }
  if (pathname === '/api/settings' && method === 'GET') return response(db.settings[uid]);
  if (pathname === '/api/settings' && method === 'PATCH') { Object.assign(db.settings[uid],body); save(db); return response(db.settings[uid]); }
  if (pathname === '/api/account/password' && method === 'PATCH') return response({changed:true,preview:true});

  if (pathname === '/api/courses' && method === 'GET') {
    const enrolled = db.enrollments[uid] || [];
    const ids = new Set(enrolled.map(e=>e.course_id));
    return response({ enrollments:enrolled, available:db.courses.filter(c=>c.audience==='PUBLIC'&&!ids.has(c.id)), remainingOptionalPositions:Math.max(0,3-enrolled.length), activeCourse:course });
  }
  let match = pathname.match(/^\/api\/courses\/([^/]+)\/enroll$/);
  if (match && method === 'POST') {
    const target=db.courses.find(c=>c.id===match[1]); if(!target) throw previewError(404,'NOT_FOUND','Course not found');
    const list=db.enrollments[uid]||[]; if(list.some(e=>e.course_id===target.id)) throw previewError(409,'ALREADY_ENROLLED','Already enrolled');
    if(list.length>=3) throw previewError(409,'ENROLLMENT_LIMIT','Maximum three courses');
    const entry={user_id:uid,course_id:target.id,position:[2,3].find(p=>!list.some(e=>e.position===p)),active:0,source:'SELF',...target}; list.push(entry);db.enrollments[uid]=list;save(db);return response(entry);
  }
  match = pathname.match(/^\/api\/courses\/([^/]+)\/activate$/);
  if (match && method === 'POST') { const list=db.enrollments[uid]||[]; if(!list.some(e=>e.course_id===match[1])) throw previewError(404,'NOT_ENROLLED','Course is not enrolled'); list.forEach(e=>e.active=e.course_id===match[1]?1:0); db.activeCourseId[uid]=match[1];save(db);return response({activeCourse:activeCourse(db,uid)}); }

  if (pathname === '/api/subjects' && method === 'GET') return response(db.subjects,{page:page()});
  match=pathname.match(/^\/api\/subjects\/([^/]+)$/);
  if(match&&method==='GET'){const s=subjectFor(db,match[1]);if(!s)throw previewError(404,'NOT_FOUND','Subject not found');return response(s);}
  match=pathname.match(/^\/api\/subjects\/([^/]+)\/lectures$/);
  if(match&&method==='GET')return response(db.lectures.filter(l=>l.subject_id===match[1]),{page:page()});
  match=pathname.match(/^\/api\/subjects\/([^/]+)\/degrees$/);
  if(match&&method==='GET')return response(db.degrees.filter(d=>d.subject_id===match[1]),{page:page()});
  match=pathname.match(/^\/api\/lectures\/([^/]+)$/);
  if(match&&method==='GET'){const l=lectureFor(db,match[1]);if(!l)throw previewError(404,'NOT_FOUND','Lecture not found');return response({...l,subject:subjectFor(db,l.subject_id)});}
  match=pathname.match(/^\/api\/lectures\/([^/]+)\/progress$/);
  if(match&&method==='GET'){return response((db.progress[uid]||{})[match[1]]||{completed:0,bookmarked:0});}
  if(match&&method==='PATCH'){db.progress[uid] ||= {};const current=db.progress[uid][match[1]]||{completed:0,bookmarked:0};Object.assign(current,body);db.progress[uid][match[1]]=current;save(db);return response(current);}

  if(pathname==='/api/schedule'&&method==='GET')return response(db.schedule,{page:page()});
  if(pathname==='/api/schedule'&&method==='POST'){const item={id:id('sch'),title:String(body.title||'Study session'),subject_id:body.subject_id||null,category:body.category||'study',starts_at:body.starts_at||iso(1,17),ends_at:body.ends_at||iso(1,18),reminder:body.reminder?1:0,completed:0};db.schedule.push(item);save(db);return response(item);}
  match=pathname.match(/^\/api\/schedule\/([^/]+)$/);
  if(match&&method==='PATCH'){const item=db.schedule.find(x=>x.id===match[1]);if(!item)throw previewError(404,'NOT_FOUND','Schedule item not found');Object.assign(item,body);save(db);return response(item);}
  if(match&&method==='DELETE'){db.schedule=db.schedule.filter(x=>x.id!==match[1]);save(db);return null;}

  if(pathname==='/api/posts'&&method==='GET'){
    const q=(url.searchParams.get('q')||'').toLowerCase();
    const data=db.posts.filter(p=>!q||`${p.title} ${p.body}`.toLowerCase().includes(q)).map(p=>({...p,saved:!!db.savedPosts[`${uid}:${p.id}`],current_reaction:db.reactions[`${uid}:${p.id}`]||null}));
    return response(data,{page:page()});
  }
  if(pathname==='/api/posts'&&method==='POST'){const post={id:id('post'),user_id:uid,author:{id:uid,full_name:user.full_name,username:user.username},subject_id:body.subject_id||null,category:body.category||'Discussion',title:String(body.title||'Untitled discussion'),body:String(body.body||''),pinned:0,locked:0,reaction_counts:{like:0,helpful:0,insightful:0},comment_count:0,created_at:new Date().toISOString()};db.posts.unshift(post);save(db);return response(post);}
  match=pathname.match(/^\/api\/posts\/([^/]+)$/);
  if(match&&method==='GET'){const p=db.posts.find(x=>x.id===match[1]);if(!p)throw previewError(404,'NOT_FOUND','Post not found');return response({...p,comments:db.comments[p.id]||[],saved:!!db.savedPosts[`${uid}:${p.id}`]});}
  match=pathname.match(/^\/api\/posts\/([^/]+)\/save$/);
  if(match&&method==='POST'){const key=`${uid}:${match[1]}`;db.savedPosts[key]=body.saved===undefined?!db.savedPosts[key]:!!body.saved;save(db);return response({saved:db.savedPosts[key]});}
  match=pathname.match(/^\/api\/posts\/([^/]+)\/reactions$/);
  if(match&&method==='POST'){const p=db.posts.find(x=>x.id===match[1]);if(!p)throw previewError(404,'NOT_FOUND','Post not found');const key=`${uid}:${p.id}`;const old=db.reactions[key];if(old)p.reaction_counts[old]=Math.max(0,(p.reaction_counts[old]||0)-1);if(body.reaction){db.reactions[key]=body.reaction;p.reaction_counts[body.reaction]=(p.reaction_counts[body.reaction]||0)+1;}else delete db.reactions[key];save(db);return response({reaction:db.reactions[key]||null,reaction_counts:p.reaction_counts});}
  match=pathname.match(/^\/api\/posts\/([^/]+)\/comments$/);
  if(match&&method==='POST'){const p=db.posts.find(x=>x.id===match[1]);if(!p)throw previewError(404,'NOT_FOUND','Post not found');const comment={id:id('c'),user_id:uid,author:{full_name:user.full_name},body:String(body.body||''),created_at:new Date().toISOString()};db.comments[p.id]||=[];db.comments[p.id].push(comment);p.comment_count=(p.comment_count||0)+1;save(db);return response(comment);}

  if(pathname==='/api/rooms'&&method==='GET')return response(db.rooms,{page:page()});
  if(pathname==='/api/rooms'&&method==='POST'){const room={id:id('room'),owner_id:uid,owner:{full_name:user.full_name},subject_id:body.subject_id||null,name:String(body.name||'Study room'),topic:String(body.topic||''),description:String(body.description||''),starts_at:body.starts_at||iso(1,18),duration_minutes:Number(body.duration_minutes||60),capacity:Number(body.capacity||6),visibility:body.visibility||'Open',status:'Open',member_count:1,membership_state:'host'};db.rooms.unshift(room);save(db);return response(room);}
  match=pathname.match(/^\/api\/rooms\/([^/]+)$/);
  if(match&&method==='GET'){const room=db.rooms.find(r=>r.id===match[1]);if(!room)throw previewError(404,'NOT_FOUND','Room not found');return response({...room,messages:db.roomMessages[room.id]||[],participants:[room.owner,{full_name:user.full_name}],resources:[],tasks:[],allowed_actions:['join','message']});}
  match=pathname.match(/^\/api\/rooms\/([^/]+)\/join$/);
  if(match&&method==='POST'){const room=db.rooms.find(r=>r.id===match[1]);if(!room)throw previewError(404,'NOT_FOUND','Room not found');if(room.membership_state==='member'){room.membership_state='none';room.member_count=Math.max(1,room.member_count-1);}else{room.membership_state=room.visibility==='Approval'?'pending':'member';if(room.membership_state==='member')room.member_count+=1;}save(db);return response({membership_state:room.membership_state,member_count:room.member_count});}
  match=pathname.match(/^\/api\/rooms\/([^/]+)\/messages$/);
  if(match&&method==='POST'){const message={id:id('m'),user_id:uid,author:{full_name:user.full_name},body:String(body.body||''),message_kind:'Message',created_at:new Date().toISOString()};db.roomMessages[match[1]]||=[];db.roomMessages[match[1]].push(message);save(db);return response(message);}

  if(pathname==='/api/opportunities'&&method==='GET'){
    const category=url.searchParams.get('category');
    const list=db.opportunities.filter(o=>!category||o.category===category).map(o=>({...o,saved:!!db.savedOpps[`${uid}:${o.id}`]}));
    return response(list,{page:page()});
  }
  match=pathname.match(/^\/api\/opportunities\/([^/]+)$/);
  if(match&&method==='GET'){const o=db.opportunities.find(x=>x.id===match[1]);if(!o)throw previewError(404,'NOT_FOUND','Opportunity not found');return response({...o,saved:!!db.savedOpps[`${uid}:${o.id}`]});}
  match=pathname.match(/^\/api\/opportunities\/([^/]+)\/save$/);
  if(match&&method==='POST'){const key=`${uid}:${match[1]}`;db.savedOpps[key]=body.saved===undefined?!db.savedOpps[key]:!!body.saved;save(db);return response({saved:db.savedOpps[key]});}

  if(pathname==='/api/notifications'&&method==='GET')return response(db.notifications,{page:page()});
  if(pathname==='/api/notifications/read-all'&&method==='POST'){db.notifications.forEach(n=>n.read=1);save(db);return null;}
  match=pathname.match(/^\/api\/notifications\/([^/]+)\/read$/);
  if(match&&method==='POST'){const n=db.notifications.find(x=>x.id===match[1]);if(n)n.read=1;save(db);return response(n||{});}
  match=pathname.match(/^\/api\/notifications\/([^/]+)$/);
  if(match&&method==='DELETE'){db.notifications=db.notifications.filter(n=>n.id!==match[1]);save(db);return null;}

  if(pathname==='/api/manager/students'&&method==='GET'){
    if(user.role!=='MANAGER')throw previewError(403,'FORBIDDEN','Manager access required');
    const students=Object.values(db.users).filter(u=>u.role==='STUDENT');
    return response(students.length?students:[{id:'student_demo',full_name:'Sara Ahmed',username:'sara',email:'sara@example.edu',status:'ACTIVE',role:'STUDENT'}],{page:page()});
  }
  if(pathname==='/api/manager/reports'&&method==='GET'){if(user.role!=='MANAGER')throw previewError(403,'FORBIDDEN','Manager access required');return response([{id:'report1',reason:'Misinformation',status:'Open',post_title:'Confusing exam information',author_name:'Student account',created_at:iso(-1)}],{page:page()});}
  if(pathname==='/api/manager/audit'&&method==='GET'){if(user.role!=='MANAGER')throw previewError(403,'FORBIDDEN','Manager access required');return response([{id:'audit1',action:'COURSE_PUBLISHED',entity_kind:'course',actor_user_id:uid,created_at:iso(-2)}],{page:page()});}
  match=pathname.match(/^\/api\/manager\/students\/([^/]+)$/);
  if(match&&method==='GET'){if(user.role!=='MANAGER')throw previewError(403,'FORBIDDEN','Manager access required');const target=db.users[match[1]]||{id:match[1],full_name:'Demo Student',username:'student',status:'ACTIVE',role:'STUDENT'};return response(target);}

  throw previewError(404,'PREVIEW_ROUTE_NOT_IMPLEMENTED',`This action is not available in the static preview: ${method} ${pathname}`);
}

export function resetPreview() { localStorage.removeItem(KEY); }
