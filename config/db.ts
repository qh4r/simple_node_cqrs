import { loadEnvs } from "./env";

loadEnvs();

const createDbConfigFromEnvs = (env: any) => ({
  type: "postgres",
  url: env.POSTGRES_URL,
  synchronize: false,
  logging: true,
  subscribers: ["/app/build/src/**/*.model-subscriber.js"],
  entities: ["/app/build/src/**/*.model.js"],
  migrations: ["/app/build/src/migrations/*"],
  cli: {
    migrationsDir: "src/migrations",
  },
});

const config = createDbConfigFromEnvs(process.env);

export = config;
