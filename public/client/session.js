import { get } from '/client/api.js';
import { state, setLanguage } from '/client/state.js';

export async function loadSession() {
  try {
    const me = await get('/api/auth/me');
    state.session.user = me.data.user;
    state.session.activeCourse = me.data.activeCourse || null;
    const bootstrap = await get('/api/bootstrap');
    Object.assign(state.session, {
      settings: bootstrap.data.settings,
      permissions: bootstrap.data.permissions || [],
      enrollments: bootstrap.data.enrollments || [],
      activeCourse: bootstrap.data.activeCourse || null
    });
    state.notifications.unreadCount = bootstrap.data.notificationUnreadCount || 0;
    if (bootstrap.data.settings?.preferred_language) setLanguage(bootstrap.data.settings.preferred_language);
    return true;
  } catch (error) {
    if (error.status === 401) {
      state.session.user = null;
      return false;
    }
    throw error;
  }
}
