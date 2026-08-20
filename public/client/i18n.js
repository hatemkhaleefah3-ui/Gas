import { state } from '/client/state.js';
const strings = {
  en: { dashboard:'Dashboard', subjects:'Subjects', schedule:'Schedule', rooms:'Study rooms', community:'Community', opportunities:'Opportunities', courses:'Courses', notifications:'Notifications', profile:'Profile', settings:'Settings', signout:'Sign out', welcome:'Welcome back', continue:'Continue learning', upcoming:'Upcoming', progress:'Progress', study:'Study time', average:'Average', search:'Search', newPost:'New post', newRoom:'Create room', empty:'Nothing here yet', retry:'Try again' },
  ar: { dashboard:'لوحة التحكم', subjects:'المواد', schedule:'الجدول', rooms:'غرف الدراسة', community:'المجتمع', opportunities:'الفرص', courses:'الدورات', notifications:'الإشعارات', profile:'الملف الشخصي', settings:'الإعدادات', signout:'تسجيل الخروج', welcome:'مرحباً بعودتك', continue:'تابع التعلم', upcoming:'القادم', progress:'التقدم', study:'وقت الدراسة', average:'المعدل', search:'بحث', newPost:'منشور جديد', newRoom:'إنشاء غرفة', empty:'لا توجد بيانات بعد', retry:'حاول مجدداً' }
};
export const t = (key) => strings[state.language]?.[key] ?? strings.en[key] ?? key;
export const pick = (record, field) => record?.[`${field}_${state.language}`] ?? record?.[`${field}_en`] ?? record?.[field] ?? '';
