import { env } from 'process';

export const appConfig = {
  port: Number(env.APP_PORT || 2000),
};
