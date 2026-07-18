import IORedis from "ioredis";
import env from "./env";

export const redis = new IORedis(env.redis.url, {
  maxRetriesPerRequest: null,

  enableReadyCheck: true,

  lazyConnect: true,

  tls: {},
});

redis.on("connect", () => {
  console.log("🟢 Redis connected");
});

redis.on("ready", () => {
  console.log("🚀 Redis ready");
});

redis.on("error", (error) => {
  console.error("🔴 Redis error:", error);
});

redis.on("close", () => {
  console.warn("🟡 Redis connection closed");
});

export async function connectRedis() {
  if (redis.status === "ready") {
    return;
  }

  await redis.connect();
}

export async function disconnectRedis() {
  await redis.quit();
}

export default redis;