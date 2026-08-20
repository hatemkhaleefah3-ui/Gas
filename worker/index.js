import { handleApi, scheduledJobs } from './router.js';
import { handleExtendedApi } from './extended.js';
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      const extended = await handleExtendedApi(request, env);
      if (extended) return extended;
      return handleApi(request, env);
    }
    return env.ASSETS.fetch(request);
  },
  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(scheduledJobs(env));
  }
};
