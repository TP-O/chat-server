import * as redisStore from 'cache-manager-redis-store';
import { CacheModuleOptions } from '@nestjs/common';
import { env } from 'process';

export const cacheConfig: CacheModuleOptions & {
  password?: string;
  url?: string;
} = {
  store: redisStore,
  host: env.REDIS_HOST || 'redis',
  port: parseInt(env.REDIS_PORT, 10) || 6379,
  password: env.REDIS_PASSWORD || 'redis_password',
  ttl: 60 * 60,
  url: `redis://${env.REDIS_HOST || 'redis'}:${
    parseInt(env.REDIS_PORT, 10) || 6379
  }`,
};
