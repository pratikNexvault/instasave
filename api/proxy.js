// InstaSave — Vercel Serverless Proxy
// File: api/proxy.js
// Route: /api/proxy?url=INSTAGRAM_URL

export default async function handler(req, res) {
  // CORS headers — allow all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, no-cache');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' });

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ success: false, error: 'Missing ?url= parameter' });
  }

  // Clean URL — remove tracking params like igsh=
  let cleanUrl = url;
  try {
    const u = new URL(url);
    cleanUrl = u.origin + u.pathname.replace(/\/$/, '') + '/';
  } catch (_) {}

  // Must be a valid Instagram URL
  const valid = /instagram\.com\/(p|reel|tv|stories|reels)\/[A-Za-z0-9_-]+/.test(cleanUrl);
  if (!valid) {
    return res.status(400).json({ success: false, error: 'Invalid Instagram URL' });
  }

  const apiUrl = `http://69.62.84.105:7726/api/reel?url=${encodeURIComponent(cleanUrl)}`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000); // 20s timeout

    const apiRes = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; InstaSave/1.0)',
        'Accept': 'application/json',
      }
    });

    clearTimeout(timer);

    if (!apiRes.ok) {
      return res.status(502).json({
        success: false,
        error: `Upstream error: ${apiRes.status} ${apiRes.statusText}`
      });
    }

    const data = await apiRes.json();
    return res.status(200).json(data);

  } catch (err) {
    const isTimeout = err.name === 'AbortError';
    return res.status(504).json({
      success: false,
      error: isTimeout
        ? 'Request timed out. The media server took too long to respond.'
        : `Fetch failed: ${err.message}`
    });
  }
}
