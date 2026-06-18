import { NextResponse } from 'next/server';

export function json(status: number, payload: unknown) {
  return NextResponse.json(payload, {
    status,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET,POST,OPTIONS',
      'access-control-allow-headers': 'content-type',
    },
  });
}

export function options() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET,POST,OPTIONS',
      'access-control-allow-headers': 'content-type',
    },
  });
}

export function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'Server error';
  return json(500, {
    error: message,
    hint: getHint(message),
  });
}

function getHint(message: string) {
  if (message.includes('MONGODB_URI')) return 'Set MONGODB_URI in Vercel Project Settings -> Environment Variables and redeploy.';
  if (message.includes('querySrv') || message.includes('ENOTFOUND')) return 'MongoDB Atlas hostname cannot be resolved from the serverless function.';
  if (message.includes('Server selection timed out')) return 'Check MongoDB Atlas Network Access. For Vercel, allow 0.0.0.0/0 or use a provider integration.';
  if (message.includes('bad auth') || message.includes('Authentication failed')) return 'Check MongoDB username/password in MONGODB_URI.';
  return undefined;
}
