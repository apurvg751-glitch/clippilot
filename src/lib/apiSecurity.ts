import { NextResponse } from 'next/server';

/**
 * Safe JSON Body Parser:
 * Protects routes against unhandled SyntaxError crashes on empty bodies or malformed JSON payloads.
 */
export async function parseJsonBody<T = any>(
  req: Request
): Promise<{ data: T | null; error: string | null }> {
  try {
    const raw = await req.text();
    if (!raw || !raw.trim()) {
      return { data: null, error: 'Request body cannot be empty.' };
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { data: null, error: 'Request payload must be a JSON object.' };
    }

    return { data: parsed as T, error: null };
  } catch {
    return { data: null, error: 'Invalid or malformed JSON payload.' };
  }
}

/**
 * Type-Safe String Sanitizer:
 * Protects against crashes when clients pass non-string objects (e.g. { identifier: {} } -> .trim() crash).
 */
export function safeString(val: unknown, maxLength = 500, fallback = ''): string {
  if (typeof val !== 'string') {
    return fallback;
  }
  return val.trim().slice(0, maxLength);
}

/**
 * Type-Safe Integer Sanitizer
 */
export function safeInt(val: unknown, min = 0, max = Infinity, fallback = 0): number {
  const num = Number(val);
  if (isNaN(num) || !Number.isFinite(num)) {
    return fallback;
  }
  const intVal = Math.floor(num);
  if (intVal < min) return min;
  if (intVal > max) return max;
  return intVal;
}

/**
 * Strict Master Admin Authorization Checker:
 * - Strictly reads server-side ADMIN_PASSWORD or ADMIN_SECRET_KEY.
 * - FAIL-CLOSED: If no admin password is set in .env.local, REJECTS ALL ACCESS immediately.
 * - Zero hardcoded default passwords ('neymar' completely eliminated).
 * - Zero client-side NEXT_PUBLIC_ exposure.
 */
export function isMasterAdminAuthorized(req: Request, body?: any): boolean {
  const configuredSecret = (
    process.env.ADMIN_PASSWORD ||
    process.env.ADMIN_SECRET_KEY ||
    ''
  ).trim();

  // FAIL-CLOSED: If environment has no admin secret configured, reject everything
  if (!configuredSecret) {
    console.error('[Security Alert] ADMIN_PASSWORD is not configured in server environment. Rejecting access.');
    return false;
  }

  const headerKey = req.headers.get('x-admin-key');
  const authHeader = req.headers.get('authorization');
  const bearerKey = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const bodyKey = typeof body?.admin_key === 'string'
    ? body.admin_key
    : typeof body?.admin_password === 'string'
    ? body.admin_password
    : null;

  const provided = (headerKey || bearerKey || bodyKey || '').trim();

  if (!provided) {
    return false;
  }

  // Exact match against server configured secret only
  return provided === configuredSecret;
}

/**
 * Sanitized 500 Error Response:
 * Logs full error details securely on the server console, but returns an opaque generic error
 * to the frontend so internal database/Postgres details are NEVER leaked.
 */
export function safeInternalError(
  err: unknown,
  context: string,
  corsHeaders: Record<string, string> = {}
): NextResponse {
  const internalMessage = err instanceof Error ? err.message : String(err);
  const internalStack = err instanceof Error ? err.stack : undefined;

  console.error(`[Security Shield] [${context}] Internal Error:`, internalMessage, internalStack ? `\n${internalStack}` : '');

  return NextResponse.json(
    {
      success: false,
      error: 'An internal server error occurred. Please try again later.',
    },
    {
      status: 500,
      headers: corsHeaders,
    }
  );
}
