const UPSTREAM = 'uafouyvtcijptspjbsqf.supabase.co';
const PATHS = /^\/(rest|auth|realtime|storage|functions|graphql)\/v1(\/|$)/;

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/health') {
      return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' } });
    }
    if (!PATHS.test(url.pathname)) {
      return new Response('gameplay relay', { status: 404 });
    }
    url.protocol = 'https:';
    url.hostname = UPSTREAM;
    url.port = '';
    const headers = new Headers(request.headers);
    headers.delete('Host');
    headers.delete('X-Forwarded-Host');
    const init = { method: request.method, headers, redirect: 'manual' };
    if (request.method !== 'GET' && request.method !== 'HEAD') init.body = request.body;
    return fetch(new Request(url.toString(), init));
  }
};
