import { loadEnvs } from "./env";

loadEnvs();

const makeApiConfig = (env: any) => ({
  appName: "boilerplate_api",
  port: "1337",
  accessTokenKey: env.ACCESS_TOKEN_KEY,
});

const apiConfig = makeApiConfig(process.env);

export = apiConfig;
