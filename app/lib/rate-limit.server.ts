type Bucket = { count: number; resetAt: number };

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true } as const;
  }
  if (bucket.count >= MAX_REQUESTS) return { allowed: false, retryInMs: bucket.resetAt - now } as const;
  bucket.count += 1;
  return { allowed: true } as const;
}


