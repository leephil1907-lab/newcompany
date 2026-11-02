type Entry = { count: number; resetAt: number };
const store = new Map<string, Entry>();
export function rateLimit(key: string, limit=8, windowMs=60_000) {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || entry.resetAt <= now) { store.set(key,{count:1,resetAt:now+windowMs}); return true; }
  if (entry.count >= limit) return false;
  entry.count += 1;
  if (store.size > 5000) for (const [k,v] of store) if (v.resetAt <= now) store.delete(k);
  return true;
}
export function clientKey(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}
