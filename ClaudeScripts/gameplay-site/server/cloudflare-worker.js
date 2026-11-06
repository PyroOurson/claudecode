const UPSTREAM = 'uafouyvtcijptspjbsqf.supabase.co';
const PATHS = /^\/(rest|auth|realtime|storage|functions|graphql)\/v1(\/|$)/;
const METHODS = new Set(['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']);

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/health') {
      return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
    }
    if (!PATHS.test(url.pathname)) {
      return new Response('gameplay relay', { status: 404, headers: { 'X-Content-Type-Options': 'nosniff' } });
    }
    if (!METHODS.has(request.method)) {
      return new Response('method not allowed', { status: 405 });
    }
    url.protocol = 'https:';
    url.hostname = UPSTREAM;
    url.port = '';
    const headers = new Headers(request.headers);
    headers.delete('Host');
    headers.delete('X-Forwarded-Host');
    headers.delete('X-Real-IP');
    headers.delete('Forwarded');
    const ip = request.headers.get('CF-Connecting-IP');
    if (ip) headers.set('X-Forwarded-For', ip); else headers.delete('X-Forwarded-For');
    const init = { method: request.method, headers, redirect: 'manual' };
    if (request.method !== 'GET' && request.method !== 'HEAD') init.body = request.body;
    return fetch(new Request(url.toString(), init));
  }
};
