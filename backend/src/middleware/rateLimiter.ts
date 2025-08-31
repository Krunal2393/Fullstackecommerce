import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import Redis from "ioredis";

const redisClient = new Redis(process.env.REDIS_URL);

export const createRateLimiter = (opts?: { windowMs?: number; max?: number }) =>
  rateLimit({
    store: new RedisStore({
      sendCommand: (...args: string[]) => (redisClient as any).call(...args),
    }),
    windowMs: opts?.windowMs ?? 15 * 60 * 1000,
    max: opts?.max ?? 100,
    standardHeaders: true,
    legacyHeaders: false,
  });
