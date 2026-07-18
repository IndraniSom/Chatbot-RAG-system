import { redis } from "../../config/redis";

/**
 * Thin distributed lock built on ioredis `SET NX PX`.
 *
 *   acquire(key):  SET key "locked" NX PX <ttl>  → returns true if we got it
 *   release(key):  DEL key                       → best-effort unlock
 *
 * No token / Lua release — fine for short-lived locks (e.g. "don't crawl
 * the same website twice in parallel"). For long-lived, owner-bound locks
 * use a proper Redlock-style implementation.
 */
class RedisLockService {
  async acquire(key: string, ttl = 1000 * 60 * 30): Promise<boolean> {
    const result = await redis.set(key, "locked", "PX", ttl, "NX");
    return result === "OK";
  }

  async release(key: string): Promise<void> {
    await redis.del(key);
  }
}

export default new RedisLockService();