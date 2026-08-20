export function json(data, status = 200, headers = {}) {
  return new Response(status === 204 ? null : JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers }
  });
}

export function ok(data, status = 200) { return json({ data }, status); }
export function collection(data, page = {}) { return json({ data, page: { cursor: null, nextCursor: null, hasMore: false, ...page } }); }
export function fail(code, message, status = 400, requestId, fields) {
  const error = { code, message };
  if (fields && Object.keys(fields).length) error.fields = fields;
  return json({ error, requestId }, status);
}
