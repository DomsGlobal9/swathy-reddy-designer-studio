/**
 * Forwards /intake/* (rewritten here by vercel.json) to the Scaleezy CRM and adds the
 * portal key on the server, so the key never reaches the browser.
 * The body is streamed through untouched, so JSON and photo uploads (multipart) both work.
 */
const CRM = process.env.SCALEEZY_BASE_URL || 'https://crm-b-ry43.onrender.com';
const PASS_HEADERS = ['content-type', 'authorization', 'accept', 'x-forwarded-for'];

export default {
  async fetch(request) {
    const key = process.env.SCALEEZY_PORTAL_KEY;
    if (!key) {
      return Response.json({ error: 'Online booking is not set up yet.' }, { status: 503 });
    }

    const url = new URL(request.url);
    const path = url.searchParams.get('path') || '';
    url.searchParams.delete('path');

    const headers = new Headers({ 'X-Portal-Key': key });
    for (const name of PASS_HEADERS) {
      const value = request.headers.get(name);
      if (value) headers.set(name, value);
    }

    const res = await fetch(`${CRM}/intake/${path}${url.search}`, {
      method: request.method,
      headers,
      body: request.body,
      duplex: 'half'
    });

    return new Response(res.body, {
      status: res.status,
      headers: {
        'Content-Type': res.headers.get('content-type') || 'application/json',
        'Cache-Control': 'private, no-store'
      }
    });
  }
};
