import redis from "./redis";

export async function rateLimit(
  namespace: string,
  identifier: string,
  limit: number,
  windowMs: number,
): Promise<{ allowed: boolean; remaining: number; retryAfter: number }> {
  const key = `rate:${namespace}:${identifier}`;
  const now = Date.now();
  const windowStart = now - windowMs;

  const pipeline = redis.pipeline();
  pipeline.zremrangebyscore(key, "-inf", windowStart);
  pipeline.zadd(key, now, `${now}-${Math.random()}`);
  pipeline.zcount(key, "-inf", "+inf");
  pipeline.pexpire(key, windowMs);

  const results = await pipeline.exec();
  const count = (results?.[2]?.[1] as number) ?? 0;

  const allowed = count <= limit;
  const remaining = Math.max(0, limit - count);
  const retryAfter = allowed ? 0 : Math.ceil(windowMs / 1000);

  return { allowed, remaining, retryAfter };
}
