/**
 * Lightweight In-Memory Sliding-Window Rate Limiter
 * - Requires ZERO external dependencies, Redis, or databases.
 * - Protects public feedback submission and metric tracking from spam / denial of service.
 * - Periodically purges stale entries to prevent memory leaks.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitRecord>();

// Periodic cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of memoryStore.entries()) {
      if (now > record.resetAt) {
        memoryStore.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref?.();
}

/**
 * Extracts best-effort client IP from incoming request headers
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0].trim();
    if (first) return first;
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp && realIp.trim()) return realIp.trim();

  const cfIp = req.headers.get('cf-connecting-ip');
  if (cfIp && cfIp.trim()) return cfIp.trim();

  return '127.0.0.1';
}

/**
 * Rate limit check:
 * @param key unique bucket key (e.g. `feedback:${ip}` or `metric:${ip}`)
 * @param maxHits maximum allowed requests within window
 * @param windowSeconds time window in seconds
 * @returns { allowed: boolean, remaining: number, resetIn: number }
 */
export function checkRateLimit(
  key: string,
  maxHits = 30,
  windowSeconds = 60
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const existing = memoryStore.get(key);

  if (!existing || now > existing.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxHits - 1, resetIn: windowSeconds };
  }

  if (existing.count >= maxHits) {
    const resetIn = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    return { allowed: false, remaining: 0, resetIn };
  }

  existing.count += 1;
  const resetIn = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
  return { allowed: true, remaining: maxHits - existing.count, resetIn };
}
