export function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('access-control-allow-origin', '*');
  res.setHeader('access-control-allow-methods', 'GET,POST,OPTIONS');
  res.setHeader('access-control-allow-headers', 'content-type');
  res.end(JSON.stringify(payload));
}

export function handleOptions(req, res) {
  if (req.method !== 'OPTIONS') return false;
  sendJson(res, 204, {});
  return true;
}

export async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

export function handleError(res, error) {
  const status = error.status || 500;
  const message = error.message || 'Server error';
  sendJson(res, status, {
    error: message,
    hint: getHint(message),
  });
}

function getHint(message) {
  if (message.includes('MONGODB_URI')) return 'Set MONGODB_URI in Vercel Project Settings -> Environment Variables and redeploy.';
  if (message.includes('querySrv') || message.includes('ENOTFOUND')) return 'MongoDB Atlas hostname cannot be resolved from the serverless function.';
  if (message.includes('Server selection timed out')) return 'Check MongoDB Atlas Network Access. For Vercel, allow 0.0.0.0/0 or use a provider integration.';
  if (message.includes('bad auth') || message.includes('Authentication failed')) return 'Check MongoDB username/password in MONGODB_URI.';
  return undefined;
}
