if (window.__DAFATI_PAGES_PREVIEW__) {
  const { previewRequest } = await import('/client/preview-api.js');
  const nativeFetch = window.fetch.bind(window);
  window.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input instanceof Request ? input.url : String(input);
    const parsed = new URL(url, location.origin);
    if (parsed.origin === location.origin && parsed.pathname.startsWith('/api/')) {
      try {
        const payload = await previewRequest(parsed.pathname + parsed.search, init);
        const status = payload === null ? 204 : (init.method || 'GET').toUpperCase() === 'POST' && parsed.pathname === '/api/auth/signup' ? 201 : 200;
        return new Response(payload === null ? null : JSON.stringify(payload), {
          status,
          headers: payload === null ? {} : { 'content-type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({
          error: { code: error.code || 'PREVIEW_ERROR', message: error.message || 'Preview request failed', fields: error.fields || {} },
          requestId: error.requestId || 'pages-preview'
        }), { status: error.status || 500, headers: { 'content-type': 'application/json' } });
      }
    }
    return nativeFetch(input, init);
  };
}

const [{ createApp }, { initAdaptiveNavigation }, { initPrismExperience }] = await Promise.all([
  import('/client/app.js'),
  import('/client/navigation.js'),
  import('/client/prism-experience.js')
]);
const root = document.querySelector('#app');
initAdaptiveNavigation(root);
initPrismExperience(root);
await createApp(root);
