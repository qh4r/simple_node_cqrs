import { loadEnvs } from "./env";

loadEnvs();

const createRedisConfig = (env: any) => ({
  url: env.REDIS_URL,
});

const config = createRedisConfig(process.env);

export = config;
