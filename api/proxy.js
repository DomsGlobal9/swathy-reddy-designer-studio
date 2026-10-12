/**
 * Vercel Serverless Function Proxy for Scaleezy CRM Customer Portal API
 *
 * Runs server-side on Vercel's Edge/Serverless runtime to:
 * 1. Eliminate all browser CORS preflight errors.
 * 2. Prevent 405 Method Not Allowed errors on static single-page apps.
 * 3. Securely forward WhatsApp OTP requests, verification, and lead intakes to Render.
 */

export default async function handler(req, res) {
  // Set permissive CORS headers for client browser
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Portal-Key, Authorization, Accept, X-Requested-With');

  // Handle browser preflight OPTIONS immediately
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 1. Resolve path segment
    const rawPath = req.query.path;
    const pathStr = Array.isArray(rawPath) ? rawPath.join('/') : (rawPath || '');
    const cleanPath = String(pathStr).replace(/^\/+/, '');

    // 2. Preserve any additional query parameters
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(req.query)) {
      if (key !== 'path') {
        queryParams.set(key, String(value));
      }
    }
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

    // 3. Construct target URL with trailing slash (required by Django/Render)
    const baseTarget = `https://crm-b-ry43.onrender.com/intake/${cleanPath}`;
    const targetWithSlash = (baseTarget.endsWith('/') || cleanPath === '') ? baseTarget : `${baseTarget}/`;
    const finalUrl = `${targetWithSlash}${queryString}`;

    // 4. Construct request headers
    const forwardHeaders = {
      'Content-Type': req.headers['content-type'] || 'application/json',
      'Accept': 'application/json'
    };

    // Forward or inject Portal Key
    const portalKey =
      req.headers['x-portal-key'] ||
      process.env.VITE_SCALEEZY_PORTAL_KEY ||
      process.env.VITE_BOUTIQUE_API_KEY ||
      '8c31973ce1ed965b.y1NUjpQTgV02lM9e4uTYuwgbnyZtvXFH';

    if (portalKey) {
      forwardHeaders['X-Portal-Key'] = portalKey;
    }

    if (req.headers['authorization']) {
      forwardHeaders['Authorization'] = req.headers['authorization'];
    }

    // 5. Build body for mutating requests
    const fetchOptions = {
      method: req.method,
      headers: forwardHeaders
    };

    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      if (typeof req.body === 'string') {
        fetchOptions.body = req.body;
      } else if (req.body && typeof req.body === 'object') {
        fetchOptions.body = JSON.stringify(req.body);
      }
    }

    // 6. Execute server-to-server request
    const response = await fetch(finalUrl, fetchOptions);
    const responseText = await response.text();

    res.status(response.status);
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
    return res.send(responseText);
  } catch (error) {
    console.error('[Scaleezy Vercel Proxy Error]:', error);
    return res.status(502).json({
      error: 'Proxy Error',
      message: error?.message || 'Failed to communicate with atelier intake service.'
    });
  }
}
