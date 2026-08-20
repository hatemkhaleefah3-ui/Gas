export const state = {
  session: { user: null, settings: null, permissions: [], enrollments: [], activeCourse: null },
  route: { path: location.pathname, params: {}, query: new URLSearchParams(location.search), data: null, loading: false, error: null },
  notifications: { unreadCount: 0 },
  language: localStorage.getItem('dafati.language') || 'en'
};

const listeners = new Set();
export const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
export const emit = () => listeners.forEach(fn => fn(state));
export function setLanguage(language) {
  state.language = language === 'ar' ? 'ar' : 'en';
  localStorage.setItem('dafati.language', state.language);
  document.documentElement.lang = state.language;
  document.documentElement.dir = state.language === 'ar' ? 'rtl' : 'ltr';
  emit();
}
