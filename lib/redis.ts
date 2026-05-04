import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const memory = new Map<string, { count: number; resetAt: number }>();

export function getRedis() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

export async function rateLimit(key: string, max: number, window: "1 m" | "1 h") {
  const redis = getRedis();
  if (redis) {
    const limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(max, window),
      analytics: true,
    });
    return limiter.limit(key);
  }

  const windowMs = window === "1 h" ? 60 * 60 * 1000 : 60 * 1000;
  const now = Date.now();
  const current = memory.get(key);
  if (!current || current.resetAt <= now) {
    memory.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, limit: max, remaining: max - 1, reset: now + windowMs };
  }

  current.count += 1;
  memory.set(key, current);

  return {
    success: current.count <= max,
    limit: max,
    remaining: Math.max(max - current.count, 0),
    reset: current.resetAt,
  };
}
