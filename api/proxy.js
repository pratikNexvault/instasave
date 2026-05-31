// ============================================================
//  InstaSave — Vercel Serverless Proxy
//  Path: /api/proxy.js
//  Usage: /api/proxy?url=https://www.instagram.com/reel/...
//
//  Why proxy?
//  Browser cannot call http:// API directly (CORS + Mixed Content).
//  This serverless function runs on the server, calls the API,
//  and returns the result to the browser securely.
// ============================================================

export default async function handler(req, res) {
  // ── CORS headers ──
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  // Preflight
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Only GET
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { url } = req.query;

  // Validate
  if (!url) {
    return res.status(400).json({ success: false, error: 'Missing ?url= parameter' });
  }

  // Clean Instagram URL (remove tracking params like igsh=)
  let cleanUrl = url;
  try {
    const u = new URL(url);
    cleanUrl = u.origin + u.pathname.replace(/\/$/, '') + '/';
  } catch (_) {
    // keep original
  }

  // Validate Instagram URL pattern
  const validInsta = /^https?:\/\/(www\.)?instagram\.com\/(p|reel|tv|stories|reels)\/[A-Za-z0-9_-]+/.test(cleanUrl);
  if (!validInsta) {
    return res.status(400).json({ success: false, error: 'Invalid Instagram URL' });
  }

  try {
    const apiEndpoint = `http://69.62.84.105:7726/api/reel?url=${encodeURIComponent(cleanUrl)}`;

    const apiRes = await fetch(apiEndpoint, {
      method: 'GET',
      headers: {
        'User-Agent': 'InstaSave/1.0',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(15000), // 15s timeout
    });

    if (!apiRes.ok) {
      return res.status(502).json({
        success: false,
        error: `Upstream API error: ${apiRes.status}`,
      });
    }

    const data = await apiRes.json();

    // Pass through the response
    return res.status(200).json(data);

  } catch (err) {
    // Timeout or network error
    const isTimeout = err.name === 'TimeoutError' || err.name === 'AbortError';
    return res.status(504).json({
      success: false,
      error: isTimeout ? 'API request timed out. Please try again.' : 'Failed to fetch media. Please try again.',
    });
  }
}

