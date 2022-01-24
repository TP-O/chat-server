import { env } from 'process';

export const appConfig = {
  port: parseInt(env.APP_PORT) || 2000,
};
