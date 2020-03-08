import * as redis from "redis";

export function connectRedisClient(redisConfig: { url: string }) {
  return new Promise((resolve, reject) => {
    const client = redis.createClient({
      url: redisConfig.url,
    });
    client.on("ready", () => {
      resolve(client);
    });
    client.on("error", error => {
      reject(error);
    });
  });
}
